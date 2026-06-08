import Form from "../models/Form";
import FormSection from "../models/FormSection";
import FormItem from "../models/FormItem";
import { slugify } from "../utils/slugify";
import { NotFoundError, ValidationError } from "../utils/helpers";
import { calculateItemStatus } from "../utils/helpers";
import {
  IFormWithSections,
  ISectionWithItems,
  IItemWithStatus,
  ISectionWithStatus,
  CreateFormDto,
  UpdateFormDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateItemDto,
  UpdateItemDto,
  ReorderDto,
} from "../types/form.types";
import mongoose from "mongoose";

export class FormService {
  // ─── Forms ───────────────────────────────────────────────

  async create(data: CreateFormDto, adminId: string) {
    const slug = slugify(data.name);
    if (!slug) {
      throw new ValidationError(
        "Не удалось сгенерировать slug из названия формы",
      );
    }

    const existing = await Form.findOne({ slug });
    if (existing) {
      throw new ValidationError("Форма с таким названием уже существует");
    }

    const form = await Form.create({
      name: data.name,
      slug,
      description: data.description,
      createdBy: adminId,
      ...(data.privacyPolicy ? { privacyPolicy: data.privacyPolicy } : {}),
    });

    return form;
  }

  async getAll(adminId: string) {
    return Form.find({ createdBy: adminId }).sort({ updatedAt: -1 });
  }

  async getById(id: string) {
    const form = await Form.findById(id);
    if (!form) throw new NotFoundError("Форма не найдена");

    const sections = await FormSection.find({ formId: id })
      .sort({ order: 1 })
      .lean();

    const sectionsWithItems: ISectionWithItems[] = [];

    for (const section of sections) {
      const items = await FormItem.find({ sectionId: section._id })
        .sort({ order: 1 })
        .lean();
      sectionsWithItems.push({
        ...section,
        items,
      } as unknown as ISectionWithItems);
    }

    return {
      ...form.toObject(),
      sections: sectionsWithItems,
    } as IFormWithSections;
  }

  async update(id: string, data: UpdateFormDto) {
    const form = await Form.findById(id);
    if (!form) throw new NotFoundError("Форма не найдена");

    if (data.name) {
      const slug = slugify(data.name);
      const existing = await Form.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        throw new ValidationError("Форма с таким названием уже существует");
      }
      form.slug = slug;
    }

    if (data.name) form.name = data.name;
    if (data.description !== undefined) form.description = data.description;
    if (data.privacyPolicy !== undefined)
      form.privacyPolicy = data.privacyPolicy;

    await form.save();
    return form;
  }

  async delete(id: string) {
    const form = await Form.findById(id);
    if (!form) throw new NotFoundError("Форма не найдена");

    const sections = await FormSection.find({ formId: id });
    const sectionIds = sections.map((s) => s._id);

    await FormItem.deleteMany({ sectionId: { $in: sectionIds } });
    await FormSection.deleteMany({ formId: id });
    await form.deleteOne();

    return { message: "Форма удалена" };
  }

  async publish(id: string) {
    const form = await Form.findById(id);
    if (!form) throw new NotFoundError("Форма не найдена");

    const sectionCount = await FormSection.countDocuments({ formId: id });
    if (sectionCount === 0) {
      throw new ValidationError(
        "Форма должна содержать минимум 1 раздел для публикации",
      );
    }

    const sections = await FormSection.find({ formId: id });
    const itemCount = await FormItem.countDocuments({
      sectionId: { $in: sections.map((s) => s._id) },
    });
    if (itemCount === 0) {
      throw new ValidationError(
        "Форма должна содержать минимум 1 элемент для публикации",
      );
    }

    form.isPublished = true;
    await form.save();
    return form;
  }

  async unpublish(id: string) {
    const form = await Form.findById(id);
    if (!form) throw new NotFoundError("Форма не найдена");

    form.isPublished = false;
    await form.save();
    return form;
  }

  async getPublicForm(slug: string) {
    const form = await Form.findOne({ slug, isPublished: true });
    if (!form) throw new NotFoundError("Форма не найдена или не опубликована");

    const sections = await FormSection.find({ formId: form._id })
      .sort({ order: 1 })
      .lean();
    const sectionsWithStatus: ISectionWithStatus[] = [];

    for (const section of sections) {
      const items = await FormItem.find({
        sectionId: section._id,
        isActive: true,
      })
        .sort({ order: 1 })
        .lean();

      const itemsWithStatus: IItemWithStatus[] = items.map((item: any) => ({
        ...item,
        status: calculateItemStatus(
          item.currentQuantity,
          item.requiredQuantity,
        ),
      }));

      const isFull = itemsWithStatus.every((item) => item.status === "full");

      sectionsWithStatus.push({
        ...section,
        items: itemsWithStatus,
        isFull,
      } as unknown as ISectionWithStatus);
    }

    return {
      form: {
        id: form._id,
        name: form.name,
        description: form.description,
        privacyPolicy: form.privacyPolicy,
        sections: sectionsWithStatus.map((s) => ({
          id: s._id,
          name: s.name,
          description: s.description,
          order: s.order,
          items: s.items.map((i: any) => ({
            id: i._id,
            label: i.label,
            description: i.description,
            type: i.type,
            requiredQuantity: i.requiredQuantity,
            currentQuantity: i.currentQuantity,
            unit: i.unit,
            status: i.status,
          })),
        })),
      },
    };
  }

  // ─── Sections ────────────────────────────────────────────

  async createSection(formId: string, data: CreateSectionDto) {
    const form = await Form.findById(formId);
    if (!form) throw new NotFoundError("Форма не найдена");

    const maxOrder = await FormSection.findOne({ formId })
      .sort({ order: -1 })
      .select("order");
    const order = (maxOrder?.order ?? 0) + 1;

    const section = await FormSection.create({
      formId,
      name: data.name,
      description: data.description,
      order,
    });

    return section;
  }

  async updateSection(
    formId: string,
    sectionId: string,
    data: UpdateSectionDto,
  ) {
    const section = await FormSection.findOne({ _id: sectionId, formId });
    if (!section) throw new NotFoundError("Раздел не найден");

    if (data.name) section.name = data.name;
    if (data.description !== undefined) section.description = data.description;
    if (data.order !== undefined) section.order = data.order;

    await section.save();
    return section;
  }

  async deleteSection(formId: string, sectionId: string) {
    const section = await FormSection.findOne({ _id: sectionId, formId });
    if (!section) throw new NotFoundError("Раздел не найден");

    await FormItem.deleteMany({ sectionId });
    await section.deleteOne();

    return { message: "Раздел удалён" };
  }

  async reorderSections(formId: string, data: ReorderDto) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < data.orderedIds.length; i++) {
        await FormSection.findOneAndUpdate(
          { _id: data.orderedIds[i], formId },
          { order: i + 1 },
          { session },
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return { message: "Порядок разделов обновлён" };
  }

  // ─── Items ───────────────────────────────────────────────

  async createItem(sectionId: string, data: CreateItemDto) {
    const section = await FormSection.findById(sectionId);
    if (!section) throw new NotFoundError("Раздел не найден");

    const maxOrder = await FormItem.findOne({ sectionId })
      .sort({ order: -1 })
      .select("order");
    const order = (maxOrder?.order ?? 0) + 1;

    const item = await FormItem.create({
      sectionId,
      label: data.label,
      description: data.description,
      type: data.type || "item",
      requiredQuantity: data.requiredQuantity || 1,
      unit: data.unit,
      order,
    });

    return item;
  }

  async updateItem(sectionId: string, itemId: string, data: UpdateItemDto) {
    const item = await FormItem.findOne({ _id: itemId, sectionId });
    if (!item) throw new NotFoundError("Элемент не найден");

    if (data.label) item.label = data.label;
    if (data.description !== undefined) item.description = data.description;
    if (data.type) item.type = data.type;
    if (data.requiredQuantity !== undefined)
      item.requiredQuantity = data.requiredQuantity;
    if (data.unit !== undefined) item.unit = data.unit;
    if (data.isActive !== undefined) item.isActive = data.isActive;

    await item.save();
    return item;
  }

  async deleteItem(sectionId: string, itemId: string) {
    const item = await FormItem.findOne({ _id: itemId, sectionId });
    if (!item) throw new NotFoundError("Элемент не найден");

    await item.deleteOne();
    return { message: "Элемент удалён" };
  }

  async reorderItems(sectionId: string, data: ReorderDto) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < data.orderedIds.length; i++) {
        await FormItem.findOneAndUpdate(
          { _id: data.orderedIds[i], sectionId },
          { order: i + 1 },
          { session },
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return { message: "Порядок элементов обновлён" };
  }
}

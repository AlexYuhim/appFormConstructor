import Form from "../models/Form";
import FormItem from "../models/FormItem";
import FormSection from "../models/FormSection";
import Submission from "../models/Submission";
import SelectedItem from "../models/SelectedItem";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../utils/helpers";
import { calculateItemStatus } from "../utils/helpers";
import { SubmitFormDto, SubmitFormResponse } from "../types/submission.types";
import { SocketService } from "./socket.service";

export class SubmissionService {
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  async submit(
    slug: string,
    data: SubmitFormDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SubmitFormResponse> {
    // 1. Find form
    const form = await Form.findOne({ slug, isPublished: true });
    if (!form) {
      throw new NotFoundError("Форма не найдена или не опубликована");
    }

    // 2. Validate basic fields
    if (
      !data.userName ||
      data.userName.length < 2 ||
      data.userName.length > 100
    ) {
      throw new ValidationError("Имя должно содержать от 2 до 100 символов");
    }

    if (
      !data.userSurname ||
      data.userSurname.length < 2 ||
      data.userSurname.length > 100
    ) {
      throw new ValidationError(
        "Фамилия должна содержать от 2 до 100 символов",
      );
    }

    if (!data.consentGiven) {
      throw new ValidationError(
        "Необходимо дать согласие на обработку персональных данных",
      );
    }

    const hasCustomText = data.customText && data.customText.trim().length > 0;

    if (!data.selectedItems || data.selectedItems.length === 0) {
      if (!hasCustomText) {
        throw new ValidationError("Выберите элемент или напишите свой вариант");
      }
      // Allow submission with only custom text
      const submission = await Submission.create({
        formId: form._id,
        userName: data.userName,
        userSurname: data.userSurname,
        consentGiven: data.consentGiven,
        customText: data.customText,
        ipAddress,
        userAgent,
      });

      this.socketService.emitNewSubmission(form._id.toString(), {
        userName: data.userName,
        itemLabels: ["Свой вариант: " + data.customText],
      });

      return {
        submission: {
          id: submission._id.toString(),
          formId: form._id.toString(),
          userName: submission.userName,
          userSurname: submission.userSurname,
          submittedAt: submission.submittedAt,
        },
      };
    }

    // 3. Check one item per section constraint
    const sectionIds = new Set(data.selectedItems.map((si) => si.sectionId));
    if (sectionIds.size !== data.selectedItems.length) {
      throw new ValidationError(
        "Можно выбрать только один элемент в каждом разделе",
      );
    }

    // 4. Verify all sections belong to this form
    const sections = await FormSection.find({
      formId: form._id,
    });
    const validSectionIds = new Set(sections.map((s) => s._id.toString()));

    for (const si of data.selectedItems) {
      if (!validSectionIds.has(si.sectionId)) {
        throw new ValidationError(
          `Раздел ${si.sectionId} не принадлежит этой форме`,
        );
      }
    }

    // 5. Atomic update with limit check for each item
    const updatedItems: Array<{
      item: any;
      quantity: number;
      sectionId: string;
    }> = [];

    for (const si of data.selectedItems) {
      const item = await FormItem.findOneAndUpdate(
        {
          _id: si.itemId,
          isActive: true,
          $expr: {
            $lte: [
              { $add: ["$currentQuantity", si.quantity || 1] },
              "$requiredQuantity",
            ],
          },
        },
        { $inc: { currentQuantity: si.quantity || 1 } },
        { new: true },
      );

      if (!item) {
        // Check if item exists at all
        const existingItem = await FormItem.findById(si.itemId);
        if (!existingItem) {
          throw new NotFoundError(`Элемент ${si.itemId} не найден`);
        }
        throw new ConflictError(
          `Элемент "${existingItem.label}" достиг лимита`,
        );
      }

      updatedItems.push({
        item,
        quantity: si.quantity || 1,
        sectionId: si.sectionId,
      });
    }

    // 6. Create submission
    const submission = await Submission.create({
      formId: form._id,
      userName: data.userName,
      userSurname: data.userSurname,
      consentGiven: data.consentGiven,
      ipAddress,
      userAgent,
      ...(data.customText ? { customText: data.customText } : {}),
    });

    // 7. Create selected items
    const selectedItemDocs = updatedItems.map((ui) => ({
      submissionId: submission._id,
      itemId: ui.item._id,
      quantity: ui.quantity,
      sectionId: ui.sectionId,
    }));

    await SelectedItem.create(selectedItemDocs);

    // 8. Emit WebSocket events
    for (const ui of updatedItems) {
      const status = calculateItemStatus(
        ui.item.currentQuantity,
        ui.item.requiredQuantity,
      );

      this.socketService.emitItemStatusChanged(form._id.toString(), {
        itemId: ui.item._id.toString(),
        currentQuantity: ui.item.currentQuantity,
        requiredQuantity: ui.item.requiredQuantity,
        status,
      });

      // Check if section is now filled
      if (status === "full") {
        const sectionItems = await FormItem.find({
          sectionId: ui.sectionId,
          isActive: true,
        });
        const allFull = sectionItems.every(
          (i) => i.currentQuantity >= i.requiredQuantity,
        );
        if (allFull) {
          this.socketService.emitSectionFilled(form._id.toString(), {
            sectionId: ui.sectionId,
            formId: form._id.toString(),
          });
        }
      }
    }

    // Emit new submission notification to admins
    const itemLabels = updatedItems.map((ui) => ui.item.label);
    this.socketService.emitNewSubmission(form._id.toString(), {
      userName: data.userName,
      itemLabels,
    });

    return {
      submission: {
        id: submission._id.toString(),
        formId: form._id.toString(),
        userName: submission.userName,
        userSurname: submission.userSurname,
        submittedAt: submission.submittedAt,
      },
    };
  }
}

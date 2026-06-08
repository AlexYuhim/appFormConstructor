import client from "./client";
import type {
  Form,
  FormWithSections,
  FormSection,
  FormItem,
  CreateFormDto,
  UpdateFormDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateItemDto,
  UpdateItemDto,
  ReorderDto,
} from "../types/form.types";

export const formsApi = {
  // ─── Forms ──────────────────────────────────────────────
  getAll: async () => {
    const { data } = await client.get<Form[]>("/admin/forms");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await client.get<FormWithSections>(`/admin/forms/${id}`);
    return data;
  },

  create: async (dto: CreateFormDto) => {
    const { data } = await client.post<Form>("/admin/forms", dto);
    return data;
  },

  update: async (id: string, dto: UpdateFormDto) => {
    const { data } = await client.put<Form>(`/admin/forms/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await client.delete(`/admin/forms/${id}`);
    return data;
  },

  publish: async (id: string) => {
    const { data } = await client.post<Form>(`/admin/forms/${id}/publish`);
    return data;
  },

  unpublish: async (id: string) => {
    const { data } = await client.post<Form>(`/admin/forms/${id}/unpublish`);
    return data;
  },

  // ─── Sections ───────────────────────────────────────────
  createSection: async (formId: string, dto: CreateSectionDto) => {
    const { data } = await client.post<FormSection>(
      `/admin/forms/${formId}/sections`,
      dto,
    );
    return data;
  },

  updateSection: async (
    formId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ) => {
    const { data } = await client.put<FormSection>(
      `/admin/forms/${formId}/sections/${sectionId}`,
      dto,
    );
    return data;
  },

  deleteSection: async (formId: string, sectionId: string) => {
    const { data } = await client.delete(
      `/admin/forms/${formId}/sections/${sectionId}`,
    );
    return data;
  },

  reorderSections: async (formId: string, dto: ReorderDto) => {
    const { data } = await client.put(
      `/admin/forms/${formId}/sections/reorder`,
      dto,
    );
    return data;
  },

  // ─── Items ──────────────────────────────────────────────
  createItem: async (formId: string, sectionId: string, dto: CreateItemDto) => {
    const { data } = await client.post<FormItem>(
      `/admin/forms/${formId}/sections/${sectionId}/items`,
      dto,
    );
    return data;
  },

  updateItem: async (
    formId: string,
    sectionId: string,
    itemId: string,
    dto: UpdateItemDto,
  ) => {
    const { data } = await client.put<FormItem>(
      `/admin/forms/${formId}/sections/${sectionId}/items/${itemId}`,
      dto,
    );
    return data;
  },

  deleteItem: async (formId: string, sectionId: string, itemId: string) => {
    const { data } = await client.delete(
      `/admin/forms/${formId}/sections/${sectionId}/items/${itemId}`,
    );
    return data;
  },

  reorderItems: async (formId: string, sectionId: string, dto: ReorderDto) => {
    const { data } = await client.put(
      `/admin/forms/${formId}/sections/${sectionId}/items/reorder`,
      dto,
    );
    return data;
  },
};

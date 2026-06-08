export type ItemStatus = "available" | "limited" | "full";

export interface Form {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  createdBy: string;
  privacyPolicy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormSection {
  _id: string;
  formId: string;
  name: string;
  description?: string;
  order: number;
}

export interface FormItem {
  _id: string;
  sectionId: string;
  label: string;
  description?: string;
  type: "food" | "item" | "service";
  requiredQuantity: number;
  currentQuantity: number;
  unit?: string;
  isActive: boolean;
  order: number;
}

export interface FormItemWithStatus extends FormItem {
  status: ItemStatus;
}

export interface SectionWithItems extends FormSection {
  items: FormItemWithStatus[];
  isFull: boolean;
}

export interface FormWithSections extends Form {
  sections: SectionWithItems[];
}

export interface PublicFormResponse {
  form: {
    id: string;
    name: string;
    description?: string;
    privacyPolicy?: string;
    sections: Array<{
      id: string;
      name: string;
      description?: string;
      order: number;
      items: Array<{
        id: string;
        label: string;
        description?: string;
        type: string;
        requiredQuantity: number;
        currentQuantity: number;
        unit?: string;
        status: ItemStatus;
      }>;
    }>;
  };
}

export interface CreateFormDto {
  name: string;
  description?: string;
  privacyPolicy?: string;
}

export interface UpdateFormDto {
  name?: string;
  description?: string;
  privacyPolicy?: string;
}

export interface CreateSectionDto {
  name: string;
  description?: string;
}

export interface UpdateSectionDto {
  name?: string;
  description?: string;
}

export interface CreateItemDto {
  label: string;
  description?: string;
  type?: "food" | "item" | "service";
  requiredQuantity: number;
  unit?: string;
}

export interface UpdateItemDto {
  label?: string;
  description?: string;
  type?: "food" | "item" | "service";
  requiredQuantity?: number;
  unit?: string;
  isActive?: boolean;
}

export interface ReorderDto {
  orderedIds: string[];
}

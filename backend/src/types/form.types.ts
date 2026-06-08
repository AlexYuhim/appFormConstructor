export type ItemStatus = "available" | "limited" | "full";

export interface IFormWithSections {
  _id: any;
  name: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  createdBy: any;
  privacyPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
  sections: ISectionWithItems[];
}

export interface ISectionWithItems {
  _id: any;
  formId: any;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  items: any[];
}

export interface IItemWithStatus {
  _id: any;
  sectionId: any;
  label: string;
  description?: string;
  type: string;
  requiredQuantity: number;
  currentQuantity: number;
  unit?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
}

export interface ISectionWithStatus {
  _id: any;
  formId: any;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  items: IItemWithStatus[];
  isFull: boolean;
}

export const calculateItemStatus = (
  currentQuantity: number,
  requiredQuantity: number,
): ItemStatus => {
  if (currentQuantity >= requiredQuantity) return "full";
  if (currentQuantity >= requiredQuantity * 0.8) return "limited";
  return "available";
};

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
  order?: number;
}

export interface CreateItemDto {
  label: string;
  description?: string;
  type: "food" | "item" | "service";
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

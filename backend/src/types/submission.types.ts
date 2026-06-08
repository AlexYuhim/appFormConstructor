import { Types } from "mongoose";

export interface SubmitFormDto {
  userName: string;
  userSurname: string;
  consentGiven: boolean;
  selectedItems: Array<{
    itemId: string;
    sectionId: string;
    quantity: number;
  }>;
  customText?: string;
}

export interface SubmitFormResponse {
  submission: {
    id: string;
    formId: string;
    userName: string;
    userSurname: string;
    submittedAt: Date;
  };
}

export interface IStatisticsResponse {
  formId: string;
  totalSubmissions: number;
  sections: Array<{
    sectionId: string;
    sectionName: string;
    totalItems: number;
    filledItems: number;
    items: Array<{
      itemId: string;
      label: string;
      type: string;
      requiredQuantity: number;
      currentQuantity: number;
      unit?: string;
      progress: number;
      status: "available" | "limited" | "full";
    }>;
  }>;
}

export interface IItemStatusChanged {
  itemId: string;
  currentQuantity: number;
  requiredQuantity: number;
  status: "available" | "limited" | "full";
}

export interface ISectionFilled {
  sectionId: string;
  formId: string;
}

export interface IFormUpdated {
  formId: string;
  action: "published" | "updated" | "deleted";
}

export interface ISubmissionNew {
  userName: string;
  itemLabels: string[];
}

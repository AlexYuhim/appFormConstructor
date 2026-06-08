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
    submittedAt: string;
  };
}

export interface StatisticsResponse {
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

export interface Submission {
  id: string;
  userName: string;
  userSurname: string;
  submittedAt: string;
  selectedItems: Array<{
    itemId: string;
    label: string;
    type: string;
    unit?: string;
    quantity: number;
    sectionId: string;
  }>;
}

export interface PaginatedSubmissions {
  submissions: Submission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ItemStatusChanged {
  itemId: string;
  currentQuantity: number;
  requiredQuantity: number;
  status: "available" | "limited" | "full";
}

export interface SectionFilled {
  sectionId: string;
  formId: string;
}

export interface SubmissionNew {
  userName: string;
  itemLabels: string[];
}

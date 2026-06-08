export interface ServerToClientEvents {
  "item:statusChanged": (data: {
    itemId: string;
    currentQuantity: number;
    requiredQuantity: number;
    status: "available" | "limited" | "full";
  }) => void;
  "section:filled": (data: { sectionId: string; formId: string }) => void;
  "form:updated": (data: {
    formId: string;
    action: "published" | "updated" | "deleted";
  }) => void;
  "submission:new": (data: { userName: string; itemLabels: string[] }) => void;
  error: (data: { message: string; code: string }) => void;
}

export interface ClientToServerEvents {
  "join:form": (data: { formId: string }) => void;
  "leave:form": (data: { formId: string }) => void;
  "join:admin": (data: { token: string }) => void;
}

export interface SocketUserData {
  adminId?: string;
  formId?: string;
}

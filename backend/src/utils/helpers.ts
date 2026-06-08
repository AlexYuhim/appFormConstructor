export type ItemStatus = "available" | "limited" | "full";

export const calculateItemStatus = (
  currentQuantity: number,
  requiredQuantity: number,
): ItemStatus => {
  if (currentQuantity >= requiredQuantity) return "full";
  if (currentQuantity >= requiredQuantity * 0.8) return "limited";
  return "available";
};

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ресурс не найден") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Ошибка валидации", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Конфликт") {
    super(message, 409, "CONFLICT");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Не авторизован") {
    super(message, 401, "UNAUTHORIZED");
  }
}

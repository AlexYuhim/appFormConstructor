import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/helpers";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("[ERROR]", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      error: "Ошибка валидации",
      code: "VALIDATION_ERROR",
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    res.status(409).json({
      error: "Такой ресурс уже существует",
      code: "DUPLICATE_KEY",
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      error: "Неверный формат ID",
      code: "INVALID_ID",
    });
    return;
  }

  // Default 500
  res.status(500).json({
    error: "Внутренняя ошибка сервера",
    code: "INTERNAL_ERROR",
  });
};

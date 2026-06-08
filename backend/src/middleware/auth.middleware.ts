import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "../models/Admin";

export interface AuthRequest extends Request {
  admin?: IAdmin;
  adminId?: string;
}

interface JwtPayload {
  adminId: string;
  role: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Не авторизован: отсутствует токен" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default-secret";

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      res.status(401).json({ error: "Администратор не найден" });
      return;
    }

    req.admin = admin;
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Токен истёк" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Невалидный токен" });
      return;
    }
    next(error);
  }
};

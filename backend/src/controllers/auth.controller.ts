import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { AuthRequest } from "../middleware/auth.middleware";
import { ValidationError, UnauthorizedError } from "../utils/helpers";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        throw new ValidationError("Администратор с таким email уже существует");
      }

      const admin = await Admin.create({ email, password, name });
      const token = this.generateToken(admin._id.toString(), admin.role);

      res.status(201).json({
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError("Email и пароль обязательны");
      }

      const admin = await Admin.findOne({ email });
      if (!admin) {
        throw new UnauthorizedError("Неверный email или пароль");
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        throw new UnauthorizedError("Неверный email или пароль");
      }

      const token = this.generateToken(admin._id.toString(), admin.role);

      res.json({
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.admin) {
        throw new UnauthorizedError("Не авторизован");
      }

      res.json({
        admin: {
          id: req.admin._id,
          email: req.admin.email,
          name: req.admin.name,
          role: req.admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private generateToken(adminId: string, role: string): string {
    const secret = process.env.JWT_SECRET || "default-secret";
    const expiresIn = (process.env.JWT_EXPIRES_IN ||
      "7d") as jwt.SignOptions["expiresIn"];
    return jwt.sign({ adminId, role }, secret, {
      expiresIn,
    } as jwt.SignOptions);
  }
}

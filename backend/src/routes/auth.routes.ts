import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// POST /api/admin/auth/register
router.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

// POST /api/admin/auth/login
router.post("/login", (req, res, next) => authController.login(req, res, next));

// GET /api/admin/auth/me
router.get("/me", authMiddleware, (req, res, next) =>
  authController.getMe(req as any, res, next),
);

export default router;

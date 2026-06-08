import { Router } from "express";
import { FormController } from "../controllers/form.controller";
import { SectionController } from "../controllers/section.controller";
import { ItemController } from "../controllers/item.controller";
import { StatisticsController } from "../controllers/statistics.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const formController = new FormController();
const sectionController = new SectionController();
const itemController = new ItemController();
const statisticsController = new StatisticsController();

// All routes require auth
router.use(authMiddleware);

// ─── Forms ─────────────────────────────────────────────────
router.post("/", (req, res, next) =>
  formController.create(req as any, res, next),
);
router.get("/", (req, res, next) =>
  formController.getAll(req as any, res, next),
);
router.get("/:id", (req, res, next) =>
  formController.getById(req as any, res, next),
);
router.put("/:id", (req, res, next) =>
  formController.update(req as any, res, next),
);
router.delete("/:id", (req, res, next) =>
  formController.delete(req as any, res, next),
);
router.post("/:id/publish", (req, res, next) =>
  formController.publish(req as any, res, next),
);
router.post("/:id/unpublish", (req, res, next) =>
  formController.unpublish(req as any, res, next),
);

// ─── Sections ──────────────────────────────────────────────
router.post("/:formId/sections", (req, res, next) =>
  sectionController.create(req as any, res, next),
);
router.put("/:formId/sections/:id", (req, res, next) =>
  sectionController.update(req as any, res, next),
);
router.delete("/:formId/sections/:id", (req, res, next) =>
  sectionController.delete(req as any, res, next),
);
router.put("/:formId/sections/reorder", (req, res, next) =>
  sectionController.reorder(req as any, res, next),
);

// ─── Items ─────────────────────────────────────────────────
router.post("/:formId/sections/:sectionId/items", (req, res, next) =>
  itemController.create(req as any, res, next),
);
router.put("/:formId/sections/:sectionId/items/:id", (req, res, next) =>
  itemController.update(req as any, res, next),
);
router.delete("/:formId/sections/:sectionId/items/:id", (req, res, next) =>
  itemController.delete(req as any, res, next),
);
router.put("/:formId/sections/:sectionId/items/reorder", (req, res, next) =>
  itemController.reorder(req as any, res, next),
);

// ─── Statistics ────────────────────────────────────────────
router.get("/:id/statistics", (req, res, next) =>
  statisticsController.getStatistics(req as any, res, next),
);
router.get("/:id/statistics/export", (req, res, next) =>
  statisticsController.exportData(req as any, res, next),
);
router.get("/:id/submissions", (req, res, next) =>
  statisticsController.getSubmissions(req as any, res, next),
);

export default router;

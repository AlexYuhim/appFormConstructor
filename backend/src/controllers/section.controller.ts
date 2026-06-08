import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { FormService } from "../services/form.service";

const formService = new FormService();

export class SectionController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const section = await formService.createSection(
        req.params.formId,
        req.body,
      );
      res.status(201).json(section);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const section = await formService.updateSection(
        req.params.formId,
        req.params.id,
        req.body,
      );
      res.json(section);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await formService.deleteSection(
        req.params.formId,
        req.params.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await formService.reorderSections(
        req.params.formId,
        req.body,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

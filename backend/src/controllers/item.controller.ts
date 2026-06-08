import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { FormService } from "../services/form.service";

const formService = new FormService();

export class ItemController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await formService.createItem(req.params.sectionId, req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await formService.updateItem(
        req.params.sectionId,
        req.params.id,
        req.body,
      );
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await formService.deleteItem(
        req.params.sectionId,
        req.params.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await formService.reorderItems(
        req.params.sectionId,
        req.body,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

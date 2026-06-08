import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { FormService } from "../services/form.service";

const formService = new FormService();

export class FormController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const form = await formService.create(req.body, req.adminId!);
      res.status(201).json(form);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const forms = await formService.getAll(req.adminId!);
      res.json(forms);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const form = await formService.getById(req.params.id);
      res.json(form);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const form = await formService.update(req.params.id, req.body);
      res.json(form);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await formService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async publish(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const form = await formService.publish(req.params.id);
      res.json(form);
    } catch (error) {
      next(error);
    }
  }

  async unpublish(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const form = await formService.unpublish(req.params.id);
      res.json(form);
    } catch (error) {
      next(error);
    }
  }
}

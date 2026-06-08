import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";
import { SocketService } from "../services/socket.service";

export const createPublicRoutes = (socketService: SocketService) => {
  const router = Router();
  const submissionController = new SubmissionController(socketService);

  // GET /api/forms/:slug
  router.get("/:slug", async (req, res, next) => {
    try {
      const { FormService } = await import("../services/form.service");
      const formService = new FormService();
      const result = await formService.getPublicForm(req.params.slug);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/forms/:slug/submit
  router.post("/:slug/submit", (req, res, next) =>
    submissionController.submit(req, res, next),
  );

  return router;
};

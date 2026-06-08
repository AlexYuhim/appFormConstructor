import { Request, Response, NextFunction } from "express";
import { SubmissionService } from "../services/submission.service";
import { SocketService } from "../services/socket.service";

export class SubmissionController {
  private submissionService: SubmissionService;

  constructor(socketService: SocketService) {
    this.submissionService = new SubmissionService(socketService);
  }

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await this.submissionService.submit(
        req.params.slug,
        req.body,
        ipAddress,
        userAgent,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

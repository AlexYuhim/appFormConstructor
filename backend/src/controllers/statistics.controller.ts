import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { StatisticsService } from "../services/statistics.service";

const statisticsService = new StatisticsService();

export class StatisticsController {
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await statisticsService.getStatistics(req.params.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await statisticsService.getSubmissions(
        req.params.id,
        page,
        limit,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await statisticsService.getStatistics(req.params.id);
      const format = (req.query.format as string) || "json";

      if (format === "csv") {
        const csvRows: string[] = [];
        csvRows.push("Раздел,Элемент,Тип,Требуется,Заполнено,Прогресс,Статус");

        for (const section of data.sections) {
          for (const item of section.items) {
            csvRows.push(
              [
                section.sectionName,
                item.label,
                item.type,
                item.requiredQuantity,
                item.currentQuantity,
                `${item.progress}%`,
                item.status,
              ].join(","),
            );
          }
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=statistics-${req.params.id}.csv`,
        );
        res.send(csvRows.join("\n"));
      } else {
        res.json(data);
      }
    } catch (error) {
      next(error);
    }
  }

  async getFormsSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await statisticsService.getFormsSummary(req.adminId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

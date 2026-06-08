import Form from "../models/Form";
import FormSection from "../models/FormSection";
import FormItem from "../models/FormItem";
import Submission from "../models/Submission";
import SelectedItem from "../models/SelectedItem";
import { NotFoundError } from "../utils/helpers";
import { calculateItemStatus } from "../utils/helpers";
import { IStatisticsResponse } from "../types/submission.types";

export class StatisticsService {
  async getStatistics(formId: string): Promise<IStatisticsResponse> {
    const form = await Form.findById(formId);
    if (!form) throw new NotFoundError("Форма не найдена");

    const totalSubmissions = await Submission.countDocuments({ formId });

    const sections = await FormSection.find({ formId }).sort({ order: 1 });
    const sectionsData: IStatisticsResponse["sections"] = [];

    for (const section of sections) {
      const items = await FormItem.find({ sectionId: section._id }).sort({
        order: 1,
      });

      const itemsData = items.map((item) => {
        const status = calculateItemStatus(
          item.currentQuantity,
          item.requiredQuantity,
        );
        const progress =
          item.requiredQuantity > 0
            ? Math.round((item.currentQuantity / item.requiredQuantity) * 100)
            : 0;

        return {
          itemId: item._id.toString(),
          label: item.label,
          type: item.type,
          requiredQuantity: item.requiredQuantity,
          currentQuantity: item.currentQuantity,
          unit: item.unit || undefined,
          progress,
          status,
        };
      });

      const filledItems = itemsData.filter((i) => i.status === "full").length;

      sectionsData.push({
        sectionId: section._id.toString(),
        sectionName: section.name,
        totalItems: items.length,
        filledItems,
        items: itemsData,
      });
    }

    return {
      formId,
      totalSubmissions,
      sections: sectionsData,
    };
  }

  async getSubmissions(formId: string, page = 1, limit = 50) {
    const form = await Form.findById(formId);
    if (!form) throw new NotFoundError("Форма не найдена");

    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ formId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const submissionIds = submissions.map((s) => s._id);
    const selectedItems = await SelectedItem.find({
      submissionId: { $in: submissionIds },
    }).lean();

    const itemIds = selectedItems.map((si) => si.itemId);
    const items = await FormItem.find({ _id: { $in: itemIds } })
      .select("_id label type unit")
      .lean();

    const itemMap = new Map(items.map((i) => [i._id.toString(), i]));

    const enrichedSubmissions = submissions.map((sub) => {
      const subSelectedItems = selectedItems
        .filter((si) => si.submissionId.toString() === sub._id.toString())
        .map((si) => {
          const item = itemMap.get(si.itemId.toString());
          return {
            itemId: si.itemId,
            label: item?.label || "Неизвестно",
            type: item?.type || "item",
            unit: item?.unit,
            quantity: si.quantity,
            sectionId: si.sectionId,
          };
        });

      return {
        id: sub._id,
        userName: sub.userName,
        userSurname: sub.userSurname,
        submittedAt: sub.submittedAt,
        selectedItems: subSelectedItems,
      };
    });

    const total = await Submission.countDocuments({ formId });

    return {
      submissions: enrichedSubmissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

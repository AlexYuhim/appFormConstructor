import client from "./client";
import type {
  SubmitFormDto,
  SubmitFormResponse,
  StatisticsResponse,
  PaginatedSubmissions,
} from "../types/submission.types";
import type { PublicFormResponse } from "../types/form.types";

export const submissionsApi = {
  getPublicForm: async (slug: string) => {
    const { data } = await client.get<PublicFormResponse>(`/forms/${slug}`);
    return data;
  },

  submit: async (slug: string, dto: SubmitFormDto) => {
    const { data } = await client.post<SubmitFormResponse>(
      `/forms/${slug}/submit`,
      dto,
    );
    return data;
  },

  getStatistics: async (formId: string) => {
    const { data } = await client.get<StatisticsResponse>(
      `/admin/forms/${formId}/statistics`,
    );
    return data;
  },

  getSubmissions: async (formId: string, page = 1, limit = 50) => {
    const { data } = await client.get<PaginatedSubmissions>(
      `/admin/forms/${formId}/submissions`,
      { params: { page, limit } },
    );
    return data;
  },
  getFormsSummary: async () => {
    const { data } = await client.get<
      Array<{
        _id: string;
        name: string;
        slug: string;
        isPublished: boolean;
        totalSubmissions: number;
      }>
    >("/admin/forms/stats/summary");
    return data;
  },
};

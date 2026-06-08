import { useState, useCallback } from "react";
import { submissionsApi } from "../api/submissions.api";
import type { SubmitFormDto } from "../types/submission.types";
import type { PublicFormResponse } from "../types/form.types";

export const useFormSubmission = () => {
  const [currentForm, setCurrentForm] = useState<PublicFormResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const loadForm = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionsApi.getPublicForm(slug);
      setCurrentForm(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Форма не найдена");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitForm = useCallback(async (slug: string, dto: SubmitFormDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionsApi.submit(slug, dto);
      setSubmitted(true);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка при отправке");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentForm(null);
    setError(null);
    setSubmitted(false);
  }, []);

  return {
    currentForm,
    isLoading,
    error,
    submitted,
    loadForm,
    submitForm,
    reset,
  };
};

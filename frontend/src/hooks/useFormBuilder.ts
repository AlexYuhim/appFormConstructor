import { useState, useCallback } from "react";
import { formsApi } from "../api/forms.api";
import { useFormStore } from "../store/form.store";
import type {
  CreateFormDto,
  UpdateFormDto,
  CreateSectionDto,
  CreateItemDto,
} from "../types/form.types";

export const useFormBuilder = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { forms, currentForm, setForms, setCurrentForm } = useFormStore();

  const loadForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await formsApi.getAll();
      setForms(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка загрузки форм");
    } finally {
      setIsLoading(false);
    }
  }, [setForms]);

  const loadForm = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const data = await formsApi.getById(id);
        setCurrentForm(data);
        setError(null);
        return data;
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка загрузки формы");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentForm],
  );

  const createForm = useCallback(
    async (dto: CreateFormDto) => {
      try {
        const form = await formsApi.create(dto);
        setForms([form, ...forms]);
        setError(null);
        return form;
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка создания формы");
        return null;
      }
    },
    [forms, setForms],
  );

  const updateForm = useCallback(
    async (id: string, dto: UpdateFormDto) => {
      try {
        const form = await formsApi.update(id, dto);
        setForms(forms.map((f) => (f._id === id ? form : f)));
        if (currentForm) {
          setCurrentForm({ ...currentForm, ...form });
        }
        setError(null);
        return form;
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка обновления формы");
        return null;
      }
    },
    [forms, currentForm, setForms, setCurrentForm],
  );

  const deleteForm = useCallback(
    async (id: string) => {
      try {
        await formsApi.delete(id);
        setForms(forms.filter((f) => f._id !== id));
        setError(null);
        return true;
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка удаления формы");
        return false;
      }
    },
    [forms, setForms],
  );

  const togglePublish = useCallback(
    async (id: string, isPublished: boolean) => {
      try {
        const form = isPublished
          ? await formsApi.unpublish(id)
          : await formsApi.publish(id);
        setForms(forms.map((f) => (f._id === id ? form : f)));
        if (currentForm) {
          setCurrentForm({ ...currentForm, ...form });
        }
        setError(null);
        return form;
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Ошибка изменения статуса публикации",
        );
        return null;
      }
    },
    [forms, currentForm, setForms, setCurrentForm],
  );

  const addSection = useCallback(
    async (formId: string, dto: CreateSectionDto) => {
      try {
        const section = await formsApi.createSection(formId, dto);
        if (currentForm) {
          const updated = await formsApi.getById(formId);
          setCurrentForm(updated);
        }
        setError(null);
        return section;
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка создания раздела");
        return null;
      }
    },
    [currentForm, setCurrentForm],
  );

  const addItem = useCallback(
    async (formId: string, sectionId: string, dto: CreateItemDto) => {
      try {
        const item = await formsApi.createItem(formId, sectionId, dto);
        if (currentForm) {
          const updated = await formsApi.getById(formId);
          setCurrentForm(updated);
        }
        setError(null);
        return item;
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка создания элемента");
        return null;
      }
    },
    [currentForm, setCurrentForm],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    forms,
    currentForm,
    isLoading,
    error,
    loadForms,
    loadForm,
    createForm,
    updateForm,
    deleteForm,
    togglePublish,
    addSection,
    addItem,
    clearError,
  };
};

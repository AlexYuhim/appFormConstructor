import { create } from "zustand";
import type { Form, FormWithSections } from "../types/form.types";

interface FormState {
  forms: Form[];
  currentForm: FormWithSections | null;
  isLoading: boolean;
  error: string | null;
  setForms: (forms: Form[]) => void;
  setCurrentForm: (form: FormWithSections | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  currentForm: null,
  isLoading: false,
  error: null,

  setForms: (forms) => set({ forms }),
  setCurrentForm: (form) => set({ currentForm: form }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      forms: [],
      currentForm: null,
      isLoading: false,
      error: null,
    }),
}));

export const validation = {
  formName: (value: string): string | null => {
    if (!value.trim()) return "Название обязательно";
    if (value.length > 200) return "Максимум 200 символов";
    return null;
  },

  sectionName: (value: string): string | null => {
    if (!value.trim()) return "Название обязательно";
    if (value.length > 200) return "Максимум 200 символов";
    return null;
  },

  itemLabel: (value: string): string | null => {
    if (!value.trim()) return "Название обязательно";
    if (value.length > 300) return "Максимум 300 символов";
    return null;
  },

  requiredQuantity: (value: number): string | null => {
    if (!value || value < 1) return "Минимум 1";
    if (!Number.isInteger(value)) return "Должно быть целым числом";
    return null;
  },

  userName: (value: string): string | null => {
    if (!value.trim()) return "Имя обязательно";
    if (value.length < 2) return "Минимум 2 символа";
    if (value.length > 100) return "Максимум 100 символов";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value))
      return "Только буквы, пробел и дефис";
    return null;
  },

  userSurname: (value: string): string | null => {
    if (!value.trim()) return "Фамилия обязательна";
    if (value.length < 2) return "Минимум 2 символа";
    if (value.length > 100) return "Максимум 100 символов";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value))
      return "Только буквы, пробел и дефис";
    return null;
  },

  consentGiven: (value: boolean): string | null => {
    if (!value) return "Необходимо дать согласие";
    return null;
  },
};

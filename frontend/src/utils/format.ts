export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusLabel = (
  status: "available" | "limited" | "full",
): string => {
  const labels: Record<string, string> = {
    available: "Доступно",
    limited: "Заканчивается",
    full: "Заполнено",
  };
  return labels[status];
};

export const getStatusColor = (
  status: "available" | "limited" | "full",
): string => {
  const colors: Record<string, string> = {
    available: "#22c55e",
    limited: "#eab308",
    full: "#ef4444",
  };
  return colors[status];
};

export const getTypeLabel = (type: "food" | "item" | "service"): string => {
  const labels: Record<string, string> = {
    food: "🍽 Еда",
    item: "📦 Вещь",
    service: "🔧 Услуга",
  };
  return labels[type] || type;
};

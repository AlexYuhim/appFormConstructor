import React from "react";
import { getStatusLabel } from "../../utils/format";

interface ItemCardProps {
  item: {
    id: string;
    label: string;
    description?: string;
    type: string;
    requiredQuantity: number;
    currentQuantity: number;
    unit?: string;
    status: "available" | "limited" | "full";
  };
  isSelected: boolean;
  onSelect: () => void;
}

const statusColors: Record<string, string> = {
  available: "#22c55e",
  limited: "#eab308",
  full: "#ef4444",
};

const ItemCard: React.FC<ItemCardProps> = ({ item, isSelected, onSelect }) => {
  const isFull = item.status === "full";

  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px",
        borderRadius: "10px",
        border: `1.5px solid ${isSelected ? "#6366f1" : isFull ? "#ef4444" : "#e2e8f0"}`,
        backgroundColor: isSelected ? "#eef2ff" : "#fff",
        cursor: isFull ? "not-allowed" : "pointer",
        opacity: isFull ? 0.5 : 1,
        transition: "all 0.15s",
      }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        disabled={isFull}
        style={{
          width: "20px",
          height: "20px",
          marginTop: "2px",
          accentColor: "#6366f1",
          cursor: isFull ? "not-allowed" : "pointer",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#1e293b",
            marginBottom: "2px",
          }}
        >
          {item.label}
        </div>
        {item.description && (
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginBottom: "4px",
              lineHeight: 1.3,
            }}
          >
            {item.description}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          <span style={{ color: statusColors[item.status], fontWeight: 600 }}>
            {getStatusLabel(item.status)}
          </span>
          <span>
            {item.currentQuantity}/{item.requiredQuantity} {item.unit || "шт"}
          </span>
        </div>
      </div>
    </label>
  );
};

export default ItemCard;

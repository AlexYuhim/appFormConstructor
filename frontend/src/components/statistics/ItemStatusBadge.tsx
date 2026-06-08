import React from "react";
import { getStatusLabel, getStatusColor } from "../../utils/format";

interface ItemStatusBadgeProps {
  status: "available" | "limited" | "full";
}

const ItemStatusBadge: React.FC<ItemStatusBadgeProps> = ({ status }) => {
  const color = getStatusColor(status);

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {getStatusLabel(status)}
    </span>
  );
};

export default ItemStatusBadge;

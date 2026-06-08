import React from "react";
import ProgressBar from "../ui/ProgressBar";

interface ProgressChartProps {
  items: Array<{
    itemId: string;
    label: string;
    requiredQuantity: number;
    currentQuantity: number;
    unit?: string;
    progress: number;
    status: string;
  }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ items }) => {
  return (
    <div>
      {items.map((item) => (
        <div
          key={item.itemId}
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              {item.label}
            </span>
            {item.unit && (
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                {item.unit}
              </span>
            )}
          </div>
          <ProgressBar
            current={item.currentQuantity}
            required={item.requiredQuantity}
          />
        </div>
      ))}
    </div>
  );
};

export default ProgressChart;

import React from "react";
import { getStatusColor } from "../../utils/format";

interface ProgressBarProps {
  current: number;
  required: number;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  required,
  showLabel = true,
}) => {
  const progress = required > 0 ? Math.min((current / required) * 100, 100) : 0;
  const status =
    progress >= 100 ? "full" : progress >= 80 ? "limited" : "available";
  const color = getStatusColor(status);

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: "10px",
          backgroundColor: "#f1f5f9",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "5px",
            transition: "width 0.3s ease, background-color 0.3s ease",
          }}
        />
      </div>
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748b",
            marginTop: "4px",
          }}
        >
          <span>
            {current} из {required}
          </span>
          <span style={{ color, fontWeight: 600 }}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

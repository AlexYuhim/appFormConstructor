import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, text }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {text && (
        <span style={{ color: "#64748b", fontSize: "14px" }}>{text}</span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;

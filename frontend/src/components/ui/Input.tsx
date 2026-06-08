import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#334155",
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: `1px solid ${error ? "#ef4444" : "#e2e8f0"}`,
          fontSize: "14px",
          outline: "none",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            color: "#ef4444",
            fontSize: "12px",
            marginTop: "4px",
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;

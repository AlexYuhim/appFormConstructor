import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  children: React.ReactNode;
}

const baseStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s",
  lineHeight: 1,
};

const variants: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: "#6366f1",
    color: "#fff",
  },
  secondary: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
  },
  danger: {
    backgroundColor: "#ef4444",
    color: "#fff",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#6366f1",
    padding: "4px 8px",
  },
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  children,
  disabled,
  style,
  ...props
}) => {
  return (
    <button
      style={{
        ...baseStyles,
        ...variants[variant],
        opacity: disabled || isLoading ? 0.6 : 1,
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        ...style,
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span style={{ fontSize: "16px" }}>⏳</span>}
      {children}
    </button>
  );
};

export default Button;

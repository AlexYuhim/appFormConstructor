import React from "react";
import { Layout, Typography, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../store/auth.store";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const admin = useAuthStore((s) => s.admin);

  return (
    <Layout.Header
      style={{
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        height: 60,
        lineHeight: "60px",
      }}
    >
      <Button
        type="text"
        icon={<MenuOutlined style={{ fontSize: 18 }} />}
        onClick={onToggleSidebar}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      <Typography.Title
        level={5}
        style={{ margin: 0, color: "#1e293b", flex: 1 }}
      >
        Конструктор форм
      </Typography.Title>
      {admin && (
        <Typography.Text style={{ color: "#64748b", fontSize: 13 }}>
          {admin.name}
        </Typography.Text>
      )}
    </Layout.Header>
  );
};

export default Header;

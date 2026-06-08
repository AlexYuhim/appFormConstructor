import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import {
  DashboardOutlined,
  FormOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../store/auth.store";

const menuItems = [
  { key: "/admin", icon: <DashboardOutlined />, label: "Дашборд" },
  { key: "/admin/forms", icon: <FormOutlined />, label: "Формы" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <Layout.Sider
      width={220}
      collapsedWidth={0}
      collapsed={collapsed}
      theme="dark"
      trigger={null}
      style={{
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 100,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          color: "#94a3b8",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1px",
          whiteSpace: "nowrap",
        }}
      >
        {!collapsed && "Меню"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          // Close sidebar on mobile after navigation
          if (window.innerWidth < 768 && !collapsed) {
            onToggle();
          }
        }}
        style={{ borderInlineEnd: "none" }}
      />
      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "12px 24px",
            borderTop: "1px solid #334155",
          }}
        >
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: "#ef4444", padding: 0 }}
          >
            Выйти
          </Button>
        </div>
      )}
    </Layout.Sider>
  );
};

export default Sidebar;

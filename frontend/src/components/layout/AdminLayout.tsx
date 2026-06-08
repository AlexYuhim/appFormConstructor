import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MOBILE_BREAKPOINT = 768;

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on mobile on initial load
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setSidebarCollapsed(true);
      }
    };
    checkWidth();
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Layout>
        <Header onToggleSidebar={toggleSidebar} />
        <Layout.Content
          style={{
            padding: 16,
            background: "#f8fafc",
            overflow: "auto",
            minHeight: "calc(100vh - 60px)",
          }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

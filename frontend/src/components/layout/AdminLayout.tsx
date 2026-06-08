import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MOBILE_BREAKPOINT = 768;

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen width and auto-collapse on mobile
  useEffect(() => {
    const checkWidth = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      )}

      {/* Mobile sidebar overlay with backdrop */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {!sidebarCollapsed && (
            <div
              onClick={() => setSidebarCollapsed(true)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 999,
              }}
            />
          )}
          {/* Sidebar panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: 220,
              zIndex: 1000,
              transform: sidebarCollapsed
                ? "translateX(-100%)"
                : "translateX(0)",
              transition: "transform 0.2s ease",
            }}
          >
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
              mobile
            />
          </div>
        </>
      )}

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

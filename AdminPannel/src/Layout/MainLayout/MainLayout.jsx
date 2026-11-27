import { useState } from "react";
import { Outlet } from "react-router-dom";

import Topbar from "../Topbar/Topbar";
import Sidebar from "../Sidebar/Sidebar";
import PageHeader from "../../Components/PageHeader/PageHeader";
import "./MainLayout.css";

const MainLayout = () => {
  // Which module's slide-out menu is open (null = closed)
  const [activeMenu, setActiveMenu] = useState(null);
  // Sidebar open/close on phones
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleMenuSelect = (menuKey) => {
    setActiveMenu((prev) => (prev === menuKey ? null : menuKey));
  };

  const handleCloseDrawer = () => {
    setActiveMenu(null);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="MainLayout">
      {/* Top bar: logo, search, notifications, profile */}
      <Topbar
        onToggleMobileSidebar={toggleMobileSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      <div className="MainLayout-body">
        {/* Left icon rail + slide-out menu */}
        <Sidebar
          activeMenu={activeMenu}
          onMenuSelect={handleMenuSelect}
          onCloseDrawer={handleCloseDrawer}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dark overlay behind the sidebar on phones */}
        {isMobileSidebarOpen && (
          <div
            className="MainLayout-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Page area */}
        <main
          className={`MainLayout-content ${
            activeMenu ? "MainLayout-content--drawerOpen" : ""
          }`}
        >
          <div className="MainLayout-container">
            {/* Back button + page title + location path (Home > Students > ...) */}
            <PageHeader />

            {/* The current page renders here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
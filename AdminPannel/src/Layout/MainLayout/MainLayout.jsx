import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(null);
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
      <Topbar
        onToggleMobileSidebar={toggleMobileSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      <div className="MainLayout-body">
        <Sidebar
          activeMenu={activeMenu}
          onMenuSelect={handleMenuSelect}
          onCloseDrawer={handleCloseDrawer}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {isMobileSidebarOpen && (
          <div
            className="MainLayout-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <main
          className={`MainLayout-content ${
            activeMenu ? 'MainLayout-content--drawerOpen' : ''
          }`}
        >
          <div className="MainLayout-container">
            {children || (
              <div className="MainLayout-placeholder">
                <h2>Welcome to LearningSteps School Admin Panel</h2>
                <p>Select any module from the left navigation bar to manage records.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
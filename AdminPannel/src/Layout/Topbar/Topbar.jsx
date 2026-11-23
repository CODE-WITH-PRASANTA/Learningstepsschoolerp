import React, { useState, useEffect, useRef } from 'react';
import {
  FiSearch,
  FiMenu,
  FiX,
  FiBell,
  FiChevronDown,
  FiUser,
  FiShield,
  FiLogOut,
} from 'react-icons/fi';
import logo from '../../assets/logo.png';
import './Topbar.css';

const Topbar = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);

  // Focus search input when pressing Ctrl + /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="Topbar">
      {/* Left Brand Section */}
      <div className="Topbar-brandSection">
        <button
          type="button"
          className="Topbar-mobileMenuBtn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation"
        >
          {isMobileSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        <div className="Topbar-logoCircle">
          <img
            src={logo}
            alt="LearningSteps School Logo"
            className="Topbar-logoImg"
          />
        </div>

        <div className="Topbar-brandText">
          <h1 className="Topbar-schoolName">LearningSteps School</h1>
          <span className="Topbar-panelTag">ADMIN PANEL</span>
        </div>
      </div>

      {/* Main Header Controls */}
      <div className="Topbar-mainBar">
        <div className="Topbar-leftControls">
          <div
            className={`Topbar-searchBox ${
              isMobileSearchOpen ? 'Topbar-searchBox--mobileShow' : ''
            }`}
          >
            <FiSearch className="Topbar-searchIcon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search student, fee, roll no..."
              className="Topbar-searchInput"
            />
            <span className="Topbar-shortcutBadge">Ctrl /</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="Topbar-rightControls">
          <button
            type="button"
            className="Topbar-circleIconBtn Topbar-mobileSearchBtn"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label="Search"
          >
            <FiSearch size={18} />
          </button>

          <button
            type="button"
            className="Topbar-circleIconBtn"
            aria-label="Notifications"
          >
            <FiBell size={18} />
            <span className="Topbar-notifBadge">3</span>
          </button>

          {/* Profile Pill & Dropdown */}
          <div className="Topbar-profileWrapper" ref={profileRef}>
            <button
              type="button"
              className={`Topbar-profilePill ${
                isProfileOpen ? 'Topbar-profilePill--active' : ''
              }`}
              onClick={() => setIsProfileOpen((prev) => !prev)}
            >
              <div className="Topbar-avatarWrapper">
                <img
                  src={logo}
                  alt="Admin User"
                  className="Topbar-avatarImg"
                />
                <span className="Topbar-onlineDot" />
              </div>

              <div className="Topbar-userInfo">
                <span className="Topbar-userName">Admin User</span>
                <span className="Topbar-userRole">Super Admin</span>
              </div>

              <FiChevronDown
                className={`Topbar-chevron ${
                  isProfileOpen ? 'Topbar-chevron--rotate' : ''
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="Topbar-dropdown">
                <div className="Topbar-dropdownHeader">
                  <p className="Topbar-dropdownName">Admin User</p>
                  <p className="Topbar-dropdownEmail">
                    admin@learningstepsschool.com
                  </p>
                </div>

                <div className="Topbar-dropdownBody">
                  <button type="button" className="Topbar-dropdownItem">
                    <FiUser className="Topbar-dropdownIcon" />
                    <span>My Profile</span>
                  </button>

                  <button type="button" className="Topbar-dropdownItem">
                    <FiShield className="Topbar-dropdownIcon" />
                    <span>Security &amp; Settings</span>
                  </button>

                  <div className="Topbar-dropdownDivider" />

                  <button
                    type="button"
                    className="Topbar-dropdownItem Topbar-dropdownItem--danger"
                  >
                    <FiLogOut className="Topbar-dropdownIcon" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
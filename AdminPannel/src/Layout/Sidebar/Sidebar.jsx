import React, { useState } from 'react';
import {
  FiGrid,
  FiUsers,
  FiCreditCard,
  FiFileText,
  FiTruck,
  FiShield,
  FiX,
  FiUserPlus,
  FiList,
  FiBookOpen,
  FiCheckSquare,
  FiCalendar,
  FiAward,
  FiPieChart,
  FiLayers,
  FiFolder,
  FiRepeat,
  FiGift,
  FiTrendingUp,
  FiMessageSquare,
  FiUserX,
  FiLogOut,
  FiTrash2,
  FiDollarSign,
  FiClock,
  FiGlobe,
  FiAlertCircle,
  FiCheckCircle,
  FiPercent,
  FiBook,
  FiHash,
  FiEdit3,
  FiBarChart2,
  FiMapPin,
  FiUserCheck,
  FiNavigation,
  FiSliders,
  FiDroplet,
  FiKey,
  FiSend,
} from 'react-icons/fi';
import './Sidebar.css';

const MENU_DATA = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: FiGrid,
    items: [
      { label: 'Overview', icon: FiGrid, path: '/dashboard' },
      { label: 'Academic Analytics', icon: FiBarChart2, path: '/dashboard/analytics' },
      { label: 'Daily Summary', icon: FiPieChart, path: '/dashboard/summary' },
    ],
  },
  {
    key: 'students',
    label: 'Students',
    icon: FiUsers,
    items: [
      { label: 'Student Admission', icon: FiUserPlus, path: '/students/admission' },
      { label: 'Students List', icon: FiList, path: '/students/list' },
      { label: 'Subject Wise Report', icon: FiBookOpen, path: '/students/subject-report' },
      { label: 'Attendance Entry', icon: FiCheckSquare, path: '/students/attendance-entry' },
      { label: 'Attendance Report', icon: FiCalendar, path: '/students/attendance-report' },
      { label: 'Identity Cards', icon: FiCreditCard, path: '/students/id-cards' },
      { label: 'Custom Report', icon: FiFileText, path: '/students/custom-report' },
      { label: 'Category Analytics', icon: FiPieChart, path: '/students/category-analytics' },
      { label: 'Class Wise Report', icon: FiLayers, path: '/students/class-report' },
      { label: 'Certificate', icon: FiAward, path: '/students/certificate' },
      { label: 'Manage SR', icon: FiFolder, path: '/students/manage-sr' },
      { label: 'SR List', icon: FiList, path: '/students/sr-list' },
      { label: 'Academic Promotion', icon: FiRepeat, path: '/students/promotion' },
      { label: 'Sibling Records', icon: FiUsers, path: '/students/siblings' },
      { label: 'Birth Day List', icon: FiGift, path: '/students/birthdays' },
      { label: 'Age Analysis', icon: FiTrendingUp, path: '/students/age-analysis' },
      { label: 'PTM Report', icon: FiMessageSquare, path: '/students/ptm-report' },
      { label: 'Students Under Rustication', icon: FiUserX, path: '/students/rustication' },
      { label: 'TC Management', icon: FiLogOut, path: '/students/tc-management' },
      { label: 'RTE Management', icon: FiFolder, path: '/students/rte-management' },
      { label: 'Deactivate Student', icon: FiUserX, path: '/students/deactivate' },
      { label: 'Removed Student Records', icon: FiTrash2, path: '/students/removed' },
    ],
  },
  {
    key: 'fees',
    label: 'Fees',
    icon: FiCreditCard,
    items: [
      { label: 'Fee Collection', icon: FiDollarSign, path: '/fees/collection' },
      { label: 'Collection List', icon: FiList, path: '/fees/collection-list' },
      { label: 'Challan', icon: FiFileText, path: '/fees/challan' },
      { label: 'Collection Report', icon: FiCheckCircle, path: '/fees/collection-report' },
      { label: 'Collection Date Wise', icon: FiCalendar, path: '/fees/date-wise' },
      { label: 'Online Payments', icon: FiGlobe, path: '/fees/online-payments' },
      { label: 'Due Fees Report', icon: FiAlertCircle, path: '/fees/due-report' },
      { label: 'Cheque Tracking', icon: FiCreditCard, path: '/fees/cheque-tracking' },
      { label: 'Collection Summary', icon: FiPieChart, path: '/fees/summary' },
      { label: 'Sibling Summary', icon: FiUsers, path: '/fees/sibling-summary' },
      { label: 'Discount Control', icon: FiPercent, path: '/fees/discount-control' },
      { label: 'Student Ledger', icon: FiBook, path: '/fees/student-ledger' },
      { label: 'Clearance Certificate', icon: FiAward, path: '/fees/clearance' },
      { label: 'Previous Dues', icon: FiClock, path: '/fees/previous-dues' },
      { label: 'Delete Fees', icon: FiTrash2, path: '/fees/delete' },
    ],
  },
  {
    key: 'exam',
    label: 'Exam',
    icon: FiFileText,
    items: [
      { label: 'Create Exam', icon: FiFileText, path: '/exam/create' },
      { label: 'Assign Marks', icon: FiCheckSquare, path: '/exam/assign-marks' },
      { label: 'Result Structure', icon: FiLayers, path: '/exam/result-structure' },
      { label: 'Roll Number', icon: FiHash, path: '/exam/roll-number' },
      { label: 'Roll Number List', icon: FiList, path: '/exam/roll-number-list' },
      { label: 'Admit Card', icon: FiCreditCard, path: '/exam/admit-card' },
      { label: 'Marks Entry', icon: FiEdit3, path: '/exam/marks-entry' },
      { label: 'Rank Report', icon: FiAward, path: '/exam/rank-report' },
      { label: 'Publish Marksheet', icon: FiCheckCircle, path: '/exam/publish' },
      { label: 'Marks Sheet', icon: FiFileText, path: '/exam/marksheet' },
      { label: 'Report Section', icon: FiBarChart2, path: '/exam/report-section' },
      { label: 'Bulk Message', icon: FiMessageSquare, path: '/exam/bulk-message' },
      { label: 'Year Attendance', icon: FiCalendar, path: '/exam/year-attendance' },
      { label: 'Class Wise Working Day', icon: FiClock, path: '/exam/working-days' },
      { label: 'Co-Scholastic Areas', icon: FiBookOpen, path: '/exam/co-scholastic' },
    ],
  },
  {
    key: 'transport',
    label: 'Transport',
    icon: FiTruck,
    items: [
      { label: 'Pickup Points', icon: FiMapPin, path: '/transport/pickup-points' },
      { label: 'Driver Management', icon: FiUserCheck, path: '/transport/drivers' },
      { label: 'Vehicle Records', icon: FiTruck, path: '/transport/vehicles' },
      { label: 'Route Management', icon: FiNavigation, path: '/transport/routes' },
      { label: 'Transport Fee Head', icon: FiList, path: '/transport/fee-head' },
      { label: 'Fee Structure', icon: FiSliders, path: '/transport/fee-structure' },
      { label: 'Student Registration', icon: FiUserPlus, path: '/transport/registration' },
      { label: 'Bulk Enrollment', icon: FiUsers, path: '/transport/bulk-enrollment' },
      { label: 'Route Analytics', icon: FiBarChart2, path: '/transport/analytics' },
      { label: 'Fuel Management', icon: FiDroplet, path: '/transport/fuel' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: FiShield,
    items: [
      { label: 'Users List', icon: FiUsers, path: '/admin/users' },
      { label: 'Roles', icon: FiKey, path: '/admin/roles' },
      { label: 'Holiday List', icon: FiCalendar, path: '/admin/holidays' },
      { label: 'Message Service', icon: FiMessageSquare, path: '/admin/message-service' },
      { label: 'Bulk Message', icon: FiSend, path: '/admin/bulk-message' },
    ],
  },
];

const Sidebar = ({
  activeMenu,
  onMenuSelect,
  onCloseDrawer,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [activeSubItem, setActiveSubItem] = useState('');

  const selectedCategory = MENU_DATA.find((item) => item.key === activeMenu);

  const handleSubItemClick = (label) => {
    setActiveSubItem(label);
    if (window.innerWidth <= 768) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`Sidebar ${isMobileOpen ? 'Sidebar--mobileOpen' : ''}`}
    >
      {/* Primary Blue Icon Rail */}
      <nav className="Sidebar-rail" aria-label="Main Modules">
        <ul className="Sidebar-railList">
          {MENU_DATA.map((menu) => {
            const IconComponent = menu.icon;
            const isActive = activeMenu === menu.key;

            return (
              <li key={menu.key} className="Sidebar-railItem">
                <button
                  type="button"
                  className={`Sidebar-railBtn ${
                    isActive ? 'Sidebar-railBtn--active' : ''
                  }`}
                  onClick={() => onMenuSelect(menu.key)}
                >
                  <IconComponent className="Sidebar-railIcon" />
                  <span className="Sidebar-railLabel">{menu.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Smooth Slide-Out White Submenu Drawer */}
      <div
        className={`Sidebar-drawer ${
          selectedCategory ? 'Sidebar-drawer--open' : ''
        }`}
        aria-hidden={!selectedCategory}
      >
        {selectedCategory && (
          <div className="Sidebar-drawerInner">
            <div className="Sidebar-drawerHeader">
              <h3 className="Sidebar-drawerTitle">{selectedCategory.label}</h3>
              <button
                type="button"
                className="Sidebar-closeBtn"
                onClick={onCloseDrawer}
                aria-label="Close Menu"
                title="Close"
              >
                <FiX size={19} />
              </button>
            </div>

            <ul className="Sidebar-subList">
              {selectedCategory.items.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = activeSubItem === sub.label;

                return (
                  <li key={sub.label} className="Sidebar-subItem">
                    <button
                      type="button"
                      className={`Sidebar-subBtn ${
                        isSubActive ? 'Sidebar-subBtn--active' : ''
                      }`}
                      onClick={() => handleSubItemClick(sub.label)}
                    >
                      <SubIcon className="Sidebar-subIcon" />
                      <span className="Sidebar-subLabel">{sub.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import "./PageHeader.css";

/* ------------------------------------------------------------------ */
/* Titles. Key = route path from the Sidebar.                          */
/* Add a line here for every new page. Unlisted pages still work:      */
/* "some-new-page" -> "Some New Page".                                 */
/* ------------------------------------------------------------------ */
const PAGE_TITLES = {
  "/": "Dashboard",
  "/dashboard/analytics": "Academic Analytics",
  "/dashboard/summary": "Daily Summary",

  // Students
  "/students/admission": "Student Admission",
  "/students/list": "Students List",
  "/students/subject-report": "Subject Wise Report",
  "/students/attendance-entry": "Attendance Entry",
  "/students/attendance-report": "Attendance Report",
  "/students/id-cards": "Identity Cards",
  "/students/custom-report": "Custom Report",
  "/students/category-analytics": "Category Analytics",
  "/students/class-report": "Class Wise Report",
  "/students/certificate": "Certificate",
  "/students/manage-sr": "Manage SR",
  "/students/sr-list": "SR List",
  "/students/promotion": "Academic Promotion",
  "/students/siblings": "Sibling Records",
  "/students/birthdays": "Birth Day List",
  "/students/age-analysis": "Age Analysis",
  "/students/ptm-report": "PTM Report",
  "/students/rustication": "Students Under Rustication",
  "/students/tc-management": "TC Management",
  "/students/rte-management": "RTE Management",
  "/students/deactivate": "Deactivate Student",
  "/students/removed": "Removed Student Records",

  // Fees
  "/fees/collection": "Fee Collection",
  "/fees/collection-list": "Collection List",
  "/fees/challan": "Challan",
  "/fees/collection-report": "Collection Report",
  "/fees/date-wise": "Collection Date Wise",
  "/fees/online-payments": "Online Payments",
  "/fees/due-report": "Due Fees Report",
  "/fees/cheque-tracking": "Cheque Tracking",
  "/fees/summary": "Collection Summary",
  "/fees/sibling-summary": "Sibling Summary",
  "/fees/discount-control": "Discount Control",
  "/fees/student-ledger": "Student Ledger",
  "/fees/clearance": "Clearance Certificate",
  "/fees/previous-dues": "Previous Dues",
  "/fees/delete": "Delete Fees",

  // Exam
  "/exam/create": "Create Exam",
  "/exam/assign-marks": "Assign Marks",
  "/exam/result-structure": "Result Structure",
  "/exam/roll-number": "Roll Number",
  "/exam/roll-number-list": "Roll Number List",
  "/exam/admit-card": "Admit Card",
  "/exam/marks-entry": "Marks Entry",
  "/exam/rank-report": "Rank Report",
  "/exam/publish": "Publish Marksheet",
  "/exam/marksheet": "Marks Sheet",
  "/exam/report-section": "Report Section",
  "/exam/bulk-message": "Bulk Message",
  "/exam/year-attendance": "Year Attendance",
  "/exam/working-days": "Class Wise Working Day",
  "/exam/co-scholastic": "Co-Scholastic Areas",

  // Transport
  "/transport/pickup-points": "Pickup Points",
  "/transport/drivers": "Driver Management",
  "/transport/vehicles": "Vehicle Records",
  "/transport/routes": "Route Management",
  "/transport/fee-head": "Transport Fee Head",
  "/transport/fee-structure": "Fee Structure",
  "/transport/registration": "Student Registration",
  "/transport/bulk-enrollment": "Bulk Enrollment",
  "/transport/analytics": "Route Analytics",
  "/transport/fuel": "Fuel Management",

  // Admin
  "/admin/users": "Users List",
  "/admin/roles": "Roles",
  "/admin/holidays": "Holiday List",
  "/admin/message-service": "Message Service",
  "/admin/bulk-message": "Bulk Message",
};

/* Name of each module folder shown in the middle of the path */
const SEGMENT_LABELS = {
  dashboard: "Dashboard",
  students: "Students",
  fees: "Fees",
  exam: "Exam",
  transport: "Transport",
  admin: "Admin",
};

/* Where a module crumb takes you when clicked */
const FOLDER_LANDING = {
  dashboard: "/",
  students: "/students/admission",
  fees: "/fees/collection",
  exam: "/exam/create",
  transport: "/transport/pickup-points",
  admin: "/admin/users",
};

const prettify = (segment) =>
  decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const PageHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // "/students/admission" -> ["students", "admission"]
  const segments = pathname.split("/").filter(Boolean);
  const isHome = segments.length === 0;

  // Home > Students > Student Admission
  const crumbs = [{ label: "Home", to: "/", isHome: true }];
  segments.forEach((seg, i) => {
    const full = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    crumbs.push(
      isLast
        ? { label: PAGE_TITLES[full] || prettify(seg), to: full }
        : { label: SEGMENT_LABELS[seg] || prettify(seg), to: FOLDER_LANDING[seg] || full }
    );
  });

  const title = isHome ? PAGE_TITLES["/"] : crumbs[crumbs.length - 1].label;

  const goBack = () => {
    // Go back in history if possible, otherwise go up one level
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      const parent = "/" + segments.slice(0, -1).join("/");
      navigate(parent === "/" ? "/" : parent);
    }
  };

  return (
    <header className="PageHeader">
      {!isHome && (
        <button
          type="button"
          className="PageHeader-back"
          onClick={goBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      <h1 className="PageHeader-title">{title}</h1>

      <span className="PageHeader-divider" aria-hidden="true" />

      <nav className="PageHeader-nav" aria-label="Breadcrumb">
        <ol className="PageHeader-crumbs">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={`${c.to}-${i}`} className="PageHeader-crumb">
                {isLast ? (
                  <span aria-current="page" className="PageHeader-current">
                    {c.isHome && <Home size={14} />}
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.to} className="PageHeader-link">
                    {c.isHome && <Home size={14} />}
                    {c.label}
                  </Link>
                )}
                {!isLast && <ChevronRight size={14} className="PageHeader-sep" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
};

export default PageHeader;
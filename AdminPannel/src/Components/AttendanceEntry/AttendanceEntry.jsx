import { useEffect, useMemo, useRef, useState } from "react";
import "./AttendanceEntry.css";

/* ------------------------------------------------------------------ */
/*  Demo data – pass your own with props                               */
/*  <AttendanceEntry                                                   */
/*     groups={[{ classNo: "5", sections: [{ section, total, mobile,   */
/*              present, absent, halfDay, leave }] }]}                 */
/*     classOptions / sectionOptions = [{ value, label }]              */
/*     onDateChange={(date) => {}}              // daily tab           */
/*     onPrint={() => {}}                       // daily tab           */
/*     onAction={(classNo, sectionRow) => {}}   // daily tab           */
/*     onGetMonthly={async (filters) => rows}   // monthly tab         */
/*     onGetBiometric={async (filters) => rows} // biometric tab       */
/*     onExport={(tabKey, rows, filters) => {}} // biometric Excel     */
/*  />                                                                 */
/* ------------------------------------------------------------------ */
const DEFAULT_TABS = [
  { key: "daily", label: "Daily Attendance" },
  { key: "monthly", label: "Monthly Attendance" },
  { key: "biometric", label: "Biometric Attendance" },
];

const DEFAULT_GROUPS = [
  {
    classNo: "5",
    sections: [
      { section: "A", total: 2, mobile: "", present: 0, absent: 1, halfDay: 0, leave: 0 },
      { section: "B", total: 1, mobile: "", present: 0, absent: 0, halfDay: 0, leave: 0 },
    ],
  },
];

const DEFAULT_CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => ({ value: c, label: c }));
const DEFAULT_SECTIONS = ["A", "B", "C", "D"].map((s) => ({ value: s, label: s }));

const HEADERS = ["CLASS", "SECTION", "TOTAL STUDENT", "MOBILE NO.", "PRESENT", "ABSENT", "HALF DAY", "LEAVE", "ACTION"];

const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
const PrintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 9V3h10v6" />
    <rect x="3" y="9" width="18" height="9" rx="2" />
    <rect x="7" y="14" width="10" height="7" rx="1" fill="#fff" />
  </svg>
);

const UserCheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10" cy="7.5" r="4" fill="currentColor" />
    <path d="M2.5 20c0-4 3.3-6.5 7.5-6.5 1.2 0 2.3.2 3.3.6a5.5 5.5 0 0 0-1.6 3.9c0 .7.1 1.4.4 2H2.5z" fill="currentColor" />
    <circle cx="17.5" cy="17.5" r="4.2" fill="currentColor" stroke="#fff" strokeWidth="1.4" />
    <path d="M15.5 17.6l1.5 1.5 2.6-2.8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Floating-label input (date / month)                                */
/* ------------------------------------------------------------------ */
const InputField = ({ id, label, type = "date", value, onChange, required }) => (
  <div className="ae-field">
    <div className="ae-field__box ae-field__box--input">
      <input id={id} type={type} className="ae-field__input" value={value} onChange={(e) => onChange(e.target.value)} />
      <label htmlFor={id} className="ae-field__label">
        {label}
        {required && <span className="ae-field__star"> *</span>}
      </label>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Styled dropdown                                                    */
/* ------------------------------------------------------------------ */
const SelectField = ({ id, label, value, options, onChange, required, placeholder = "Select" }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex > -1 ? options[selectedIndex] : null;

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const openMenu = () => {
    setActive(selectedIndex > -1 ? selectedIndex : 0);
    setOpen(true);
  };
  const choose = (v) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openMenu();
      else setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openMenu();
      else setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) openMenu();
      else if (active > -1) choose(options[active].value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="ae-field" ref={wrapRef}>
      <div className={`ae-field__box ${open ? "ae-field__box--open" : ""} ${selected ? "ae-field__box--filled" : "ae-field__box--empty"}`}>
        <button
          type="button"
          id={id}
          className="ae-field__btn"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
        >
          {selected ? selected.label : placeholder}
        </button>

        <label htmlFor={id} className="ae-field__label">
          {label}
          {required && <span className="ae-field__star"> *</span>}
        </label>

        <span className="ae-field__chevron"><ChevronIcon /></span>

        {open && (
          <ul id={`${id}-list`} className="ae-field__menu" role="listbox">
            {options.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={[
                  "ae-field__option",
                  o.value === value ? "ae-field__option--selected" : "",
                  i === active ? "ae-field__option--active" : "",
                ].join(" ")}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o.value)}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Attendance entry                                                   */
/* ------------------------------------------------------------------ */
const AttendanceEntry = ({
  tabs = DEFAULT_TABS,
  groups = DEFAULT_GROUPS,
  classOptions = DEFAULT_CLASSES,
  sectionOptions = DEFAULT_SECTIONS,
  defaultTab = "daily",
  defaultDate,
  defaultClass = "5",
  onDateChange,
  onPrint,
  onAction,
  onGetMonthly,
  onGetBiometric,
  onExport,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  /* daily */
  const [date, setDate] = useState(defaultDate || todayISO());

  /* monthly */
  const [month, setMonth] = useState("");
  const [classNo, setClassNo] = useState(defaultClass);
  const [section, setSection] = useState("");
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  /* biometric */
  const [startDate, setStartDate] = useState(defaultDate || todayISO());
  const [endDate, setEndDate] = useState(defaultDate || todayISO());
  const [bioRows, setBioRows] = useState([]);
  const [bioLoading, setBioLoading] = useState(false);

  /* totals of the daily bottom row */
  const totals = useMemo(() => {
    const t = { present: 0, absent: 0, halfDay: 0, leave: 0 };
    groups.forEach((g) =>
      g.sections.forEach((s) => {
        t.present += Number(s.present) || 0;
        t.absent += Number(s.absent) || 0;
        t.halfDay += Number(s.halfDay) || 0;
        t.leave += Number(s.leave) || 0;
      })
    );
    return t;
  }, [groups]);

  const handleDate = (e) => {
    setDate(e.target.value);
    onDateChange?.(e.target.value);
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  /* monthly Get */
  const monthlyFilters = { month, classNo, section };
  const canGetMonthly = !!month && !!classNo && !!section && !monthlyLoading;
  const handleGetMonthly = async () => {
    if (!canGetMonthly) return;
    setMonthlyLoading(true);
    try {
      const result = await onGetMonthly?.(monthlyFilters);
      setMonthlyRows(Array.isArray(result) ? result : []);
    } finally {
      setMonthlyLoading(false);
    }
  };

  /* biometric Get + Excel */
  const bioFilters = { startDate, endDate };
  const canGetBio = !!startDate && !!endDate && !bioLoading;
  const handleGetBio = async () => {
    if (!canGetBio) return;
    setBioLoading(true);
    try {
      const result = await onGetBiometric?.(bioFilters);
      setBioRows(Array.isArray(result) ? result : []);
    } finally {
      setBioLoading(false);
    }
  };
  const handleExport = () => {
    if (bioRows.length) onExport?.("biometric", bioRows, bioFilters);
  };

  return (
    <div className={`attendance-entry ${className}`}>
      {/* ---------- Tabs ---------- */}
      <div className="ae-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={activeTab === t.key}
            className={`ae-tab ${activeTab === t.key ? "ae-tab--active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------- Daily attendance ---------- */}
      {activeTab === "daily" && (
        <div className="ae-body">
          <div className="ae-toolbar">
            <input
              type="date"
              className="ae-date"
              value={date}
              onChange={handleDate}
              aria-label="Attendance date"
            />
            <button type="button" className="ae-print" onClick={handlePrint} aria-label="Print" title="Print">
              <PrintIcon />
            </button>
          </div>

          <div className="ae-card">
            <div className="ae-table-wrap">
              <table className="ae-table">
                <thead className="ae-thead">
                  <tr>
                    {HEADERS.map((h) => (
                      <th key={h} className="ae-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="ae-tbody">
                  {groups.map((g) =>
                    g.sections.map((s, i) => (
                      <tr key={`${g.classNo}-${s.section}-${i}`} className="ae-tr" data-class={g.classNo}>
                        {i === 0 && (
                          <td className="ae-td ae-td--class" rowSpan={g.sections.length}>
                            {g.classNo}
                          </td>
                        )}
                        <td className="ae-td ae-td--strong" data-label="Section">{s.section}</td>
                        <td className="ae-td" data-label="Total Student">{s.total}</td>
                        <td className="ae-td ae-td--mobile" data-label="Mobile No.">{s.mobile}</td>
                        <td className="ae-td ae-td--center" data-label="Present"><span className="ae-badge ae-badge--present">{s.present}</span></td>
                        <td className="ae-td ae-td--center" data-label="Absent"><span className="ae-badge ae-badge--absent">{s.absent}</span></td>
                        <td className="ae-td ae-td--center" data-label="Half Day"><span className="ae-badge ae-badge--half">{s.halfDay}</span></td>
                        <td className="ae-td ae-td--center" data-label="Leave"><span className="ae-badge ae-badge--leave">{s.leave}</span></td>
                        <td className="ae-td ae-td--center ae-td--action" data-label="Action">
                          <button
                            type="button"
                            className="ae-action"
                            aria-label="Take attendance"
                            title="Take attendance"
                            onClick={() => onAction?.(g.classNo, s)}
                          >
                            <UserCheckIcon />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="ae-tfoot">
                  <tr className="ae-total">
                    <td className="ae-tf ae-tf--label" colSpan={3}>TOTAL</td>
                    <td className="ae-tf ae-tf--center ae-tf--hide-sm">-</td>
                    <td className="ae-tf ae-tf--center" data-label="Present">{totals.present}</td>
                    <td className="ae-tf ae-tf--center" data-label="Absent">{totals.absent}</td>
                    <td className="ae-tf ae-tf--center" data-label="Half Day">{totals.halfDay}</td>
                    <td className="ae-tf ae-tf--center" data-label="Leave">{totals.leave}</td>
                    <td className="ae-tf ae-tf--hide-sm" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Monthly attendance ---------- */}
      {activeTab === "monthly" && (
        <div className="ae-body">
          <div className="ae-filters">
            <InputField id="ae-month" label="Select Month" type="month" required value={month} onChange={setMonth} />
            <SelectField id="ae-class" label="Select Class" required value={classNo} options={classOptions} onChange={setClassNo} />
            <SelectField id="ae-section" label="Select Section" required value={section} options={sectionOptions} onChange={setSection} />
            <button type="button" className="ae-btn ae-btn--primary" onClick={handleGetMonthly} disabled={!canGetMonthly}>
              Get
            </button>
          </div>
        </div>
      )}

      {/* ---------- Biometric attendance ---------- */}
      {activeTab === "biometric" && (
        <div className="ae-body">
          <h3 className="ae-heading">Fetch Your Data from Device.</h3>
          <div className="ae-filters">
            <InputField id="ae-start" label="Start Date" required value={startDate} onChange={setStartDate} />
            <InputField id="ae-end" label="End Date" required value={endDate} onChange={setEndDate} />
            <button type="button" className="ae-btn ae-btn--primary" onClick={handleGetBio} disabled={!canGetBio}>
              Get
            </button>
            <button type="button" className="ae-btn ae-btn--excel" onClick={handleExport} disabled={!bioRows.length}>
              <DownloadIcon />
              Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceEntry;
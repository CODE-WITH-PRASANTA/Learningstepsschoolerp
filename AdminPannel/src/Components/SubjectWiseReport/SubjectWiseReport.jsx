import { useEffect, useRef, useState } from "react";
import "./SubjectWiseReport.css";

/* ------------------------------------------------------------------ */
/*  Demo options – pass your own with props                            */
/*  <SubjectWiseReport                                                 */
/*     classOptions={[{ value: "5", label: "5" }]}                     */
/*     sectionOptions={...} subjectOptions={...}                       */
/*     onGet={async (filters) => rows}   // returns the report rows    */
/*     onExport={(rows, filters) => {}}  // Excel button               */
/*  />                                                                 */
/* ------------------------------------------------------------------ */
const DEFAULT_CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => ({ value: c, label: c }));
const DEFAULT_SECTIONS = ["A", "B", "C", "D"].map((s) => ({ value: s, label: s }));
const DEFAULT_SUBJECTS = ["Mathematics", "English", "Hindi", "Science", "Social Science", "Computer"].map((s) => ({ value: s, label: s }));

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
const Svg = ({ children, size = 18, stroke = 2, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ChevronIcon = () => <Svg size={16} stroke={2.4}><path d="M6 9l6 6 6-6" /></Svg>;
const CloseIcon = () => <Svg size={13} stroke={2.6}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
const ExcelIcon = () => (
  <Svg size={20} stroke={0} fill="currentColor">
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" opacity="0.35" />
    <path d="M3 6h12v12H3z" />
    <path d="M6.2 8.6l1.9 3.4-1.9 3.4h1.7l1.1-2.1 1.1 2.1h1.7L10 12l1.9-3.4h-1.7L9 10.7 7.9 8.6z" fill="#fff" />
  </Svg>
);

/* ------------------------------------------------------------------ */
/*  Styled dropdown                                                    */
/* ------------------------------------------------------------------ */
const SelectField = ({ id, label, value, options, onChange, required, clearable, placeholder = "Select" }) => {
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
    <div className="swr-field" ref={wrapRef}>
      <div className={`swr-field__box ${open ? "swr-field__box--open" : ""} ${selected ? "swr-field__box--filled" : "swr-field__box--empty"}`}>
        <button
          type="button"
          id={id}
          className="swr-field__btn"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
        >
          {selected ? selected.label : placeholder}
        </button>

        <label htmlFor={id} className="swr-field__label">
          {label}
          {required && <span className="swr-field__star"> *</span>}
        </label>

        {clearable && selected && (
          <button type="button" className="swr-field__clear" aria-label="Clear" onClick={() => onChange("")}>
            <CloseIcon />
          </button>
        )}
        <span className="swr-field__chevron"><ChevronIcon /></span>

        {open && (
          <ul id={`${id}-list`} className="swr-field__menu" role="listbox">
            {options.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={[
                  "swr-field__option",
                  o.value === value ? "swr-field__option--selected" : "",
                  i === active ? "swr-field__option--active" : "",
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
/*  Subject wise report                                                */
/* ------------------------------------------------------------------ */
const SubjectWiseReport = ({
  classOptions = DEFAULT_CLASSES,
  sectionOptions = DEFAULT_SECTIONS,
  subjectOptions = DEFAULT_SUBJECTS,
  defaultClass = "5",
  onGet,
  onExport,
  className = "",
}) => {
  const [classNo, setClassNo] = useState(defaultClass);
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const canGet = !!classNo && !!section && !loading;
  const filters = { classNo, section, subject };

  const handleGet = async () => {
    if (!canGet) return;
    setLoading(true);
    try {
      const result = await onGet?.(filters);
      setRows(Array.isArray(result) ? result : []);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (rows.length) onExport?.(rows, filters);
  };

  return (
    <div className={`subject-wise-report ${className}`}>
      {/* ---------- Filters (one line) ---------- */}
      <div className="swr-toolbar">
        <SelectField
          id="swr-class"
          label="Select Class"
          required
          clearable
          value={classNo}
          options={classOptions}
          onChange={setClassNo}
        />
        <SelectField
          id="swr-section"
          label="Select Section"
          required
          clearable
          value={section}
          options={sectionOptions}
          onChange={setSection}
        />
        <SelectField
          id="swr-subject"
          label="Select Subject"
          clearable
          value={subject}
          options={subjectOptions}
          onChange={setSubject}
        />

        <button type="button" className="swr-btn swr-btn--primary" onClick={handleGet} disabled={!canGet}>
          Get
        </button>
        <button type="button" className="swr-btn swr-btn--icon" onClick={handleExport} disabled={!rows.length} aria-label="Export to Excel" title="Export to Excel">
          <ExcelIcon />
        </button>
      </div>

      {/* ---------- Simple background container (nothing inside) ---------- */}
      <div className="swr-card" />
    </div>
  );
};

export default SubjectWiseReport;
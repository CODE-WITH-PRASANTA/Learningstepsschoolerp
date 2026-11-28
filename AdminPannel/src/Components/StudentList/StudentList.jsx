import { useEffect, useMemo, useRef, useState } from "react";
import "./StudentList.css";

/* ------------------------------------------------------------------ */
/*  Student photos from your assets folder                             */
/* ------------------------------------------------------------------ */
import studentOne from "../../assets/09.jpeg";
import studentTwo from "../../assets/9999.jpeg";
import studentThree from "../../assets/1783249344273.jpg";

/* Demo data – pass your real list with <StudentList students={data} /> */
const DEFAULT_STUDENTS = [
  { id: 3, sNo: 3, scholarNo: "09", code: "", name: "Nandani Joshi", fatherName: "Naveen Chandra Joshi", contact: "9694949690", classNo: "5", section: "A", shift: "mmm", remark: "", photo: studentOne },
  { id: 2, sNo: 2, scholarNo: "01", code: "", name: "SAKIL SK", fatherName: "SACHIB SK", contact: "123456", classNo: "5", section: "B", shift: "mmm", remark: "", photo: studentTwo },
  { id: 1, sNo: 1, scholarNo: "9999", code: "23", name: "Anjana", fatherName: "shiv", contact: "9876543210", classNo: "5", section: "A", shift: "m", remark: "", photo: studentThree },
];

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
/*  sortable: true → small triangle icon in the header.
    1st click = whole list Last → First (descending)
    2nd click = First → Last (ascending), then it keeps toggling.      */
const COLUMNS = [
  { key: "sNo", label: "S. NO." },
  { key: "scholarNo", label: "SCHOLAR NO.", sortable: true },
  { key: "code", label: "CODE", sortable: true },
  { key: "name", label: "NAME", sortable: true },
  { key: "fatherName", label: "FATHER NAME", sortable: true },
  { key: "contact", label: "CONTACT", sortable: true },
  { key: "classNo", label: "CLASS" },
  { key: "section", label: "SECTION" },
  { key: "shift", label: "SHIFT" },
  { key: "remark", label: "REMARK" },
  { key: "action", label: "ACTION" },
];

const SEARCH_KEYS = ["sNo", "scholarNo", "code", "name", "fatherName", "contact"];

const SORT_DIRECTION_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

/* "recent" = most recent admission (uses the student id) */
const SORT_BY_OPTIONS = [
  { value: "name", label: "Student Name" },
  { value: "recent", label: "Recent Admission" },
  { value: "sNo", label: "Serial No." },
  { value: "scholarNo", label: "Scholar No." },
  { value: "code", label: "Code" },
  { value: "fatherName", label: "Father Name" },
  { value: "contact", label: "Contact" },
];
const SORT_KEY_MAP = { recent: "id" };

const PER_PAGE_OPTIONS = [10, 25, 50, 100].map((n) => ({ value: String(n), label: `${n} Per Page` }));

/* three-dot menu items – onAction(key, student) is called on click */
const MENU_ITEMS = [
  { key: "view", label: "View Profile", icon: "user", tone: "green" },
  { key: "edit", label: "Edit", icon: "edit" },
  { key: "restrict", label: "Restrict Student", icon: "edit", tone: "danger" },
  { key: "fees", label: "Fees Edit", icon: "rupee" },
  { key: "download", label: "Download Filled Form", icon: "print" },
  { key: "study", label: "Study Certificate", icon: "badge" },
  { key: "bonafide", label: "Bonafied Certificate", icon: "badge" },
  { key: "birth", label: "Birth Certificate", icon: "badge" },
];

const compare = (a, b) =>
  String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
const Svg = ({ children, size = 18, stroke = 2, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ChevronIcon = () => <Svg size={16} stroke={2.6}><path d="M6 9l6 6 6-6" /></Svg>;
const CloseIcon = () => <Svg size={14} stroke={2.6}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
const SearchIcon = () => <Svg size={17}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>;
const ResetIcon = () => <Svg size={17}><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v5h-5" /></Svg>;
const DoubleLeftIcon = () => <Svg size={18} stroke={2.6}><path d="M12 6l-6 6 6 6" /><path d="M19 6l-6 6 6 6" /></Svg>;
const DoubleRightIcon = () => <Svg size={18} stroke={2.6}><path d="M12 6l6 6-6 6" /><path d="M5 6l6 6-6 6" /></Svg>;

/* small stacked triangles – the active direction is highlighted */
const SortIcon = ({ dir }) => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
    <path d="M5 1L9 6H1z" className={dir === "asc" ? "sl-sort__on" : "sl-sort__off"} />
    <path d="M5 13L1 8h8z" className={dir === "desc" ? "sl-sort__on" : "sl-sort__off"} />
  </svg>
);

const MenuIcon = ({ name }) => {
  switch (name) {
    case "user":
      return <Svg size={18} stroke={2}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18.2c1.4-2 3.2-3 5.5-3s4.1 1 5.5 3" /></Svg>;
    case "edit":
      return <Svg size={18} stroke={2}><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /><path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L12 14.6 8 15.6l1-4z" /></Svg>;
    case "rupee":
      return <Svg size={18} stroke={2.4}><path d="M7 5h10" /><path d="M7 9h10" /><path d="M7 5c5 0 7 1.5 7 4s-2 4-7 4l8 6" /></Svg>;
    case "print":
      return <Svg size={18} stroke={0} fill="currentColor"><path d="M7 3h10v4H7z" /><path d="M5 8h14a2 2 0 0 1 2 2v6h-4v-3H7v3H3v-6a2 2 0 0 1 2-2z" /><path d="M8 15h8v6H8z" /></Svg>;
    case "badge":
    default:
      return <Svg size={18} stroke={0} fill="currentColor"><path d="M12 1l2.2 2.1 3-.5.9 2.9 2.8 1.3-.9 2.9L21 12l-1.9 2.3.9 2.9-2.8 1.3-.9 2.9-3-.5L12 23l-2.2-2.1-3 .5-.9-2.9-2.8-1.3.9-2.9L3 12l1.9-2.3-.9-2.9 2.8-1.3.9-2.9 3 .5z" /></Svg>;
  }
};

/* ------------------------------------------------------------------ */
/*  Styled dropdown                                                    */
/* ------------------------------------------------------------------ */
const SelectField = ({ id, label, value, options, onChange, required, clearable, placeholder = "Select", className = "" }) => {
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
    <div className={`sl-field ${className}`} ref={wrapRef}>
      <div className={`sl-field__box ${open ? "sl-field__box--open" : ""} ${selected ? "" : "sl-field__box--empty"}`}>
        <button
          type="button"
          id={id}
          className="sl-field__btn"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
        >
          {selected ? selected.label : placeholder}
        </button>

        {label && (
          <label htmlFor={id} className="sl-field__label">
            {label}
            {required && <span className="sl-field__star"> *</span>}
          </label>
        )}

        {clearable && selected && (
          <button type="button" className="sl-field__clear" aria-label="Clear" onClick={() => onChange("")}>
            <CloseIcon />
          </button>
        )}
        <span className="sl-field__chevron"><ChevronIcon /></span>

        {open && (
          <ul id={`${id}-list`} className="sl-field__menu" role="listbox">
            {options.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={[
                  "sl-field__option",
                  o.value === value ? "sl-field__option--selected" : "",
                  i === active ? "sl-field__option--active" : "",
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
/*  Small table parts                                                  */
/* ------------------------------------------------------------------ */
const Avatar = ({ photo, name }) => (
  <span className="sl-avatar">
    {photo ? <img src={photo} alt={name} /> : <span>{name?.charAt(0)?.toUpperCase()}</span>}
  </span>
);

/* three-dot action menu (fixed position, so the table never clips it) */
const MENU_HEIGHT = MENU_ITEMS.length * 40 + 16;

const RowMenu = ({ student, onAction }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({});
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const right = Math.max(8, window.innerWidth - r.right);
      const openUp = r.bottom + MENU_HEIGHT > window.innerHeight && r.top > MENU_HEIGHT;
      setPos(openUp ? { right, bottom: window.innerHeight - r.top + 4 } : { right, top: r.bottom + 4 });
    }
    setOpen((o) => !o);
  };

  const run = (key) => {
    setOpen(false);
    onAction?.(key, student);
  };

  return (
    <div className="sl-rowmenu" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className={`sl-rowmenu__btn ${open ? "sl-rowmenu__btn--open" : ""}`}
        aria-label="Actions"
        aria-expanded={open}
        onClick={toggle}
      >
        <span /><span /><span />
      </button>

      {open && (
        <ul className="sl-rowmenu__list" role="menu" style={pos}>
          {MENU_ITEMS.map((item) => (
            <li
              key={item.key}
              role="menuitem"
              className={`sl-rowmenu__item ${item.tone ? `sl-rowmenu__item--${item.tone}` : ""}`}
              onClick={() => run(item.key)}
            >
              <MenuIcon name={item.icon} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Student list                                                       */
/* ------------------------------------------------------------------ */
const StudentList = ({ students = DEFAULT_STUDENTS, onAction }) => {
  const [searchText, setSearchText] = useState(""); // what is typed
  const [search, setSearch] = useState("");         // used after pressing Get / Enter
  const [sortDir, setSortDir] = useState("desc");   // changes the list immediately
  const [sortBy, setSortBy] = useState("");         // changes the list immediately
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);

  /* ---------------- actions ---------------- */
  const handleGet = () => {
    setSearch(searchText);
    setPage(1);
  };

  const handleReset = () => {
    setSearchText("");
    setSearch("");
    setSortDir("desc");
    setSortBy("");
    setPerPage("10");
    setPage(1);
  };

  /* top dropdowns – work instantly */
  const changeSortDir = (v) => {
    setSortDir(v);
    setPage(1);
  };
  const changeSortBy = (v) => {
    setSortBy(v);
    setPage(1);
  };

  /* header triangle icon:
     1st click → full list Last → First (descending)
     next click → First → Last (ascending), and so on            */
  const handleHeaderSort = (key) => {
    const nextDir = sortBy === key ? (sortDir === "desc" ? "asc" : "desc") : "desc";
    setSortBy(key);
    setSortDir(nextDir);
    setPage(1);
  };

  /* ---------------- search + sort ---------------- */
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = students.filter(
      (s) => !q || SEARCH_KEYS.some((k) => String(s[k] ?? "").toLowerCase().includes(q))
    );

    const key = SORT_KEY_MAP[sortBy] || sortBy || "sNo";
    const dir = (sortDir || "desc") === "asc" ? 1 : -1;

    /* tie-breaker on S. No. so "descending" is always the exact reverse of "ascending" */
    return [...list].sort((a, b) => (compare(a[key], b[key]) || compare(a.sNo, b.sNo)) * dir);
  }, [students, search, sortBy, sortDir]);

  /* ---------------- per page (with "All Results") ---------------- */
  const perPageOptions = useMemo(
    () => [...PER_PAGE_OPTIONS, { value: "all", label: `All Results (${rows.length})` }],
    [rows.length]
  );

  /* ---------------- pagination ---------------- */
  const size = perPage === "all" ? Math.max(rows.length, 1) : Number(perPage);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * size, safePage * size);

  /* ---------------- render ---------------- */
  const renderCell = (s, col) => {
    switch (col.key) {
      case "name":
        return (
          <td key={col.key} className="sl-td sl-td--name">
            <span className="sl-namecell">
              <Avatar photo={s.photo} name={s.name} />
              <span>{s.name}</span>
            </span>
          </td>
        );
      case "action":
        return (
          <td key={col.key} className="sl-td">
            <RowMenu student={s} onAction={onAction} />
          </td>
        );
      default:
        return <td key={col.key} className="sl-td">{s[col.key]}</td>;
    }
  };

  return (
    <div className="student-list">
      {/* ---------- Toolbar (single line) ---------- */}
      <div className="sl-toolbar">
        <div className="sl-search">
          <input
            id="sl-search"
            className="sl-search__input"
            type="text"
            placeholder="Sr No / Code / Name / Father / Contact"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGet()}
          />
          <label htmlFor="sl-search" className="sl-search__label">Search</label>
          <span className="sl-search__icon"><SearchIcon /></span>
        </div>

        <button type="button" className="sl-btn sl-btn--primary" onClick={handleGet}>
          Get
        </button>
        <button type="button" className="sl-btn sl-btn--soft" onClick={handleReset}>
          <ResetIcon />
          Reset
        </button>

        <SelectField
          id="sl-sort-dir"
          label="Select Sort Direction"
          required
          clearable
          value={sortDir}
          options={SORT_DIRECTION_OPTIONS}
          onChange={changeSortDir}
          className="sl-field--md"
        />
        <SelectField
          id="sl-sort-by"
          label="Select Sort By"
          required
          clearable
          value={sortBy}
          options={SORT_BY_OPTIONS}
          onChange={changeSortBy}
          className="sl-field--md"
        />

        <span className="sl-toolbar__spacer" />

        <SelectField
          id="sl-per-page"
          value={perPage}
          options={perPageOptions}
          onChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          className="sl-field--sm"
        />

        <div className="sl-pager">
          <button type="button" className="sl-pager__btn" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1} aria-label="Previous page">
            <DoubleLeftIcon />
          </button>
          <span className="sl-pager__text">{safePage} - {totalPages}</span>
          <button type="button" className="sl-pager__btn" onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages} aria-label="Next page">
            <DoubleRightIcon />
          </button>
        </div>
      </div>

      {/* ---------- Table ---------- */}
      <div className="sl-card">
        <div className="sl-table-wrap">
          <table className="sl-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const isActive = sortBy === col.key;
                  const nextDir = isActive && sortDir === "desc" ? "asc" : "desc";
                  return (
                    <th key={col.key} className="sl-th">
                      <span className="sl-th__inner">
                        {col.label}
                        {col.sortable && (
                          <button
                            type="button"
                            className={`sl-sort__btn ${isActive ? "sl-sort__btn--active" : ""}`}
                            onClick={() => handleHeaderSort(col.key)}
                            aria-label={`Sort ${col.label} ${nextDir === "asc" ? "first to last" : "last to first"}`}
                            title={nextDir === "asc" ? "First → Last" : "Last → First"}
                          >
                            <SortIcon dir={isActive ? sortDir : ""} />
                          </button>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {pageRows.length > 0 ? (
                pageRows.map((s) => (
                  <tr key={s.id} className="sl-tr">
                    {COLUMNS.map((col) => renderCell(s, col))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="sl-empty" colSpan={COLUMNS.length}>
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
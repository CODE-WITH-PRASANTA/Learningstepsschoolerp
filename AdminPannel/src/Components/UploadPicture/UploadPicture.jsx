import React, { useEffect, useRef, useState } from "react";
import "./UploadPicture.css";

/* ------------------------------------------------------------------ */
/*  Static options                                                     */
/* ------------------------------------------------------------------ */
const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const SECTION_OPTIONS = ["A", "B", "C", "D"].map((s) => ({ value: s, label: s }));
const SORT_OPTIONS = [
  { value: "roll", label: "Roll Number" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

/* ------------------------------------------------------------------ */
/*  Mock API – replace this with your real request                     */
/* ------------------------------------------------------------------ */
const MOCK_STUDENTS = [
  ["SAKIL SK", "SACHIB SK"],
  ["ANANYA SAHOO", "BIJAY SAHOO"],
  ["DEBASISH NAYAK", "RAMESH NAYAK"],
  ["ISHITA PANDA", "SURESH PANDA"],
  ["KABIR DAS", "MOHAN DAS"],
  ["LIPSA BEHERA", "PRAKASH BEHERA"],
  ["MANAS MISHRA", "DILIP MISHRA"],
  ["NANDINI ROUT", "SANJAY ROUT"],
  ["OMKAR PATRA", "GOPAL PATRA"],
  ["PRIYA SWAIN", "KISHORE SWAIN"],
  ["RAHUL JENA", "BIKASH JENA"],
  ["SNEHA PRADHAN", "NARESH PRADHAN"],
];

const fetchStudents = ({ classId, section, sortBy }) =>
  new Promise((resolve) => {
    // const res = await axios.get("/api/students", { params: { classId, section, sortBy } });
    // return res.data;
    setTimeout(() => {
      let list = MOCK_STUDENTS.map(([name, guardian], i) => ({
        id: `${classId}-${section}-${i + 1}`,
        name,
        guardian,
        rollNo: i + 1,
      }));

      if (sortBy === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
      else if (sortBy === "name-desc") list.sort((a, b) => b.name.localeCompare(a.name));
      else list.sort((a, b) => a.rollNo - b.rollNo);

      resolve(list);
    }, 900);
  });

/* ------------------------------------------------------------------ */
/*  Reusable outlined dropdown (custom options list)                   */
/* ------------------------------------------------------------------ */
const SelectField = ({ id, label, value, onChange, options, required, error, disabled, clearable }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  const items = clearable ? [{ value: "", label: "Select" }, ...options] : options;
  const selectedIndex = items.findIndex((o) => o.value === value);
  const selected = selectedIndex > -1 ? items[selectedIndex] : null;

  // close when clicking outside
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const openMenu = () => {
    if (disabled) return;
    setActive(selectedIndex > -1 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (v) => {
    onChange(v);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openMenu();
      else setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openMenu();
      else setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) openMenu();
      else if (active > -1) choose(items[active].value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="up-fieldwrap" ref={wrapRef}>
      <div
        className={[
          "up-field",
          selected && selected.value ? "" : "up-field--empty",
          error ? "up-field--error" : "",
          disabled ? "up-field--disabled" : "",
          open ? "up-field--open" : "",
        ].join(" ")}
      >
        <button
          type="button"
          id={id}
          className="up-field__select"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-required={required}
          aria-invalid={!!error}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleKeyDown}
        >
          {selected && selected.value ? selected.label : "Select"}
        </button>

        <label htmlFor={id} className="up-field__label">
          {label}
          {required && <span className="up-field__star"> *</span>}
        </label>

        <svg className="up-field__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>

        {open && (
          <ul id={`${id}-list`} className="up-field__menu" role="listbox">
            {items.map((o, i) => (
              <li
                key={o.value || "placeholder"}
                role="option"
                aria-selected={o.value === value}
                className={[
                  "up-field__option",
                  o.value === value && o.value !== "" ? "up-field__option--selected" : "",
                  i === active ? "up-field__option--active" : "",
                  o.value === "" ? "up-field__option--placeholder" : "",
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
      {error && <span className="up-field__error">{error}</span>}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Student card (avatar + roll no + drag & drop upload zone)          */
/* ------------------------------------------------------------------ */
const UploadIcon = () => (
  <svg className="up-drop__icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 15V4" />
    <path d="M8 8l4-4 4 4" />
    <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
  </svg>
);

const StudentCard = ({ student, index, photo, note, onFile }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (file) => file && onFile(student, file);

  return (
    <li className="up-card" style={{ "--i": index }}>
      <div className="up-card__head">
        <div className="up-card__avatar">
          {photo ? <img src={photo} alt={student.name} /> : <span>{student.name.charAt(0)}</span>}
        </div>
        <div className="up-card__names">
          <p className="up-card__name">{student.name}</p>
          <p className="up-card__guardian">{student.guardian}</p>
        </div>
      </div>

      <p className="up-card__roll">{String(student.rollNo).padStart(2, "0")}</p>

      <div
        className={["up-drop", dragging ? "up-drop--over" : "", photo ? "up-drop--done" : ""].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        {photo ? <img className="up-drop__preview" src={photo} alt="Selected" /> : <UploadIcon />}

        <button type="button" className="up-drop__browse" onClick={() => inputRef.current?.click()}>
          {photo ? "Change" : "Browse"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = ""; // allow re-selecting same file
          }}
        />

        {note && <p className={`up-drop__note up-drop__note--${note.type}`}>{note.text}</p>}
        <p className="up-drop__support">
          <span>*</span>File supported .png, .jpg &amp; .webp
        </p>
      </div>
    </li>
  );
};

/* ------------------------------------------------------------------ */
/*  Animated empty-state illustration                                  */
/* ------------------------------------------------------------------ */
const Spark = ({ x, y, color, cls }) => (
  <g transform={`translate(${x} ${y})`}>
    <path className={`up-art__spark ${cls}`} fill={color} d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2Z" />
  </g>
);

const EmptyIllustration = () => (
  <svg className="up-art" viewBox="0 0 260 300" role="img" aria-label="Data not found">
    <defs>
      <radialGradient id="up-blob" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#efe8ff" />
        <stop offset="70%" stopColor="#eaf6ff" />
        <stop offset="100%" stopColor="#eaf6ff" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* soft glow + dotted orbit */}
    <circle className="up-art__blob" cx="130" cy="180" r="112" fill="url(#up-blob)" />
    <circle className="up-art__ring" cx="130" cy="180" r="98" fill="none" stroke="#c9b8f5" strokeWidth="1.6" strokeDasharray="3 9" strokeLinecap="round" />

    {/* sparkles */}
    <Spark x={28} y={150} color="#7c5cdb" cls="up-art__spark--1" />
    <Spark x={236} y={120} color="#fd9c2f" cls="up-art__spark--2" />
    <Spark x={222} y={250} color="#7c5cdb" cls="up-art__spark--3" />
    <circle className="up-art__dot up-art__dot--1" cx="46" cy="235" r="4" fill="#f980a6" />
    <circle className="up-art__dot up-art__dot--2" cx="214" cy="185" r="3" fill="#2dbd6e" />

    {/* speech bubble */}
    <g transform="rotate(-8 90 40)">
      <g className="up-art__bubble">
        <rect x="20" y="10" width="150" height="62" rx="6" fill="#ee3b27" />
        <polygon points="80,72 110,72 100,92" fill="#ee3b27" />
        <text x="95" y="36" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="15">Oops!</text>
        <text x="95" y="58" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="15">Data Not Found</text>
      </g>
    </g>

    {/* ground shadow */}
    <ellipse className="up-art__shadow" cx="130" cy="280" rx="70" ry="12" fill="#e2e7f3" />

    {/* person (floats) */}
    <g className="up-art__person">
      <path d="M105 175 L100 270 H122 L128 175 Z" fill="#138a0a" />
      <path d="M128 175 L134 270 H156 L152 175 Z" fill="#138a0a" />
      <rect x="102" y="266" width="22" height="10" rx="4" fill="#111" />
      <rect x="134" y="266" width="22" height="10" rx="4" fill="#111" />
      <path d="M95 110 Q130 95 165 110 L172 175 H98 Z" fill="#fd9c2f" />
      <path d="M165 112 L178 170 L168 172 L158 128 Z" fill="#f0a98f" />
      <rect x="170" y="185" width="26" height="40" fill="#f980a6" />

      <g className="up-art__paper">
        <path d="M95 112 L70 150 L82 158 L102 128 Z" fill="#fd9c2f" />
        <rect x="42" y="125" width="34" height="48" fill="#e6e6e6" transform="rotate(-12 59 150)" />
      </g>

      <path d="M105 60 Q130 30 158 60 L160 110 H100 Z" fill="#1c1c1c" />
      <ellipse cx="130" cy="75" rx="20" ry="25" fill="#f0a98f" />
      <g className="up-art__eyes">
        <circle cx="123" cy="72" r="2" fill="#222" />
        <circle cx="137" cy="72" r="2" fill="#222" />
      </g>
    </g>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
const UploadPicture = () => {
  const [classId, setClassId] = useState("5");
  const [section, setSection] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");
  const [apiError, setApiError] = useState("");
  const [searched, setSearched] = useState({ classId: "", section: "" });

  const [photos, setPhotos] = useState({}); // { studentId: objectURL }
  const [notes, setNotes] = useState({}); // { studentId: {type, text} }
  const photosRef = useRef({});
  photosRef.current = photos;

  // free object URLs on unmount
  useEffect(() => () => Object.values(photosRef.current).forEach(URL.revokeObjectURL), []);


  /* ---------------- Get button ---------------- */
  const handleGet = async () => {
    if (loading) return;

    if (!section) {
      setSectionError("Please select a section");
      return;
    }

    setSectionError("");
    setApiError("");
    setLoading(true);

    try {
      const data = await fetchStudents({ classId, section, sortBy });
      setStudents(data);
      setSearched({ classId, section });
    } catch (err) {
      console.error(err);
      setStudents([]);
      setApiError("Could not load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Picture upload ---------------- */
  const handlePictureChange = (student, file) => {
    const setNote = (type, text) =>
      setNotes((prev) => ({ ...prev, [student.id]: { type, text } }));

    if (!ALLOWED_TYPES.includes(file.type)) {
      setNote("error", "Only .png, .jpg or .webp allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setNote("error", "Image must be under 2 MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setPhotos((prev) => {
      if (prev[student.id]) URL.revokeObjectURL(prev[student.id]);
      return { ...prev, [student.id]: url };
    });
    setNote("success", file.name.length > 24 ? file.name.slice(0, 21) + "..." : file.name);

    // TODO: send to your server
    // const form = new FormData();
    // form.append("studentId", student.id);
    // form.append("photo", file);
    // await axios.post("/api/students/upload-picture", form);
  };

  /* ---------------- Render ---------------- */
  const renderContent = () => {
    if (loading) {
      return (
        <ul className="up-list" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="up-card up-card--skeleton">
              <div className="up-card__head">
                <span className="up-skel up-skel--avatar" />
                <span className="up-skel__lines">
                  <span className="up-skel up-skel--line" />
                  <span className="up-skel up-skel--line up-skel--short" />
                </span>
              </div>
              <span className="up-skel up-skel--zone" />
            </li>
          ))}
        </ul>
      );
    }

    if (apiError) {
      return (
        <div className="up-message up-message--error" role="alert">
          {apiError}
        </div>
      );
    }

    if (students.length > 0) {
      return (
        <>
          <p className="up-summary" aria-live="polite">
            <strong>{students.length}</strong> students found · Class {searched.classId} · Section {searched.section}
          </p>

          <ul className="up-list">
            {students.map((s, i) => (
              <StudentCard
                key={s.id}
                student={s}
                index={i}
                photo={photos[s.id]}
                note={notes[s.id]}
                onFile={handlePictureChange}
              />
            ))}
          </ul>
        </>
      );
    }

    return (
      <div className="up-empty">
        <EmptyIllustration />
        <p className="up-empty__title">No Student Found</p>
        <p className="up-empty__hint">Choose a class and section, then press Get.</p>
      </div>
    );
  };

  return (
    <div className="upload-picture">
      <div className="up-panel">
        {/* ---------- Filters ---------- */}
        <div className="up-filters">
          <SelectField id="classId" label="Select Class" value={classId} onChange={setClassId} options={CLASS_OPTIONS} />
          <SelectField
            id="section"
            label="Select Section"
            required
            value={section}
            onChange={(v) => {
              setSection(v);
              setSectionError("");
            }}
            options={SECTION_OPTIONS}
            error={sectionError}
          />
          <SelectField id="sortBy" label="Sort By" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />

          <button
            type="button"
            className={`up-get-btn ${loading ? "up-get-btn--loading" : ""}`}
            onClick={handleGet}
            disabled={loading}
          >
            <span className="up-get-btn__text">{loading ? "Loading" : "Get"}</span>
            {loading ? (
              <span className="up-get-btn__spinner" aria-hidden="true" />
            ) : (
              <svg className="up-get-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
        </div>

        {/* ---------- Content ---------- */}
        <div className="up-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default UploadPicture;
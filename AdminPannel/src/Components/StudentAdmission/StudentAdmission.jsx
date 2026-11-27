import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  GraduationCap,
  UserPlus,
  CircleUserRound,
  Printer,
  Copy,
  Check,
  X,
  Plus,
  User,
  Upload,
  Trash2,
  ChevronDown,
} from "lucide-react";
import "./StudentAdmission.css";

/* ================================================================== */
/* CONFIG                                                              */
/* ================================================================== */
const ADMISSION_LINK = "https://portal.paaschool.in/admission"; // put your real link here

const CLASSES = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)];
const SECTIONS = ["A", "B", "C", "D"];
const GENDERS = ["Male", "Female", "Other"];
const ADMISSION_TYPES = ["New", "Old"];
const RELIGIONS = ["Hindu", "Muslim", "Sikh", "Christian", "Other"];
const CATEGORIES = ["General", "SC", "ST", "OBC"];
const YES_NO = ["No", "Yes"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const OCCUPATIONS = [
  "Farmer",
  "Government Service",
  "Private Service",
  "Business",
  "Self Employed",
  "Teacher",
  "Doctor",
  "Engineer",
  "Driver",
  "Labourer",
  "Retired",
  "Other",
];
const FEE_CATEGORIES = ["Regular", "Staff child", "Sibling concession", "RTE", "Scholarship"];
const PAYMENT_MODES = ["Cash", "UPI", "Cheque", "Bank transfer"];

const STEPS = [
  { label: "First", title: "Basic Information" },
  { label: "Second", title: "Parent's Information" },
  { label: "Third", title: "Previous Details" },
  { label: "Fourth", title: "Fees" },
];

const STEP_INTRO = [
  { title: "Student Information", sub: "Capture the primary admission and student profile details." },
  { title: "Parent's Information", sub: "Add the parents' and guardian's contact details and the home address." },
  { title: "Previous Details", sub: "Record the school the student is coming from, if any." },
  { title: "Fees", sub: "Choose the fee category and record the amount paid at admission." },
];

const MAX_PHOTO_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const todayStr = () => new Date().toISOString().slice(0, 10);

const INITIAL = {
  // Step 1
  adNo: "", admissionDate: todayStr(), session: "2026-27",
  srNo: "", deviceNo: "", formNo: "", apparId: "",
  studentName: "", aadhar: "", dob: "",
  gender: "", className: "", section: "",
  admissionType: "New", religion: "", category: "", handicap: "No", bloodGroup: "",
  // Step 2
  fatherName: "", fatherMobile: "", fatherEmail: "", fatherOccupation: "", fatherIncome: "",
  motherName: "", motherMobile: "", motherOccupation: "",
  guardianName: "", guardianContact: "",
  address: "", city: "", pinCode: "",
  // Step 3
  prevSchool: "", prevClass: "", maxMarks: "", boardMarks: "",
  // Step 4
  feeCategory: "", transport: "No", route: "",
  admissionFee: "", discount: "", amountPaid: "", paymentMode: "", remarks: "",
};

/* percentage is always calculated, never typed */
const calcPercent = (max, got) => {
  const m = Number(max);
  const g = Number(got);
  if (max === "" || got === "" || isNaN(m) || isNaN(g) || m <= 0) return "";
  return ((g / m) * 100).toFixed(2);
};

/* ================================================================== */
/* FIELD WRAPPER                                                       */
/* kind: "select" | "date" -> moves the green tick away from the       */
/* arrow / calendar icon so only ONE tick is ever visible              */
/* ================================================================== */
const Field = ({ label, required, error, value, className = "", kind, children }) => (
  <div
    className={`sa-field ${kind ? `sa-field--${kind}` : ""} ${error ? "has-error" : ""} ${className}`}
  >
    <label>
      {label} {required && <i>*</i>}
    </label>
    {children}
    {required && value && !error && (
      <span className="sa-field__ok" aria-hidden="true">
        <Check size={12} strokeWidth={3.2} />
      </span>
    )}
    {error && <span className="sa-error">{error}</span>}
  </div>
);

/* ================================================================== */
/* SaDropdown: custom dropdown (replaces native <select>)              */
/* Menu is rendered in a portal with position: fixed, so it can never  */
/* be clipped by the drawer or flop outside the screen.                */
/* ================================================================== */
const DD_MAX_H = 260;
const DD_ROW_H = 40;

const SaDropdown = ({ value, onChange, options, placeholder = "Select", allowEmpty = false, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const items = allowEmpty ? ["", ...options] : options;

  /* work out where the menu goes (below or above, inside the screen) */
  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const gap = 6;
    const edge = 8;

    const wanted = Math.min(DD_MAX_H, items.length * DD_ROW_H + 12);
    const below = vh - r.bottom - gap - edge;
    const above = r.top - gap - edge;
    const up = below < wanted && above > below;

    const width = Math.min(r.width, vw - edge * 2);
    const left = Math.max(edge, Math.min(r.left, vw - width - edge));
    const maxHeight = Math.max(120, Math.min(DD_MAX_H, up ? above : below));

    setPos({
      left,
      width,
      maxHeight,
      ...(up ? { bottom: vh - r.top + gap } : { top: r.bottom + gap }),
    });
  }, [items.length]);

  const openMenu = () => {
    if (disabled) return;
    setActive(Math.max(0, items.indexOf(value)));
    setOpen(true);
  };

  const closeMenu = () => setOpen(false);

  const choose = (v) => {
    onChange(v);
    closeMenu();
    triggerRef.current?.focus();
  };

  /* position before paint, then keep it right on resize / scroll / outside click */
  useLayoutEffect(() => {
    if (!open) return;
    place();

    const onResize = () => place();
    const onScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      closeMenu();
    };
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      closeMenu();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, place]);

  /* keep the highlighted option visible (scroll the menu only) */
  useEffect(() => {
    if (!open || active < 0) return;
    const menu = menuRef.current;
    const li = menu?.children[active];
    if (!menu || !li) return;
    if (li.offsetTop < menu.scrollTop) menu.scrollTop = li.offsetTop - 6;
    else if (li.offsetTop + li.offsetHeight > menu.scrollTop + menu.clientHeight)
      menu.scrollTop = li.offsetTop + li.offsetHeight - menu.clientHeight + 6;
  }, [active, open, pos]);

  const onKeyDown = (e) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.min(items.length - 1, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.max(0, a - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openMenu();
        else if (active >= 0) choose(items[active]);
        break;
      case "Escape":
        if (open) {
          e.stopPropagation(); // closes the menu only, not the whole drawer
          closeMenu();
        }
        break;
      case "Tab":
        closeMenu();
        break;
      default:
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={`sa-dd-trigger ${open ? "is-open" : ""} ${value ? "" : "is-empty"}`}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="sa-dd-value">{value || placeholder}</span>
        <ChevronDown size={18} className="sa-dd-caret" />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={menuRef}
            className="sa-dd-menu"
            role="listbox"
            style={{
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              top: pos.top,
              bottom: pos.bottom,
            }}
          >
            {items.map((o, i) => (
              <li
                key={o || "__empty"}
                role="option"
                aria-selected={o === value}
                className={`sa-dd-option ${o === value ? "is-selected" : ""} ${i === active ? "is-active" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o)}
              >
                <span>{o === "" ? "None" : o}</span>
                {o === value && o !== "" && <Check size={16} />}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
};

/* ================================================================== */
/* NEW STUDENT ADMISSION DRAWER (4 steps)                              */
/* ================================================================== */
const AdmissionDrawer = ({ onClose, onSaved }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null); // { file, url }
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  /* works with normal inputs (event) and SaDropdown (plain value) */
  const set = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  /* lock page scroll + close on Escape */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /* free the preview URL */
  useEffect(() => {
    return () => {
      if (photo?.url) URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  /* ---------------- profile photo ---------------- */
  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("Choose an image file (JPG, PNG or WEBP)");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setPhotoError(`Photo must be under ${MAX_PHOTO_MB} MB`);
    setPhotoError("");
    setPhoto({ file, url: URL.createObjectURL(file) });
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoError("");
  };

  /* ---------------- validation ---------------- */
  const validate = (s) => {
    const e = {};
    const req = (k, msg) => { if (!String(form[k]).trim()) e[k] = msg; };
    const badNumber = (v) => v !== "" && (isNaN(v) || Number(v) < 0);

    if (s === 0) {
      req("adNo", "Admission no. is required");
      req("admissionDate", "Admission date is required");
      req("srNo", "SR no. is required");
      req("studentName", "Student name is required");
      req("dob", "Date of birth is required");
      req("gender", "Select a gender");
      req("className", "Select a class");
      req("section", "Select a section");
      if (form.aadhar && !/^\d{12}$/.test(form.aadhar)) e.aadhar = "Aadhar must be 12 digits";
    }
    if (s === 1) {
      req("fatherName", "Father's name is required");
      req("fatherMobile", "Mobile number is required");
      if (form.fatherMobile && !/^\d{10}$/.test(form.fatherMobile)) e.fatherMobile = "Must be 10 digits";
      if (form.fatherEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.fatherEmail.trim()))
        e.fatherEmail = "Enter a valid email";
      if (badNumber(form.fatherIncome)) e.fatherIncome = "Enter a valid amount";
      if (form.motherMobile && !/^\d{10}$/.test(form.motherMobile)) e.motherMobile = "Must be 10 digits";
      if (form.guardianContact && !/^\d{10}$/.test(form.guardianContact)) e.guardianContact = "Must be 10 digits";
      if (form.pinCode && !/^\d{6}$/.test(form.pinCode)) e.pinCode = "PIN must be 6 digits";
    }
    if (s === 2) {
      if (badNumber(form.maxMarks) || (form.maxMarks !== "" && Number(form.maxMarks) === 0))
        e.maxMarks = "Enter valid maximum marks";
      if (badNumber(form.boardMarks)) e.boardMarks = "Enter valid marks";
      if (!e.maxMarks && !e.boardMarks && form.boardMarks !== "") {
        if (form.maxMarks === "") e.maxMarks = "Enter maximum marks";
        else if (Number(form.boardMarks) > Number(form.maxMarks))
          e.boardMarks = "Cannot be more than maximum marks";
      }
    }
    if (s === 3) {
      req("feeCategory", "Select a fee category");
      ["admissionFee", "discount", "amountPaid"].forEach((k) => {
        if (form[k] !== "" && (isNaN(form[k]) || Number(form[k]) < 0)) e[k] = "Enter a valid amount";
      });
      if (form.transport === "Yes" && !form.route.trim()) e.route = "Enter the transport route";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goTo = (n) => {
    setStep(n);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const next = () => validate(step) && goTo(step + 1);
  const back = () => { setErrors({}); goTo(step - 1); };

  const prevPercent = calcPercent(form.maxMarks, form.boardMarks);

  const submit = () => {
    if (!validate(step)) return;

    // TODO: send to your API. Photo goes as a file, so use FormData:
    // const fd = new FormData();
    // Object.entries({ ...form, prevPercent }).forEach(([k, v]) => fd.append(k, v));
    // if (photo) fd.append("photo", photo.file);
    // await axios.post("/api/students/admission", fd);
    console.log("Admission data:", { ...form, prevPercent }, photo?.file);

    onSaved("Student admitted successfully");
    onClose();
  };

  const isLast = step === STEPS.length - 1;
  const intro = STEP_INTRO[step];

  return (
    <div className="sa-overlay sa-overlay--right" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="sa-drawer" role="dialog" aria-modal="true" aria-label="New student admission">
        <button type="button" className="sa-drawer__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="sa-drawer__scroll" ref={scrollRef}>
          {/* Journey banner */}
          <div className="sa-journey">
            <div className="sa-journey__top">
              <div>
                <h2>Admission Journey</h2>
                <p>Move step by step and keep the student profile complete from the start.</p>
              </div>
              <div className="sa-journey__badge">
                <b>Step {step + 1} of {STEPS.length}</b>
                {STEPS[step].title}
              </div>
            </div>

            <div className="sa-progress">
              <i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>

            <div className="sa-steps">
              {STEPS.map((s, i) => (
                <div key={s.title} style={{ display: "contents" }}>
                  <div className={`sa-step ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}>
                    <span className="sa-step__dot">{i < step ? <Check size={15} /> : i + 1}</span>
                    <span className="sa-step__text">
                      <b>{s.label}</b>
                      <span>{s.title}</span>
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <span className="sa-step__line" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step body */}
          <div className="sa-panel">
            <div className="sa-panel__head">
              <h3>{intro.title}</h3>
              <p>{intro.sub}</p>
            </div>

            {/* ============ STEP 1 ============ */}
            {step === 0 && (
              <>
                <div className="sa-top-row">
                  <div className="sa-photo">
                    <button
                      type="button"
                      className="sa-photo__ring"
                      onClick={() => fileRef.current?.click()}
                      aria-label="Upload student profile photo"
                    >
                      {photo ? <img src={photo.url} alt="Student preview" /> : <User size={56} />}
                      <span className="sa-photo__plus"><Plus size={16} /></span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
                    <small>
                      {photo ? photo.file.name : `Profile photo (JPG, PNG, max ${MAX_PHOTO_MB} MB)`}
                    </small>
                    {photo && (
                      <button type="button" className="sa-photo__remove" onClick={removePhoto}>
                        Remove photo
                      </button>
                    )}
                    {photoError && <span className="sa-error">{photoError}</span>}
                  </div>

                  <div className="sa-grid sa-grid--2">
                    <Field label="Admission No." required error={errors.adNo} value={form.adNo}>
                      <input value={form.adNo} onChange={set("adNo")} />
                    </Field>
                    <Field label="Admission Date" required kind="date" error={errors.admissionDate} value={form.admissionDate}>
                      <input type="date" value={form.admissionDate} onChange={set("admissionDate")} />
                    </Field>
                    <Field label="Admission Session">
                      <input value={form.session} onChange={set("session")} placeholder="2026-27" />
                    </Field>
                    <Field label="SR No." required error={errors.srNo} value={form.srNo}>
                      <input value={form.srNo} onChange={set("srNo")} />
                    </Field>
                    <Field label="Device No.">
                      <input value={form.deviceNo} onChange={set("deviceNo")} />
                    </Field>
                    <Field label="Form No.">
                      <input value={form.formNo} onChange={set("formNo")} />
                    </Field>
                    <Field label="APAAR ID" className="sa-span-2">
                      <input value={form.apparId} onChange={set("apparId")} />
                    </Field>
                  </div>
                </div>

                <hr className="sa-divider" />

                <div className="sa-grid">
                  <Field label="Student Name" required error={errors.studentName} value={form.studentName} className="sa-span-3">
                    <input value={form.studentName} onChange={set("studentName")} />
                  </Field>

                  <Field label="Aadhar No." error={errors.aadhar}>
                    <input inputMode="numeric" maxLength={12} value={form.aadhar} onChange={set("aadhar")} />
                  </Field>
                  <Field label="Date of Birth" required kind="date" error={errors.dob} value={form.dob}>
                    <input type="date" value={form.dob} onChange={set("dob")} />
                  </Field>
                  <Field label="Select Gender" required kind="select" error={errors.gender} value={form.gender}>
                    <SaDropdown value={form.gender} onChange={set("gender")} options={GENDERS} />
                  </Field>

                  <Field label="Select Class" required kind="select" error={errors.className} value={form.className}>
                    <SaDropdown value={form.className} onChange={set("className")} options={CLASSES} />
                  </Field>
                  <Field label="Select Section" required kind="select" error={errors.section} value={form.section}>
                    <SaDropdown value={form.section} onChange={set("section")} options={SECTIONS} />
                  </Field>
                  <Field label="Admission Type" kind="select">
                    <SaDropdown value={form.admissionType} onChange={set("admissionType")} options={ADMISSION_TYPES} />
                  </Field>

                  <Field label="Select Religion" kind="select">
                    <SaDropdown value={form.religion} onChange={set("religion")} options={RELIGIONS} allowEmpty />
                  </Field>
                  <Field label="Select Category" kind="select">
                    <SaDropdown value={form.category} onChange={set("category")} options={CATEGORIES} allowEmpty />
                  </Field>
                  <Field label="Handicap" kind="select">
                    <SaDropdown value={form.handicap} onChange={set("handicap")} options={YES_NO} />
                  </Field>

                  <Field label="Select Blood Group" kind="select">
                    <SaDropdown value={form.bloodGroup} onChange={set("bloodGroup")} options={BLOOD_GROUPS} allowEmpty />
                  </Field>
                </div>
              </>
            )}

            {/* ============ STEP 2 ============ */}
            {step === 1 && (
              <div className="sa-grid">
                {/* ---- Father (2 rows; the leftover space stays empty) ---- */}
                <Field label="Father's Name" required error={errors.fatherName} value={form.fatherName}>
                  <input value={form.fatherName} onChange={set("fatherName")} />
                </Field>
                <Field label="Father's Mobile" required error={errors.fatherMobile} value={form.fatherMobile}>
                  <input inputMode="numeric" maxLength={10} value={form.fatherMobile} onChange={set("fatherMobile")} />
                </Field>
                <Field label="Father's Email" error={errors.fatherEmail}>
                  <input type="email" inputMode="email" value={form.fatherEmail} onChange={set("fatherEmail")} />
                </Field>

                <Field label="Father's Occupation" kind="select">
                  <SaDropdown
                    value={form.fatherOccupation}
                    onChange={set("fatherOccupation")}
                    options={OCCUPATIONS}
                    allowEmpty
                  />
                </Field>
                <Field label="Annual Income (Rs.)" error={errors.fatherIncome}>
                  <input inputMode="decimal" value={form.fatherIncome} onChange={set("fatherIncome")} />
                </Field>

                {/* ---- Mother (always starts from the left) ---- */}
                <Field label="Mother's Name" className="sa-break">
                  <input value={form.motherName} onChange={set("motherName")} />
                </Field>
                <Field label="Mother's Mobile" error={errors.motherMobile}>
                  <input inputMode="numeric" maxLength={10} value={form.motherMobile} onChange={set("motherMobile")} />
                </Field>
                <Field label="Mother's Occupation">
                  <input value={form.motherOccupation} onChange={set("motherOccupation")} />
                </Field>

                {/* ---- Guardian (always starts from the left) ---- */}
                <Field label="Guardian's Name" className="sa-break">
                  <input value={form.guardianName} onChange={set("guardianName")} />
                </Field>
                <Field label="Guardian's Contact" error={errors.guardianContact}>
                  <input inputMode="numeric" maxLength={10} value={form.guardianContact} onChange={set("guardianContact")} />
                </Field>

                {/* ---- Address ---- */}
                <Field label="Address" className="sa-span-3">
                  <textarea value={form.address} onChange={set("address")} />
                </Field>
                <Field label="City / Village" className="sa-span-2">
                  <input value={form.city} onChange={set("city")} />
                </Field>
                <Field label="PIN Code" error={errors.pinCode}>
                  <input inputMode="numeric" maxLength={6} value={form.pinCode} onChange={set("pinCode")} />
                </Field>
              </div>
            )}

            {/* ============ STEP 3 ============ */}
            {step === 2 && (
              <div className="sa-grid">
                <Field label="School Name" className="sa-span-2">
                  <input value={form.prevSchool} onChange={set("prevSchool")} />
                </Field>
                <Field label="Class Name" kind="select">
                  <SaDropdown value={form.prevClass} onChange={set("prevClass")} options={CLASSES} allowEmpty />
                </Field>

                <Field label="Maximum Marks" error={errors.maxMarks}>
                  <input inputMode="decimal" value={form.maxMarks} onChange={set("maxMarks")} />
                </Field>
                <Field label="Board Marks" error={errors.boardMarks}>
                  <input inputMode="decimal" value={form.boardMarks} onChange={set("boardMarks")} />
                </Field>
                <Field label="Percentage (%)">
                  <input value={prevPercent} placeholder="Auto" disabled readOnly />
                </Field>
              </div>
            )}

            {/* ============ STEP 4 ============ */}
            {step === 3 && (
              <div className="sa-grid">
                <Field label="Fee Category" required kind="select" error={errors.feeCategory} value={form.feeCategory}>
                  <SaDropdown value={form.feeCategory} onChange={set("feeCategory")} options={FEE_CATEGORIES} />
                </Field>
                <Field label="Transport Required" kind="select">
                  <SaDropdown value={form.transport} onChange={set("transport")} options={YES_NO} />
                </Field>
                <Field label="Transport Route" required={form.transport === "Yes"} error={errors.route} value={form.route}>
                  <input value={form.route} onChange={set("route")} disabled={form.transport !== "Yes"} />
                </Field>

                <Field label="Admission Fee (Rs.)" error={errors.admissionFee}>
                  <input inputMode="decimal" value={form.admissionFee} onChange={set("admissionFee")} />
                </Field>
                <Field label="Discount (Rs.)" error={errors.discount}>
                  <input inputMode="decimal" value={form.discount} onChange={set("discount")} />
                </Field>
                <Field label="Amount Paid (Rs.)" error={errors.amountPaid}>
                  <input inputMode="decimal" value={form.amountPaid} onChange={set("amountPaid")} />
                </Field>

                <Field label="Payment Mode" kind="select">
                  <SaDropdown value={form.paymentMode} onChange={set("paymentMode")} options={PAYMENT_MODES} allowEmpty />
                </Field>
                <Field label="Remarks" className="sa-span-2">
                  <input value={form.remarks} onChange={set("remarks")} />
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sa-footer">
          <button type="button" className="sa-btn" onClick={onClose}>Cancel</button>
          <div className="sa-footer__right">
            {step > 0 && (
              <button type="button" className="sa-btn" onClick={back}>Back</button>
            )}
            {isLast ? (
              <button type="button" className="sa-btn sa-btn--primary" onClick={submit}>
                Save admission
              </button>
            ) : (
              <button type="button" className="sa-btn sa-btn--primary" onClick={next}>
                Next
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

/* ================================================================== */
/* UPLOAD PICTURE MODAL (batch photos)                                 */
/* ================================================================== */
const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// "1024.jpg" -> "1024"  (the file name is used as the admission number)
const admissionNoFrom = (name) => name.replace(/\.[^.]+$/, "").trim();

const UploadPictureModal = ({ onClose, onDone }) => {
  const [items, setItems] = useState([]); // { id, file, url, adNo, error }
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const itemsRef = useRef([]);
  itemsRef.current = items;

  /* close on Escape + lock page scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /* free every preview URL when the modal closes */
  useEffect(() => {
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url));
  }, []);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    setItems((prev) => {
      const known = new Set(prev.map((p) => `${p.file.name}-${p.file.size}`));
      const added = incoming
        .filter((f) => !known.has(`${f.name}-${f.size}`)) // skip exact duplicates
        .map((file) => {
          let error = "";
          if (!ALLOWED_TYPES.includes(file.type)) error = "Use JPG, PNG or WEBP";
          else if (file.size > MAX_PHOTO_MB * 1024 * 1024) error = `Over ${MAX_PHOTO_MB} MB`;
          else if (!/^[\w-]+$/.test(admissionNoFrom(file.name))) error = "Rename file to the admission no.";
          return {
            id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
            file,
            url: URL.createObjectURL(file),
            adNo: admissionNoFrom(file.name),
            error,
          };
        });
      return [...prev, ...added];
    });
  };

  const removeItem = (id) =>
    setItems((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((i) => i.id !== id);
    });

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.url));
    setItems([]);
  };

  const valid = items.filter((i) => !i.error);
  const invalidCount = items.length - valid.length;

  const upload = async () => {
    if (!valid.length) return;
    setBusy(true);
    try {
      // TODO: replace with your API call. The server should save each file
      // against the student whose admission number matches `adNo`.
      //
      // const fd = new FormData();
      // valid.forEach((i) => {
      //   fd.append("photos", i.file);
      //   fd.append("admissionNos", i.adNo);
      // });
      // await axios.post("/api/students/photos", fd);
      console.log(
        "Uploading photos:",
        valid.map((i) => ({ adNo: i.adNo, file: i.file.name }))
      );

      onDone(`${valid.length} photo${valid.length > 1 ? "s" : ""} uploaded`);
      onClose();
    } catch {
      onDone("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sa-overlay sa-overlay--center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sa-modal" role="dialog" aria-modal="true" aria-label="Upload student photos">
        <div className="sa-modal__head">
          <div>
            <h3>Upload student photos</h3>
            <p>
              Name each photo with the student's admission number, for example 1024.jpg.
              Up to {MAX_PHOTO_MB} MB each.
            </p>
          </div>
          <button type="button" className="sa-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="sa-modal__body">
          <div
            className={`sa-drop ${over ? "is-over" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
          >
            <Upload size={28} />
            <b>Drop photos here or click to choose</b>
            JPG, PNG or WEBP. You can select many files at once.
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
          </div>

          {items.length > 0 && (
            <ul className="sa-files">
              {items.map((i) => (
                <li className="sa-file" key={i.id}>
                  <img src={i.url} alt="" />
                  <div style={{ minWidth: 0 }}>
                    <div className="sa-file__name">{i.file.name}</div>
                    <div className="sa-file__meta">
                      Admission no. {i.adNo || "-"} · {formatSize(i.file.size)}
                    </div>
                  </div>
                  <span className={`sa-tag ${i.error ? "sa-tag--bad" : "sa-tag--ok"}`}>
                    {i.error || "Ready"}
                  </span>
                  <button type="button" onClick={() => removeItem(i.id)} aria-label={`Remove ${i.file.name}`}>
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sa-modal__foot">
          <span>
            {items.length === 0
              ? "No photos selected"
              : `${valid.length} ready${invalidCount ? `, ${invalidCount} need fixing` : ""}`}
          </span>
          <div className="sa-footer__right">
            {items.length > 0 && (
              <button type="button" className="sa-btn" onClick={clearAll}>Clear all</button>
            )}
            <button
              type="button"
              className="sa-btn sa-btn--primary"
              onClick={upload}
              disabled={!valid.length || busy}
            >
              {busy ? "Uploading..." : `Upload ${valid.length || ""} photo${valid.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* MAIN COMPONENT: the 5 option cards                                  */
/* ================================================================== */
const StudentAdmission = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const copyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(ADMISSION_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Could not copy the link");
    }
  };

  const cards = [
    {
      key: "new",
      tone: "red",
      icon: <GraduationCap size={28} />,
      title: "New Student Admission",
      desc: "Register a new student manually",
      onClick: () => setDrawerOpen(true),
    },
    {
      key: "online",
      tone: "blue",
      icon: <GraduationCap size={28} />,
      title: "Online Admission",
      desc: "Share link for online enrollment",
      onClick: () => {},
      extra: (
        <div className="sa-link">
          <span>{ADMISSION_LINK}</span>
          <button type="button" onClick={copyLink} aria-label="Copy admission link">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      ),
    },
    {
      key: "bulk",
      tone: "purple",
      icon: <UserPlus size={28} />,
      title: "Bulk Admission",
      desc: "Import multiple students via Excel",
      onClick: () => showToast("Bulk admission screen coming next"),
    },
    {
      key: "photo",
      tone: "orange",
      icon: <CircleUserRound size={28} />,
      title: "Upload Picture",
      desc: "Batch upload student photos",
      onClick: () => setUploadOpen(true),
    },
    {
      key: "blank",
      tone: "pink",
      icon: <Printer size={28} />,
      title: "Blank Form",
      desc: "Print physical admission form",
      onClick: () => window.print(),
    },
  ];

  return (
    <div className="sa-page">
      <div className="sa-cards">
        {cards.map((c) => (
          <div
            key={c.key}
            role="button"
            tabIndex={0}
            className={`sa-card sa-card--${c.tone}`}
            onClick={c.onClick}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && c.onClick()}
          >
            <div className="sa-card__icon">{c.icon}</div>
            <h3 className="sa-card__title">{c.title}</h3>
            <p className="sa-card__desc">{c.desc}</p>
            {c.extra}
          </div>
        ))}
      </div>

      {drawerOpen && (
        <AdmissionDrawer onClose={() => setDrawerOpen(false)} onSaved={showToast} />
      )}

      {uploadOpen && (
        <UploadPictureModal onClose={() => setUploadOpen(false)} onDone={showToast} />
      )}

      {toast && (
        <div className="sa-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
};

export default StudentAdmission;
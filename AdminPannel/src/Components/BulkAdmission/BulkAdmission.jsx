import React from "react";
import "./BulkAdmission.css";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
const Svg = ({ children, size = 20, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const UsersIcon = () => (
  <Svg size={44} stroke={1.7}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3 20v-1.2A4.8 4.8 0 0 1 7.8 14h2.4A4.8 4.8 0 0 1 15 18.8V20" />
    <path d="M15.6 4.8a3.4 3.4 0 0 1 0 6.4" />
    <path d="M19 14.6a4.8 4.8 0 0 1 2 4.2V20" />
  </Svg>
);

const DatabaseIcon = () => (
  <Svg>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
    <path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
    <path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
  </Svg>
);

const UploadIcon = () => (
  <Svg>
    <path d="M12 15V4" />
    <path d="M8 8l4-4 4 4" />
    <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
  </Svg>
);

const DownloadIcon = () => (
  <Svg size={15} stroke={2.4}>
    <path d="M12 4v11" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </Svg>
);

/* ------------------------------------------------------------------ */
/*  Bulk Admission (UI only – the backend developer connects the       */
/*  three handlers below)                                              */
/*                                                                     */
/*  <BulkAdmission                                                     */
/*     onDownloadTemplate={() => ...}                                  */
/*     onImportFromSystem={() => ...}                                  */
/*     onUploadExcel={() => ...}                                       */
/*  />                                                                 */
/* ------------------------------------------------------------------ */
const BulkAdmission = ({ onDownloadTemplate, onImportFromSystem, onUploadExcel }) => {
  return (
    <div className="bulk">
      <section className="bulk__card">
        {/* top-right corner */}
        <div className="bulk__top">
          <button type="button" className="bulk-download" onClick={onDownloadTemplate}>
            <DownloadIcon />
            Download Template
          </button>
        </div>

        <div className="bulk__icon">
          <UsersIcon />
        </div>

        <h1 className="bulk__title">Import Student Data</h1>
        <p className="bulk__sub">Choose your preferred method to import student records</p>

        <div className="bulk__actions">
          <button type="button" className="bulk-btn bulk-btn--outline" onClick={onImportFromSystem}>
            <DatabaseIcon />
            Import from System
          </button>

          <button type="button" className="bulk-btn bulk-btn--primary" onClick={onUploadExcel}>
            <UploadIcon />
            Upload Excel File
          </button>
        </div>

        <p className="bulk__formats">Supported formats: .xlsx, .csv</p>
      </section>
    </div>
  );
};

export default BulkAdmission;
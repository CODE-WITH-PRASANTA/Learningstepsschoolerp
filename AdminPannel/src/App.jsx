
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import StudentAdmission from "./Components/StudentAdmission/StudentAdmission";
import UploadPicture from "./Components/UploadPicture/UploadPicture";
import BulkAdmission from "./Components/BulkAdmission/BulkAdmission";
import StudentList from "./Components/StudentList/StudentList";
import SubjectWiseReport from "./Components/SubjectWiseReport/SubjectWiseReport";
import AttendanceEntry from "./Components/AttendanceEntry/AttendanceEntry";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="students/admission"
            element={<StudentAdmission />}
          />
          <Route path="/students/admission/upload-picture" element={<UploadPicture />} />
          <Route path="/students/admission/upload-bulk" element={<BulkAdmission />} />
          <Route path="/students/list" element={<StudentList />} />
          <Route path="/students/subject-report" element={<SubjectWiseReport />} />
          <Route path="/students/attendance-entry" element={<AttendanceEntry />} />

        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;


import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import StudentAdmission from "./Components/StudentAdmission/StudentAdmission";

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

import { useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import LandingPage from "./Pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";


import StudentLayout from "./layouts/StudentLayout";
import StudentHome from "./student/Home";
import EditProfile from "./student/EditProfile";
import RegisterComplaint from "./student/RegisterComplaint";
import ComplaintHistory from "./student/ComplaintHistory";
import ComplaintProgress from "./student/ComplaintProgress";
import Ratings from "./student/Ratings";
import StudentSupport from "./student/Support";

// ================= LANDING SUB-PAGES =================
import HowItWorks from "./Pages/HowItWorks";
import Community from "./Pages/Community";
import AboutUs from "./Pages/AboutUs";
import ContactUs from "./Pages/ContactUs";



// ================= ADMIN =================
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminComplaints from "./admin/AdminComplaints";
import AdminStaff from "./admin/AdminStaff";
import AdminStudents from "./admin/AdminStudents";
import AdminStudentDetails from "./admin/AdminStudentDetails";
import StaffPerformance from "./admin/StaffPerformance";
import AdminSupport from "./admin/AdminSupport";
import AdminStaffUpdates from "./admin/AdminStaffUpdates";
import AdminReports from "./admin/AdminReports";
import AdminInventory from "./admin/AdminInventory";
import AdminMaintenance from "./admin/AdminMaintenance";
import AdminBroadcast from "./admin/AdminBroadcast";

// ================= STAFF =================
import StaffLayout from "./staff/StaffLayout";
import StaffDashboard from "./staff/StaffDashboard";
import AssignedComplaints from "./staff/AssignedComplaints";
import ResolutionHistory from "./staff/ResolutionHistory";
import StaffInventory from "./staff/StaffInventory";
import StaffMaintenance from "./staff/StaffMaintenance";


import StaffRatings from "./staff/StaffRatings";


function App() {
  useEffect(() => {
    // Warm up the backend (Render cold start)
    const wakeup = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/api/students/ping/`);
        console.log("Backend is awake! 🚀");
      } catch (err) {
        console.log("Waking up backend...", err.message);
      }
    };
    wakeup();
  }, []);

  return (

    <BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#6F4E37",
            color: "#FDF5E6",
            fontWeight: "500",
          },
        }}
      />

      <Routes>
        {/* ================= AUTH ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/community" element={<Community />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />


        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<StudentHome />} />
          <Route path="complaints" element={<ComplaintHistory />} />
          <Route path="profile" element={<EditProfile />} />

          <Route path="complaints/new" element={<RegisterComplaint />} />
          <Route path="progress" element={<ComplaintProgress />} />
          <Route path="ratings" element={<Ratings />} />
          <Route path="support" element={<StudentSupport />} />



        </Route>


        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/:id" element={<AdminStudentDetails />} />
          <Route
            path="/admin/staff-performance"
            element={<StaffPerformance />}
          />
          <Route path="support" element={<AdminSupport />} />
          <Route path="staff-updates" element={<AdminStaffUpdates />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="maintenance" element={<AdminMaintenance />} />
          <Route path="broadcast" element={<AdminBroadcast />} />
        </Route>

        {/* ================= STAFF ================= */}
        <Route path="/staff-dashboard" element={<ProtectedRoute role="staff"><StaffLayout /></ProtectedRoute>}>
          <Route index element={<StaffDashboard />} />
          <Route path="assigned-complaints" element={<AssignedComplaints />} />
          <Route path="history" element={<ResolutionHistory />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="maintenance" element={<StaffMaintenance />} />
          <Route path="ratings" element={<StaffRatings />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

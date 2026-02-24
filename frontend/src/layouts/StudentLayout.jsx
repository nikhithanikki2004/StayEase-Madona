import "../styles/student-theme.css";
import "../styles/sidebarAnimations.css";

import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";

const SIDEBAR_WIDTH = "260px";

const StudentLayout = () => {
  return (
    <div className="student-bg h-screen">
      <StudentSidebar />

      <main
        className="h-screen overflow-y-auto p-8"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;

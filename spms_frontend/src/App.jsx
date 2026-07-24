import "./App.css";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import StudentDashboard from "./components/StudentsRole/StudentDashboard";
import Profile from "./components/Profile";
import ProjectType from "./components/ProjectType";
import Staff from "./components/Staff";
import AcademicYearSetup from "./components/AcademicYearSetup";

import StuProjectDetails from "./components/StudentsRole/stuProjectDetails";

import StudentMaster from "./components/StudentGroupManagement/StudentMaster";
import ProjectGroupCreation from "./components/StudentGroupManagement/ProjectGroupCreation";
import GroupMappingAllocation from "./components/StudentGroupManagement/GroupMappingAllocation";
import GroupApproval from "./components/StudentGroupManagement/GroupApproval";

import ProjectProposal from "./components/ProjectDetails/ProjectProposal";
import ProjectApproval from "./components/ProjectDetails/ProjectApproval";
import ProjectDetailsView from "./components/ProjectDetails/ProjectDetailsView";
import DocumentUploads from "./components/ProjectDetails/DocumentUploads";

import MeetingSchedule from "./components/Meetings/MeetingSchedule";
import MeetingEntry from "./components/Meetings/MeetingEntry";
import MeetingAttendance from "./components/Meetings/MeetingAttendance";
import MeetingHistory from "./components/Meetings/MeetingHistory";

import ProjectListReport from "./components/Reports/ProjectListReport";
import MemberReport from "./components/Reports/MemberReport";
import MarksProgressReport from "./components/Reports/MarksProgressReport";
import ExportReport from "./components/Reports/ExportReport";

import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";

function App() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const routes = [
    {
      path: "/dashboard",
      element: <Dashboard user={user} />,
      roles: ["admin", "faculty", "student"],
    },
    {
      path: "/student-dashboard",
      element: <StudentDashboard user={user} />,
      roles: ["student"],
    },
    {
      path: "/profile",
      element: <Profile user={user} />,
      roles: ["admin", "faculty", "student"],
    },

    { path: "/project-type", element: <ProjectType />, roles: ["admin"] },
    { path: "/staff", element: <Staff />, roles: ["admin"] },
    {
      path: "/academic-year",
      element: <AcademicYearSetup />,
      roles: ["admin"],
    },

    {
      path: "/student-master",
      element: <StudentMaster />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/group-create",
      element: <ProjectGroupCreation />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/group-mapping-allocation",
      element: <GroupMappingAllocation />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/group-approval",
      element: <GroupApproval />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/student-project-details",
      element: <StuProjectDetails />,
      roles: ["student"],
    },

    {
      path: "/proposal",
      element: <ProjectProposal />,
      roles: ["admin", "faculty"],
    },
    { path: "/approval", element: <ProjectApproval />, roles: ["admin"] },
    {
      path: "/details",
      element: <ProjectDetailsView />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/uploads",
      element: <DocumentUploads />,
      roles: ["admin", "faculty"],
    },

    {
      path: "/meeting-schedule",
      element: <MeetingSchedule />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/meeting-entry",
      element: <MeetingEntry />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/meeting-attendance",
      element: <MeetingAttendance />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/meeting-history",
      element: <MeetingHistory />,
      roles: ["admin", "faculty"],
    },

    {
      path: "/report-projects",
      element: <ProjectListReport />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/report-members",
      element: <MemberReport />,
      roles: ["admin", "faculty"],
    },
    {
      path: "/report-marks",
      element: <MarksProgressReport />,
      roles: ["admin", "faculty"],
    },
    { path: "/report-export", element: <ExportReport />, roles: ["admin"] },

    {
      path: "/contact-us",
      element: <ContactUs />,
      roles: ["admin", "faculty", "student"],
    },
  ];

  const allowedRoutes = routes.filter((r) => r.roles.includes(user.role));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onCloseMobile={() => setSidebarMobileOpen(false)}
        />
        <div className="app-main">
          <TopHeader user={user} onMobileMenuToggle={() => setSidebarMobileOpen(!sidebarMobileOpen)} />
          <div className="main-content">
            <div className="app-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    user.role === "student" ? (
                      <Navigate to="/student-dashboard" />
                    ) : (
                      <Navigate to="/dashboard" />
                    )
                  }
                />

                {allowedRoutes.map((r, idx) => (
                  <Route key={idx} path={r.path} element={r.element} />
                ))}
              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

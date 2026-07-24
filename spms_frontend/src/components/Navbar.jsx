import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ user, onLogout }) {
  if (!user) return null; // safety check

  // Define nav items with role permissions
  const navItems = [
    { path: "/dashboard", label: "Dashboard", roles: ["admin", "faculty"] },
    { path: "/student-dashboard", label: "Dashboard", roles: ["student"] },

    {
      label: "Master Config ▾",
      roles: ["admin"],
      children: [
        { path: "/project-type", label: "Project Types", roles: ["admin"] },
        { path: "/staff", label: "Staff", roles: ["admin"] },
        { path: "/academic-year", label: "Academic Year", roles: ["admin"] },
      ],
    },

    {
      label: "Student & Groups ▾",
      roles: ["admin", "faculty"],
      children: [
        { path: "/student-master", label: "Students", roles: ["admin", "faculty"] },
        { path: "/group-create", label: "Group Creation", roles: ["admin", "faculty"] },
        { path: "/group-mapping-allocation", label: "Group Mapping & Allocation", roles: ["admin"] },
        { path: "/group-approval", label: "Group Approval", roles: ["admin", "faculty"] },
      ],
    },

    {
      label: "Projects ▾",
      roles: ["admin", "faculty"],
      children: [
        { path: "/proposal", label: "Proposal", roles: ["admin", "faculty"] },
        { path: "/details", label: "Details", roles: ["admin", "faculty"] },
        { path: "/approval", label: "Approval", roles: ["admin"] },
        { path: "/uploads", label: "Uploads", roles: ["admin", "faculty"] },
      ],
    },

    {
      label: "Meetings ▾",
      roles: ["admin", "faculty"],
      children: [
        { path: "/meeting-schedule", label: "Schedule", roles: ["admin", "faculty"] },
        { path: "/meeting-entry", label: "Entry", roles: ["admin", "faculty"] },
        { path: "/meeting-attendance", label: "Attendance", roles: ["admin", "faculty"] },
        { path: "/meeting-history", label: "History", roles: ["admin", "faculty"] },
      ],
    },

    {
      label: "Reports ▾",
      roles: ["admin"],
      children: [
        { path: "/report-projects", label: "Projects Report", roles: ["admin"] },
        { path: "/report-members", label: "Members Report", roles: ["admin"] },
        { path: "/report-marks", label: "Marks Report", roles: ["admin"] },
        { path: "/report-export", label: "Export", roles: ["admin"] },
      ],
    },

    { path: "/student-project-details", label: "Project-Details", roles: ["student"] },
    { path: "/profile", label: "Profile", roles: ["admin", "faculty", "student"] },
    { path: "/contact-us", label: "Contact Us", roles: ["admin", "faculty", "student"] },
  ];

  return (
    <nav className="navbar">
      <h2 className="logo">ProjexHub</h2>
      <ul className="nav-links">
        {navItems.map((item, idx) => {
          if (!item.roles.includes(user.role)) return null;

          // Dropdowns
          if (item.children) {
            return (
              <li key={idx} className="dropdown">
                <span>{item.label}</span>
                <ul className="dropdown-menu">
                  {item.children.map((child, cIdx) =>
                    child.roles.includes(user.role) ? (
                      <li key={cIdx}><Link to={child.path}>{child.label}</Link></li>
                    ) : null
                  )}
                </ul>
              </li>
            );
          }

          // Simple links
          return (
            <li key={idx}>
              <Link to={item.path}>{item.label}</Link>
            </li>
          );
        })}
      </ul>

        <div className="logout-section">
  <button className="logout-btn" onClick={onLogout}>
    Logout
  </button>
</div>





    </nav>
  );
}
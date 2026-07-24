import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardCheck,
  Shield,
  Map,
  BarChart3,
  GraduationCap,
  Settings,
  FileText,
  FileSearch,
  CheckCircle,
  Upload,
  UserCog,
  Award,
  Download,
  User,
  Calendar,
  Layers,
  Mail,
  CalendarDays,
  PenLine,
  Clock,
  TrendingUp,
  FileBarChart,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

const iconMap = {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardCheck,
  Shield,
  Map,
  BarChart3,
  GraduationCap,
  Settings,
  FileText,
  FileSearch,
  CheckCircle,
  Upload,
  UserCog,
  Award,
  Download,
  User,
  Calendar,
  Layers,
  Mail,
  CalendarDays,
  PenLine,
  Clock,
  TrendingUp,
  FileBarChart,
};

export default function Sidebar({ user, onLogout, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  if (!user) return null;

  const location = useLocation();

  const adminNav = [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", roles: ["admin"] },
    {
      label: "Projects",
      icon: "FolderKanban",
      roles: ["admin"],
      children: [
        { path: "/group-create", label: "Group Creation", roles: ["admin"] },
        { path: "/proposal", label: "Proposal", roles: ["admin"] },
        { path: "/details", label: "Details", roles: ["admin"] },
        { path: "/approval", label: "Approval", roles: ["admin"] },
        { path: "/uploads", label: "Uploads", roles: ["admin"] },
        { path: "/project-type", label: "Project Types", roles: ["admin"] },
        { path: "/academic-year", label: "Academic Year", roles: ["admin"] }
      ],
    },
    {
      label: "Members",
      icon: "Users",
      roles: ["admin"],
      children: [
        { path: "/student-master", label: "Students", roles: ["admin"] },
        { path: "/staff", label: "Staff", roles: ["admin"] },
        { path: "/group-mapping-allocation", label: "Faculty Map", roles: ["admin"] }
      ],
    },
    {
      label: "Meetings",
      icon: "CalendarDays",
      roles: ["admin"],
      children: [
        { path: "/meeting-schedule", label: "Schedule", roles: ["admin"] },
        { path: "/meeting-entry", label: "Entry", roles: ["admin"] },
        { path: "/meeting-attendance", label: "Attendance", roles: ["admin"] },
        { path: "/meeting-history", label: "History", roles: ["admin"] }
      ],
    },
    {
      label: "Reports",
      icon: "BarChart3",
      roles: ["admin"],
      children: [
        { path: "/report-projects", label: "Projects Report", roles: ["admin"] },
        { path: "/report-members", label: "Members Report", roles: ["admin"] },
        { path: "/report-marks", label: "Marks Report", roles: ["admin"] },
        { path: "/report-export", label: "Export Data", roles: ["admin"] },
      ],
    },
    { path: "/profile", label: "Profile", icon: "User", roles: ["admin"] },
    { path: "/contact-us", label: "Contact Us", icon: "Mail", roles: ["admin"] },
  ];

  const facultyNav = [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", roles: ["faculty"] },
    {
      label: "Projects",
      icon: "FolderKanban",
      roles: ["faculty"],
      children: [
        { path: "/proposal", label: "Proposal", roles: ["faculty"] },
        { path: "/details", label: "Details", roles: ["faculty"] },
        { path: "/uploads", label: "Uploads", roles: ["faculty"] },
        { path: "/group-approval", label: "Group Approval", roles: ["faculty"] }
      ],
    },
    {
      label: "Members",
      icon: "Users",
      roles: ["faculty"],
      children: [
        { path: "/student-master", label: "Students", roles: ["faculty"] }
      ],
    },
    {
      label: "Meetings",
      icon: "CalendarDays",
      roles: ["faculty"],
      children: [
        { path: "/meeting-schedule", label: "Schedule", roles: ["faculty"] },
        { path: "/meeting-entry", label: "Entry", roles: ["faculty"] },
        { path: "/meeting-attendance", label: "Attendance", roles: ["faculty"] },
        { path: "/meeting-history", label: "History", roles: ["faculty"] },
      ],
    },
    {
      label: "Reports",
      icon: "BarChart3",
      roles: ["faculty"],
      children: [
        { path: "/report-projects", label: "Projects Report", roles: ["faculty"] },
        { path: "/report-members", label: "Members Report", roles: ["faculty"] },
        { path: "/report-marks", label: "Marks Report", roles: ["faculty"] },
      ],
    },
    { path: "/profile", label: "Profile", icon: "User", roles: ["faculty"] },
    { path: "/contact-us", label: "Contact Us", icon: "Mail", roles: ["faculty"] },
  ];

  const studentNav = [
    { path: "/student-dashboard", label: "Dashboard", icon: "LayoutDashboard", roles: ["student"] },
    { path: "/student-project-details", label: "Projects", icon: "FolderKanban", roles: ["student"] },
    { path: "/student-dashboard", label: "Members", icon: "Users", roles: ["student"] },
    { path: "/student-dashboard", label: "Meetings", icon: "CalendarDays", roles: ["student"] },
    { path: "/student-dashboard", label: "Reports", icon: "BarChart3", roles: ["student"] },
    { path: "/profile", label: "Profile", icon: "User", roles: ["student"] },
    { path: "/contact-us", label: "Contact Us", icon: "Mail", roles: ["student"] },
  ];

  const navItems =
    user.role === "student"
      ? studentNav
      : user.role === "faculty"
        ? facultyNav
        : adminNav;

  const [openDropdown, setOpenDropdown] = useState(null);

  const isActive = (path) => location.pathname === path;

  const isChildActive = (children) =>
    children?.some((c) => location.pathname === c.path);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderIcon = (iconName, size = 18) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} strokeWidth={1.8} />;
  };

  const submenuVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const sidebarClasses = [
    "spms-sidebar",
    collapsed ? "spms-sidebar--collapsed" : "",
    mobileOpen ? "spms-sidebar--mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`spms-sidebar__backdrop ${mobileOpen ? "spms-sidebar__backdrop--visible" : ""}`}
        onClick={onCloseMobile}
      />

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="spms-sidebar__header">
          <Link
            to={user.role === "student" ? "/student-dashboard" : "/dashboard"}
            className="spms-sidebar__logo"
          >
            <span className="spms-sidebar__logo-icon">P</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  className="spms-sidebar__logo-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                >
                  ProjexHub
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <motion.button
            type="button"
            className="spms-sidebar__toggle"
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            layout
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="spms-sidebar__nav">
          {navItems.map((item, idx) => {
            if (item.roles && !item.roles.includes(user.role)) return null;

            if (item.children) {
              const visibleChildren = item.children.filter(
                (c) => !c.roles || c.roles.includes(user.role)
              );
              if (visibleChildren.length === 0) return null;

              const isOpen = openDropdown === idx;
              const active = isChildActive(visibleChildren);

              return (
                <div key={idx} className="spms-sidebar__dropdown">
                  <button
                    type="button"
                    className={`spms-sidebar__link ${active ? "spms-sidebar__link--active" : ""}`}
                    onClick={() => setOpenDropdown(isOpen ? null : idx)}
                    data-tooltip={item.label}
                  >
                    <span className="spms-sidebar__icon">
                      {renderIcon(item.icon)}
                    </span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1, whiteSpace: 'nowrap' }}
                        >
                          <span className="spms-sidebar__label">{item.label}</span>
                          <motion.span
                            className="spms-sidebar__chevron"
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          >
                            <ChevronDown size={14} />
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  <AnimatePresence initial={false}>
                    {!collapsed && isOpen && (
                      <motion.div
                        className="spms-sidebar__submenu"
                        variants={submenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {visibleChildren.map((child, cIdx) => (
                          <Link
                            key={cIdx}
                            to={child.path}
                            className={`spms-sidebar__sublink ${isActive(child.path) ? "spms-sidebar__sublink--active" : ""}`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={idx}
                to={item.path}
                className={`spms-sidebar__link ${isActive(item.path) ? "spms-sidebar__link--active" : ""}`}
                data-tooltip={item.label}
              >
                <span className="spms-sidebar__icon">
                  {renderIcon(item.icon)}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      className="spms-sidebar__label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="spms-sidebar__footer">
          <div className="spms-sidebar__user">
            <div className="spms-sidebar__avatar">{getInitials(user.name)}</div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  className="spms-sidebar__user-info"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                >
                  <span className="spms-sidebar__user-name">{user.name || "User"}</span>
                  <span className="spms-sidebar__user-role">{user.role}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button type="button" className="spms-sidebar__logout" onClick={onLogout}>
            <LogOut size={16} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>
    </>
  );
}

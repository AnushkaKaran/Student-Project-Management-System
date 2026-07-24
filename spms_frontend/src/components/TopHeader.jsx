import { Search, Bell, MessageSquare, Menu } from "lucide-react";
import "./TopHeader.css";

export default function TopHeader({ user, onMobileMenuToggle }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "faculty"
        ? "Faculty"
        : "Student";

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="spms-header">
      <div className="spms-header__left">
        {onMobileMenuToggle && (
          <button
            type="button"
            className="spms-header__hamburger"
            onClick={onMobileMenuToggle}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="spms-header__greeting">
            Welcome Back, {user?.name || roleLabel} 👋
          </h1>
          <p className="spms-header__date">{today}</p>
        </div>
      </div>

      <div className="spms-header__right">
        {/* Search */}
        <div className="spms-header__search">
          <span className="spms-header__search-icon">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="spms-header__search-input"
            placeholder="Search anything..."
          />
          <span className="spms-header__search-shortcut">
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </span>
        </div>

        {/* Notifications */}
        <button type="button" className="spms-header__icon-btn" title="Notifications">
          <span className="spms-header__notif-dot" />
          <Bell size={18} />
        </button>

        {/* Messages */}
        <button type="button" className="spms-header__icon-btn" title="Messages">
          <MessageSquare size={18} />
        </button>

        {/* Divider */}
        <div className="spms-header__divider" />

        {/* Profile */}
        <div className="spms-header__profile">
          <div className="spms-header__avatar">{getInitials(user?.name)}</div>
          <div className="spms-header__profile-info">
            <span className="spms-header__name">{user?.name || "User"}</span>
            <span className="spms-header__role">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

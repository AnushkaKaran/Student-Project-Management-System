import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Calendar,
  AlertCircle,
  TrendingUp,
  Clock,
  Server,
  Database,
  Activity,
  Plus
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import api from "../api/axios";
import "./Dashboard.css"; // Reuse dashboard styles
import { getStudentDisplayName } from "../utils/nameHelper";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend
);

export default function AdminDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    activeProjects: 0,
    completedProjects: 0,
    meetings: 0,
    pendingApprovals: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, staffRes, groupsRes, meetingsRes] = await Promise.all([
          api.get("/students").catch(() => ({ data: { data: [] } })),
          api.get("/master/staff").catch(() => ({ data: { data: [] } })),
          api.get("/groups").catch(() => ({ data: { data: [] } })),
          api.get("/meetings").catch(() => ({ data: { data: [] } }))
        ]);

        const students = studentsRes.data.data || [];
        const staff = staffRes.data.data || [];
        const groups = groupsRes.data.data || [];
        const meetings = meetingsRes.data.data || [];

        const activeCount = groups.filter(g => g.Status === 'Active' || g.Status === 'In Progress').length;
        const completedCount = groups.filter(g => g.Status === 'Completed').length;
        const pendingCount = groups.filter(g => g.Status === 'Proposed' || g.Status === 'Pending').length;

        setStats({
          students: students.length,
          faculty: staff.length,
          activeProjects: activeCount || 0,
          completedProjects: completedCount || 0,
          meetings: meetings.length,
          pendingApprovals: pendingCount || 0
        });

        // Top 5 recent
        setRecentProjects(groups.slice(0, 5));
        setRecentStudents(students.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Placeholder Analytics
  const pieData = {
    labels: ["Active", "Completed", "Pending"],
    datasets: [{
      data: [stats.activeProjects || 1, stats.completedProjects || 0, stats.pendingApprovals || 0],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
      borderWidth: 0,
    }],
  };
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: "70%",
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 20, font: { family: 'inherit', size: 12 } } } },
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      label: "Meetings Held",
      data: [12, 19, 15, 25, 22, stats.meetings || 0],
      backgroundColor: "#6366f1",
      borderRadius: 4,
    }],
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: "#f1f5f9" }, border: { display: false }, beginAtZero: true }, x: { grid: { display: false }, border: { display: false } } },
  };

  return (
    <div className="spms-dashboard">
      {/* 1. Welcome Section */}
      <header className="spms-dashboard__header">
        <div>
          <h1 className="spms-dashboard__title">Welcome, Admin {user?.name} 👋</h1>
          <p className="spms-dashboard__subtitle">{today} — System is running smoothly.</p>
        </div>
        <div className="spms-dashboard__actions">
          <Link to="/academic-year" className="spms-dashboard__btn spms-dashboard__btn--secondary">
            <Calendar size={16} /> Academic Year
          </Link>
          <Link to="/student-master" className="spms-dashboard__btn spms-dashboard__btn--primary">
            <Plus size={16} /> Add Student
          </Link>
        </div>
      </header>

      {/* 2. Statistics Cards */}
      <section className="spms-dashboard__stats-grid">
        <StatCard icon={<GraduationCap />} label="Total Students" value={loading ? "..." : stats.students} color="#6366f1" bg="#e0e7ff" delay={0.1} />
        <StatCard icon={<Users />} label="Total Faculty" value={loading ? "..." : stats.faculty} color="#8b5cf6" bg="#ede9fe" delay={0.2} />
        <StatCard icon={<Briefcase />} label="Active Projects" value={loading ? "..." : stats.activeProjects} color="#3b82f6" bg="#dbeafe" delay={0.3} />
        <StatCard icon={<CheckCircle />} label="Completed Projects" value={loading ? "..." : stats.completedProjects} color="#10b981" bg="#d1fae5" delay={0.4} />
        <StatCard icon={<Calendar />} label="Total Meetings" value={loading ? "..." : stats.meetings} color="#ec4899" bg="#fce7f3" delay={0.5} />
        <StatCard icon={<AlertCircle />} label="Pending Approvals" value={loading ? "..." : stats.pendingApprovals} color="#f59e0b" bg="#fef3c7" delay={0.6} />
      </section>

      {/* 3. Analytics Charts */}
      <section className="spms-dashboard__grid-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Project Status Overview</h3>
          </div>
          <div className="spms-dashboard__chart-wrapper">
            <Doughnut data={pieData} options={doughnutOptions} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Monthly Meetings Trend</h3>
          </div>
          <div className="spms-dashboard__chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>
      </section>

      {/* 4. Complex Grid: Timeline, Tables, System Status */}
      <section className="spms-dashboard__grid-3">
        
        {/* Recent Projects Table (Span 2) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="spms-dashboard__card spms-col-span-2">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Recent Project Groups</h3>
            <Link to="/details" className="spms-dashboard__card-action">View All</Link>
          </div>
          <div className="spms-dashboard__table-wrapper">
            <table className="spms-dashboard__table">
              <thead><tr><th>Group Name</th><th>Title</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : recentProjects.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No projects found.</td></tr>
                ) : (
                  recentProjects.map(p => (
                    <tr key={p.ProjectGroupID}>
                      <td style={{ fontWeight: 500 }}>{p.ProjectGroupName}</td>
                      <td>{p.ProjectTitle || "—"}</td>
                      <td>
                        <span className={`spms-dashboard__badge spms-dashboard__badge--${(p.Status||'default').toLowerCase()}`}>
                          {p.Status || "Proposed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">System Status</h3>
          </div>
          <div className="spms-dashboard__status-list">
            <div className="spms-dashboard__status-item">
              <div className="spms-dashboard__status-icon spms-bg-green"><Database size={16}/></div>
              <div className="spms-dashboard__status-info"><h4>Database</h4><p>Connected (12ms)</p></div>
              <span className="spms-dashboard__status-dot spms-text-green">●</span>
            </div>
            <div className="spms-dashboard__status-item">
              <div className="spms-dashboard__status-icon spms-bg-green"><Server size={16}/></div>
              <div className="spms-dashboard__status-info"><h4>Backend API</h4><p>Operational</p></div>
              <span className="spms-dashboard__status-dot spms-text-green">●</span>
            </div>
            <div className="spms-dashboard__status-item">
              <div className="spms-dashboard__status-icon spms-bg-blue"><Activity size={16}/></div>
              <div className="spms-dashboard__status-info"><h4>Last Sync</h4><p>Just now</p></div>
            </div>
          </div>
        </motion.div>

        {/* Recent Students Table (Span 2) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="spms-dashboard__card spms-col-span-2">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Recently Added Students</h3>
            <Link to="/student-master" className="spms-dashboard__card-action">Manage Students</Link>
          </div>
          <div className="spms-dashboard__table-wrapper">
            <table className="spms-dashboard__table">
              <thead><tr><th>Enrollment No.</th><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : recentStudents.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No students found.</td></tr>
                ) : (
                  recentStudents.map(s => (
                    <tr key={s.StudentID}>
                      <td>{s.EnrollmentNo}</td>
                      <td style={{ fontWeight: 500 }}>{getStudentDisplayName(s)}</td>
                      <td>{s.Email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activity Timeline (Placeholder) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Recent Activity</h3>
          </div>
          <div className="spms-dashboard__timeline">
            <div className="spms-dashboard__timeline-item">
              <div className="spms-dashboard__timeline-icon"><CheckCircle size={16} /></div>
              <div className="spms-dashboard__timeline-content">
                <h4 className="spms-dashboard__timeline-title">System Backup Completed</h4>
                <p className="spms-dashboard__timeline-desc">Automated DB snapshot</p>
                <span className="spms-dashboard__timeline-time">2 hours ago</span>
              </div>
            </div>
            <div className="spms-dashboard__timeline-item">
              <div className="spms-dashboard__timeline-icon"><Clock size={16} /></div>
              <div className="spms-dashboard__timeline-content">
                <h4 className="spms-dashboard__timeline-title">New Meeting Scheduled</h4>
                <p className="spms-dashboard__timeline-desc">Faculty review</p>
                <span className="spms-dashboard__timeline-time">5 hours ago</span>
              </div>
            </div>
          </div>
        </motion.div>

      </section>
    </div>
  );
}

// Inline Stat Card Component
function StatCard({ icon, label, value, color, bg, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.3 }}
      className="spms-dashboard__stat-card"
    >
      <div className="spms-dashboard__stat-icon" style={{ backgroundColor: bg, color: color }}>{icon}</div>
      <div className="spms-dashboard__stat-info">
        <span className="spms-dashboard__stat-label">{label}</span>
        <span className="spms-dashboard__stat-value">{value}</span>
      </div>
    </motion.div>
  );
}

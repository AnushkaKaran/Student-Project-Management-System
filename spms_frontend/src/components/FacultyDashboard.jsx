import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  CalendarDays,
  FileSearch,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Bell,
  AlertCircle,
  Target,
  ListTodo
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
import "./Dashboard.css"; 

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend
);

export default function FacultyDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedGroups: 0,
    meetingsToday: 0,
    pendingProposals: 0,
    attendanceRate: "0%",
    activeProjects: 0,
    completedProjects: 0
  });
  const [myGroups, setMyGroups] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [groupsRes, meetingsRes] = await Promise.all([
          api.get("/groups").catch(() => ({ data: { data: [] } })),
          api.get("/meetings").catch(() => ({ data: { data: [] } }))
        ]);

        const allGroups = groupsRes.data.data || [];
        const allMeetings = meetingsRes.data.data || [];
        
        // Simulating identifying faculty's own groups
        const assigned = allGroups.slice(0, 5); 
        
        const pendingCount = assigned.filter(g => g.Status === 'Proposed' || g.Status === 'Pending').length;
        const activeCount = assigned.filter(g => g.Status === 'Active' || g.Status === 'In Progress').length;
        const completedCount = assigned.filter(g => g.Status === 'Completed').length;

        const todayStr = new Date().toISOString().split('T')[0];
        const todays = allMeetings.filter(m => m.MeetingDate && m.MeetingDate.startsWith(todayStr));

        setStats({
          assignedGroups: assigned.length,
          meetingsToday: todays.length || 0,
          pendingProposals: pendingCount || 0,
          attendanceRate: "92%",
          activeProjects: activeCount || (assigned.length - pendingCount - completedCount),
          completedProjects: completedCount || 0
        });

        setMyGroups(assigned);
        setUpcomingMeetings(allMeetings.slice(0, 4));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty dashboard data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Chart Data
  const pieData = {
    labels: ["Active", "Completed", "Pending"],
    datasets: [{
      data: [stats.activeProjects || 2, stats.completedProjects || 1, stats.pendingProposals || 1],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
      borderWidth: 0,
    }],
  };
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: "70%",
    plugins: { legend: { position: "right", labels: { usePointStyle: true, font: { size: 12 } } } },
  };

  const progressData = [
    { name: "AI Attendance", progress: 85, color: "#10b981" },
    { name: "IoT Smart Home", progress: 60, color: "#3b82f6" },
    { name: "Blockchain Voting", progress: 40, color: "#f59e0b" },
    { name: "AR Navigation", progress: 20, color: "#ef4444" }
  ];

  return (
    <div className="spms-dashboard">
      {/* 1. Welcome Section */}
      <header className="spms-dashboard__header">
        <div>
          <h1 className="spms-dashboard__title">Welcome, Prof. {user?.name} 👋</h1>
          <p className="spms-dashboard__subtitle">{today} — Ready for your academic tasks.</p>
        </div>
        <div className="spms-dashboard__actions">
          <Link to="/meeting-entry" className="spms-dashboard__btn spms-dashboard__btn--secondary">
            <CalendarDays size={16} /> Schedule Meeting
          </Link>
          <Link to="/proposal" className="spms-dashboard__btn spms-dashboard__btn--primary">
            <FileSearch size={16} /> Review Proposals
          </Link>
        </div>
      </header>

      {/* 2. Faculty Progress Cards (6 cards) */}
      <section className="spms-dashboard__stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard icon={<Briefcase />} label="Assigned Groups" value={loading ? "..." : stats.assignedGroups} color="#6366f1" bg="#e0e7ff" delay={0.1} />
        <StatCard icon={<CalendarDays />} label="Meetings Today" value={loading ? "..." : stats.meetingsToday} color="#8b5cf6" bg="#ede9fe" delay={0.2} />
        <StatCard icon={<FileSearch />} label="Pending Proposals" value={loading ? "..." : stats.pendingProposals} color="#f59e0b" bg="#fef3c7" delay={0.3} />
        <StatCard icon={<Target />} label="Active Projects" value={loading ? "..." : stats.activeProjects} color="#3b82f6" bg="#dbeafe" delay={0.4} />
        <StatCard icon={<CheckCircle />} label="Completed" value={loading ? "..." : stats.completedProjects} color="#10b981" bg="#d1fae5" delay={0.5} />
        <StatCard icon={<Users />} label="Avg. Attendance" value={loading ? "..." : stats.attendanceRate} color="#ec4899" bg="#fce7f3" delay={0.6} />
      </section>

      {/* 3. Analytics & Progress Row */}
      <section className="spms-dashboard__grid-2" style={{ marginTop: '24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Mentee Group Status</h3>
          </div>
          <div className="spms-dashboard__chart-wrapper" style={{ height: '220px' }}>
            <Doughnut data={pieData} options={doughnutOptions} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Project Progress Tracking</h3>
          </div>
          <div className="spms-dashboard__card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {progressData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={{ color: '#334155' }}>{item.name}</span>
                  <span style={{ color: item.color }}>{item.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.progress}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Main Split View: Tables & Timelines */}
      <section className="spms-dashboard__grid-3" style={{ marginTop: '24px' }}>
        
        {/* Assigned Project Groups (Span 2) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="spms-dashboard__card spms-col-span-2">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">My Mentee Groups</h3>
            <Link to="/details" className="spms-dashboard__card-action">View All</Link>
          </div>
          <div className="spms-dashboard__table-wrapper">
            <table className="spms-dashboard__table">
              <thead><tr><th>Group Name</th><th>Title</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : myGroups.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No assigned groups found.</td></tr>
                ) : (
                  myGroups.map(p => (
                    <tr key={p.ProjectGroupID}>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{p.ProjectGroupName}</td>
                      <td>{p.ProjectTitle || "No Title Yet"}</td>
                      <td>
                        <span className={`spms-dashboard__badge spms-dashboard__badge--${(p.Status||'default').toLowerCase()}`}>
                          {p.Status || "Proposed"}
                        </span>
                      </td>
                      <td>
                        <Link to="/details" style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Review</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Notifications & Pending Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Pending Tasks & Alerts</h3>
          </div>
          <div className="spms-dashboard__timeline">
            <div className="spms-dashboard__timeline-item">
              <div className="spms-dashboard__timeline-icon spms-bg-red"><AlertCircle size={16} /></div>
              <div className="spms-dashboard__timeline-content">
                <h4 className="spms-dashboard__timeline-title">Finalize Grades</h4>
                <p className="spms-dashboard__timeline-desc">Semester ends in 3 days</p>
                <span className="spms-dashboard__timeline-time">Due: Friday</span>
              </div>
            </div>
            <div className="spms-dashboard__timeline-item">
              <div className="spms-dashboard__timeline-icon spms-bg-yellow"><ListTodo size={16} /></div>
              <div className="spms-dashboard__timeline-content">
                <h4 className="spms-dashboard__timeline-title">Review 2 Proposals</h4>
                <p className="spms-dashboard__timeline-desc">Pending approval for Group 7 & 9</p>
                <span className="spms-dashboard__timeline-time">Action Required</span>
              </div>
            </div>
            <div className="spms-dashboard__timeline-item">
              <div className="spms-dashboard__timeline-icon spms-bg-blue"><Bell size={16} /></div>
              <div className="spms-dashboard__timeline-content">
                <h4 className="spms-dashboard__timeline-title">New Document Uploaded</h4>
                <p className="spms-dashboard__timeline-desc">Team Alpha uploaded Phase 2</p>
                <span className="spms-dashboard__timeline-time">2 hours ago</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Meetings List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="spms-dashboard__card">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Upcoming Meetings</h3>
            <Link to="/meeting-schedule" className="spms-dashboard__card-action">Calendar</Link>
          </div>
          <div className="spms-dashboard__timeline">
            {loading ? (
              <p style={{textAlign: 'center', padding: '20px'}}>Loading...</p>
            ) : upcomingMeetings.length === 0 ? (
              <p style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No meetings scheduled.</p>
            ) : (
              upcomingMeetings.map((m, idx) => (
                <div key={idx} className="spms-dashboard__timeline-item">
                  <div className="spms-dashboard__timeline-icon spms-bg-purple"><Clock size={16} /></div>
                  <div className="spms-dashboard__timeline-content">
                    <h4 className="spms-dashboard__timeline-title">{m.MeetingPurpose || "General Review"}</h4>
                    <span className="spms-dashboard__timeline-time">Date: {m.MeetingDate ? new Date(m.MeetingDate).toLocaleDateString() : 'TBD'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Placeholder: Recent Mentee Activity (Span 2) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="spms-dashboard__card spms-col-span-2">
          <div className="spms-dashboard__card-header">
            <h3 className="spms-dashboard__card-title">Recent Mentee Activity</h3>
          </div>
          <div className="spms-dashboard__timeline" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="spms-dashboard__timeline-item">
              <div className="spms-dashboard__timeline-icon"><FileText size={16} /></div>
              <div className="spms-dashboard__timeline-content">
                <h4 className="spms-dashboard__timeline-title">Group 12 submitted Phase 1 Report</h4>
                <p className="spms-dashboard__timeline-desc">Needs your review</p>
                <span className="spms-dashboard__timeline-time">2 hours ago</span>
              </div>
            </div>
            <div className="spms-dashboard__timeline-item">
              <div className="spms-dashboard__timeline-icon"><CheckCircle size={16} /></div>
              <div className="spms-dashboard__timeline-content">
                <h4 className="spms-dashboard__timeline-title">Team Alpha updated Project Title</h4>
                <p className="spms-dashboard__timeline-desc">Changed to "AI Attendance System"</p>
                <span className="spms-dashboard__timeline-time">Yesterday</span>
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

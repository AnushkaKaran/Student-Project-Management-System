import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, FolderGit2, BookOpen, Clock, 
  CheckCircle2, AlertCircle, FileText, Calendar, Bell, ChevronRight, Activity, TrendingUp
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../../api/axios";
import "./StudentDashboard.css";
import { getStudentDisplayName } from "../../utils/nameHelper";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({ groups: 0, projects: 0, faculty: 0 });
  const [myGroup, setMyGroup] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [groupsRes, studentsRes, staffRes, mappingRes] = await Promise.all([
        api.get("/groups"),
        api.get("/students"),
        api.get("/master/staff"),
        api.get("/project-group-members")
      ]);

      const groups = groupsRes.data.data || groupsRes.data || [];
      const students = studentsRes.data.data || studentsRes.data || [];
      const staff = staffRes.data.data || staffRes.data || [];
      const mappings = mappingRes.data.data || mappingRes.data || [];

      setSystemStats({
        groups: groups.length,
        projects: groups.filter(g => g.ApprovalStatus === 'Approved').length,
        faculty: staff.length
      });

      // Simulate a logged-in student by grabbing the first valid group mapping
      if (groups.length > 0) {
        const targetGroup = groups[0];
        const groupMembers = mappings
          .filter(m => m.ProjectGroupID === targetGroup.ProjectGroupID)
          .map(m => {
            const stu = students.find(s => s.StudentID === m.StudentID);
            return {
              name: getStudentDisplayName(stu),
              isLeader: m.IsLeader === 1 || m.IsLeader === true
            };
          });

        const guide = staff.find(s => s.StaffID === targetGroup.GuideStaffID);

        setMyGroup({
          id: targetGroup.ProjectGroupID,
          name: targetGroup.ProjectGroupName,
          status: targetGroup.ApprovalStatus || "Pending",
          type: targetGroup.ProjectTypeID ? `Type ${targetGroup.ProjectTypeID}` : "Unassigned",
          guideName: guide ? guide.StaffName : "Unassigned",
          members: groupMembers
        });
      }

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const projectFlow = ["Proposal", "Approval", "Development", "Testing", "Final"];
  const flowData = {
    labels: projectFlow,
    datasets: [
      {
        label: "Phase Progress",
        data: [100, 100, 45, 0, 0], // Simulated progress percentages
        backgroundColor: "#6366f1",
        borderRadius: 4,
      },
    ],
  };

  const flowOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (val) => val + "%" }
      }
    }
  };

  if (loading) {
    return (
      <div className="spms-sdash">
        <div className="spms-sdash__skeleton-card" style={{ height: '160px' }}></div>
        <div className="spms-sdash__stats-grid">
          {[1,2,3,4].map(i => <div key={i} className="spms-sdash__skeleton-card"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="spms-sdash">
      
      {/* Hero Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="spms-sdash__welcome"
      >
        <div className="spms-sdash__welcome-text">
          <h1>Welcome to ProjexHub Student Portal</h1>
          <p>Track your academic project progress, collaborate with your team, and stay updated with faculty announcements.</p>
        </div>
      </motion.div>

      {/* Global Stats Grid */}
      <div className="spms-sdash__stats-grid">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="spms-sdash__stat-card">
          <div className="spms-sdash__stat-icon spms-sdash__stat-icon--blue"><FolderGit2 size={28} /></div>
          <div className="spms-sdash__stat-info">
            <h3 className="spms-sdash__stat-value">{systemStats.projects}</h3>
            <p className="spms-sdash__stat-label">Approved Projects</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="spms-sdash__stat-card">
          <div className="spms-sdash__stat-icon spms-sdash__stat-icon--green"><Users size={28} /></div>
          <div className="spms-sdash__stat-info">
            <h3 className="spms-sdash__stat-value">{systemStats.groups}</h3>
            <p className="spms-sdash__stat-label">Active Groups</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="spms-sdash__stat-card">
          <div className="spms-sdash__stat-icon spms-sdash__stat-icon--purple"><BookOpen size={28} /></div>
          <div className="spms-sdash__stat-info">
            <h3 className="spms-sdash__stat-value">{systemStats.faculty}</h3>
            <p className="spms-sdash__stat-label">Faculty Guides</p>
          </div>
        </motion.div>
      </div>

      <div className="spms-sdash__main-grid">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* My Group Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="spms-sdash__panel">
            <div className="spms-sdash__panel-header">
              <h2 className="spms-sdash__panel-title"><Users size={20} /> My Project Group</h2>
            </div>
            <div className="spms-sdash__panel-body">
              {myGroup ? (
                <div className="spms-sdash__group-info">
                  <h3 className="spms-sdash__group-name">{myGroup.name}</h3>
                  <div className="spms-sdash__group-meta">
                    <span className="spms-sdash__meta-item"><FolderGit2 size={16} /> ID: {myGroup.id}</span>
                    <span className="spms-sdash__meta-item"><CheckCircle2 size={16} /> Status: {myGroup.status}</span>
                    <span className="spms-sdash__meta-item"><BookOpen size={16} /> Guide: {myGroup.guideName}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' }}>Team Members</h4>
                    <div className="spms-sdash__members-list">
                      {myGroup.members.map((m, i) => (
                        <span key={i} className={`spms-sdash__member-chip ${m.isLeader ? 'spms-sdash__member-chip--leader' : ''}`}>
                          {m.name} {m.isLeader && "(Leader)"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>You are not assigned to a project group yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Development Progress Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="spms-sdash__panel">
            <div className="spms-sdash__panel-header">
              <h2 className="spms-sdash__panel-title"><FileText size={20} /> Development Lifecycle</h2>
            </div>
            <div className="spms-sdash__panel-body">
              <div className="spms-sdash__chart-container">
                <Bar data={flowData} options={flowOptions} />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Timeline / Tasks */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="spms-sdash__panel">
            <div className="spms-sdash__panel-header">
              <h2 className="spms-sdash__panel-title"><Clock size={20} /> Action Items</h2>
            </div>
            <div className="spms-sdash__panel-body">
              <div className="spms-sdash__timeline">
                
                <div className="spms-sdash__timeline-item spms-sdash__timeline-item--active">
                  <div className="spms-sdash__timeline-time">Today</div>
                  <div className="spms-sdash__timeline-content">
                    <h4 className="spms-sdash__timeline-title">Upload Design Doc</h4>
                    <p className="spms-sdash__timeline-desc">Submit the final architecture diagram.</p>
                  </div>
                </div>

                <div className="spms-sdash__timeline-item">
                  <div className="spms-sdash__timeline-time">Tomorrow</div>
                  <div className="spms-sdash__timeline-content">
                    <h4 className="spms-sdash__timeline-title">Faculty Sync</h4>
                    <p className="spms-sdash__timeline-desc">Meeting with project guide to review progress.</p>
                  </div>
                </div>

                <div className="spms-sdash__timeline-item">
                  <div className="spms-sdash__timeline-time">Next Week</div>
                  <div className="spms-sdash__timeline-content">
                    <h4 className="spms-sdash__timeline-title">Mid-term Viva</h4>
                    <p className="spms-sdash__timeline-desc">Prepare presentation slides for evaluation.</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Announcements */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="spms-sdash__panel">
            <div className="spms-sdash__panel-header">
              <h2 className="spms-sdash__panel-title"><Calendar size={20} /> Latest Announcements</h2>
            </div>
            <div className="spms-sdash__panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', color: '#0f172a' }}>Innovation Week</h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Showcase projects and win exciting awards on campus.</p>
                </div>
                
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', color: '#0f172a' }}>Industry Collaboration</h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Tech partnerships for top-performing final year projects.</p>
                </div>

              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
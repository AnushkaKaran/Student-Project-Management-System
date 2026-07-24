import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Users, Settings, Shield, GraduationCap, Briefcase, 
  CheckCircle2, Lock, Save, Camera, Mail, Phone,
  Building, Hash, Calendar, Activity, FileText, CheckSquare,
  TrendingUp, Clock, BookOpen
} from "lucide-react";
import api from "../api/axios";
import "./Profile.css";
import { getStudentDisplayName } from "../utils/nameHelper";

export default function Profile({ user }) {
  const [tab, setTab] = useState("about");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");

      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      const role = decodedPayload.Role || "Student";
      const email = decodedPayload.Email;

      if (!email) throw new Error("Invalid token structure.");

      let finalData = { role, email, joinedDate: "August 2023" };
      let stats = {};
      let timeline = [];

      const [groupsRes, meetingsRes, attendanceRes] = await Promise.all([
        api.get("/groups").catch(() => ({ data: { data: [] } })),
        api.get("/meetings").catch(() => ({ data: { data: [] } })),
        api.get("/project-meeting-attendance").catch(() => ({ data: { data: [] } }))
      ]);

      const allGroups = groupsRes.data.data || [];
      const allMeetings = meetingsRes.data.data || [];
      const allAttendance = attendanceRes.data.data || [];

      if (role.toLowerCase() === "student") {
        const studentsRes = await api.get("/students").catch(() => ({ data: { data: [] } }));
        const students = studentsRes.data.data || [];
        
        const me = students.find(s => s.Email === email);
        if (me) {
          const myGroup = allGroups.find(g => g.LeaderID === me.StudentID || g.ProjectGroupID); // fallback
          const myAttendance = allAttendance.filter(a => a.StudentID === me.StudentID);
          const present = myAttendance.filter(a => a.Status === 'Present').length;
          const totalAttended = myAttendance.length;
          const attPercentage = totalAttended > 0 ? Math.round((present / totalAttended) * 100) : 100;
          
          finalData = {
            ...finalData,
            name: getStudentDisplayName(me),
            id: me.StudentID,
            displayId: me.RollNo,
            department: "Computer Science & Engineering",
            phone: me.Phone,
            semester: "Semester 6", 
            cpi: "8.5", 
            groupName: myGroup ? myGroup.ProjectGroupName : "Not Assigned",
            guide: myGroup ? "Prof. Smith" : "N/A",
            accountStatus: "Active",
            raw: me
          };

          stats = {
            card1: { label: "Assigned Project", value: myGroup ? 1 : 0, icon: <Briefcase /> },
            card2: { label: "Attendance %", value: `${attPercentage}%`, icon: <CheckCircle2 /> },
            card3: { label: "Meetings Attended", value: present, icon: <Clock /> },
            card4: { label: "Meetings Missed", value: totalAttended - present, icon: <Activity /> },
            card5: { label: "Proposal Status", value: myGroup?.Status || "Pending", icon: <FileText /> },
            card6: { label: "Project Progress", value: "45%", icon: <TrendingUp /> }
          };

          timeline = [
            { title: "Profile created", time: "August 2023", icon: <User /> },
            { title: "Added to Group", time: "September 2023", icon: <Briefcase /> },
            { title: "Proposal Submitted", time: "October 2023", icon: <FileText /> }
          ];
        }
      } else if (role.toLowerCase() === "admin") {
        const [staffRes, studentRes] = await Promise.all([
          api.get("/master/staff").catch(() => ({ data: { data: [] } })),
          api.get("/students").catch(() => ({ data: { data: [] } }))
        ]);
        const staffList = staffRes.data.data || [];
        const students = studentRes.data.data || [];
        
        const me = staffList.find(s => s.Email === email) || { StaffName: "Admin User", StaffID: 1, Phone: "1234567890", Role: "Admin" };
        
        finalData = {
          ...finalData,
          name: me.StaffName,
          id: me.StaffID,
          displayId: `ADM-${me.StaffID}`,
          department: "Administration",
          designation: me.Role || "Admin",
          phone: me.Phone,
          accountStatus: "Active",
          raw: me
        };

        stats = {
          card1: { label: "Total Students", value: students.length, icon: <GraduationCap /> },
          card2: { label: "Total Faculty", value: staffList.filter(s=>s.Role==='Faculty').length, icon: <Briefcase /> },
          card3: { label: "Total Groups", value: allGroups.length, icon: <Users /> },
          card4: { label: "Total Meetings", value: allMeetings.length, icon: <Calendar /> },
          card5: { label: "Active Year", value: "2023-24", icon: <BookOpen /> },
          card6: { label: "Pending Approvals", value: allGroups.filter(g=>g.Status==='Proposed').length, icon: <CheckSquare /> }
        };

        timeline = [
          { title: "System Login", time: "Today", icon: <Lock /> },
          { title: "System Maintenance", time: "Last Week", icon: <Settings /> }
        ];

      } else {
        // FACULTY
        const staffRes = await api.get("/master/staff").catch(() => ({ data: { data: [] } }));
        const staffList = staffRes.data.data || [];
        const me = staffList.find(s => s.Email === email);
        
        if (me) {
          const myGroups = allGroups.slice(0, 4); // Simulated assignment
          const activeMeetings = allMeetings.slice(0, 10);
          
          finalData = {
            ...finalData,
            name: me.StaffName,
            id: me.StaffID,
            displayId: `FAC-${me.StaffID}`,
            department: "Computer Science & Engineering",
            designation: me.Role || "Faculty",
            phone: me.Phone,
            accountStatus: "Active",
            raw: me
          };

          stats = {
            card1: { label: "Assigned Groups", value: myGroups.length, icon: <Briefcase /> },
            card2: { label: "Meetings Conducted", value: activeMeetings.length, icon: <CheckCircle2 /> },
            card3: { label: "Meetings Scheduled", value: 3, icon: <Calendar /> },
            card4: { label: "Pending Reviews", value: myGroups.filter(g=>g.Status==='Proposed').length, icon: <FileText /> },
            card5: { label: "Completed Projects", value: myGroups.filter(g=>g.Status==='Completed').length, icon: <CheckSquare /> },
            card6: { label: "Avg Attendance %", value: "88%", icon: <Activity /> }
          };

          timeline = [
            { title: "Meeting scheduled with Group 1", time: "2 hours ago", icon: <Calendar /> },
            { title: "Proposal approved for Alpha Team", time: "Yesterday", icon: <CheckCircle2 /> },
            { title: "Grades published", time: "Last Week", icon: <BookOpen /> }
          ];
        }
      }

      setProfileData({ ...finalData, stats, timeline });
      setEditForm({
        name: finalData.name || "",
        email: finalData.email || "",
        phone: finalData.phone || "",
        password: "",
        confirmPassword: ""
      });

    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profileData.role.toLowerCase() === 'student') {
        const payload = { StudentName: editForm.name, Phone: editForm.phone, Email: editForm.email };
        await api.patch(`/students/${profileData.id}`, payload);
      } else {
        const payload = { StaffName: editForm.name, Phone: editForm.phone, Email: editForm.email };
        await api.patch(`/master/staff/${profileData.id}`, payload);
      }
      setProfileData({ ...profileData, name: editForm.name, email: editForm.email, phone: editForm.phone });
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast("Error updating profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (editForm.password !== editForm.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (!editForm.password) {
      showToast("Please enter a new password.", "error");
      return;
    }
    setSaving(true);
    try {
      if (profileData.role.toLowerCase() === 'student') {
        await api.patch(`/students/${profileData.id}`, { Password: editForm.password });
      } else {
        await api.patch(`/master/staff/${profileData.id}`, { Password: editForm.password });
      }
      setEditForm({ ...editForm, password: "", confirmPassword: "" });
      showToast("Password updated successfully!");
    } catch (err) {
      showToast("Error updating password.", "error");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  if (loading) return <div className="spms-profile__empty">Loading your profile...</div>;
  if (error || !profileData) return <div className="spms-profile__empty">Error: {error}</div>;

  return (
    <div className="spms-profile">
      
      {/* 1. HERO SECTION */}
      <section className="spms-profile__hero">
        <div className="spms-profile__hero-cover"></div>
        <div className="spms-profile__hero-content">
          <div className="spms-profile__avatar-wrap">
            <div className="spms-profile__avatar">
              {getInitials(profileData.name)}
            </div>
            <button className="spms-profile__avatar-edit"><Camera size={14}/></button>
          </div>
          
          <div className="spms-profile__header-info">
            <div className="spms-profile__name-row">
              <h1 className="spms-profile__name">{profileData.name}</h1>
              <span className="spms-profile__badge">{profileData.role}</span>
            </div>
            
            <div className="spms-profile__meta-row">
              <span className="spms-profile__meta-item"><Mail size={16}/> {profileData.email}</span>
              <span className="spms-profile__meta-item"><Phone size={16}/> {profileData.phone || "No Phone"}</span>
              <span className="spms-profile__meta-item"><Building size={16}/> {profileData.department}</span>
              <span className="spms-profile__meta-item"><Hash size={16}/> ID: {profileData.displayId}</span>
            </div>
          </div>
        </div>

        <div className="spms-profile__tabs">
          <button 
            className={`spms-profile__tab ${tab === 'about' ? 'spms-profile__tab--active' : ''}`}
            onClick={() => setTab("about")}
          >
            <User size={18} /> My Profile
          </button>
          <button 
            className={`spms-profile__tab ${tab === 'account' ? 'spms-profile__tab--active' : ''}`}
            onClick={() => setTab("account")}
          >
            <Settings size={18} /> Account Settings
          </button>
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div 
          key={tab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        >
          {tab === "about" && (
            <div className="spms-profile__content">
              
              {/* 2. STATISTICS GRID */}
              <section className="spms-profile__stats-grid">
                {Object.values(profileData.stats).map((stat, idx) => (
                  <div key={idx} className="spms-profile__stat-card">
                    <div className="spms-profile__stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
                      {stat.icon}
                    </div>
                    <div className="spms-profile__stat-info">
                      <span className="spms-profile__stat-value">{stat.value}</span>
                      <span className="spms-profile__stat-label">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* 3. ABOUT SECTION - INFO CARDS */}
              <section className="spms-profile__info-grid">
                
                <div className="spms-profile__info-card">
                  <div className="spms-profile__info-header">
                    <User size={18} /> <h3>Personal Information</h3>
                  </div>
                  <div className="spms-profile__info-body">
                    <div className="spms-profile__detail">
                      <span className="spms-profile__detail-label">Full Name</span>
                      <span className="spms-profile__detail-value">{profileData.name}</span>
                    </div>
                    <div className="spms-profile__detail">
                      <span className="spms-profile__detail-label">System Role</span>
                      <span className="spms-profile__detail-value">{profileData.role}</span>
                    </div>
                    <div className="spms-profile__detail">
                      <span className="spms-profile__detail-label">Joined Date</span>
                      <span className="spms-profile__detail-value">{profileData.joinedDate}</span>
                    </div>
                    <div className="spms-profile__detail">
                      <span className="spms-profile__detail-label">Account Status</span>
                      <span className="spms-profile__detail-value" style={{color: '#10b981'}}>{profileData.accountStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="spms-profile__info-card">
                  <div className="spms-profile__info-header">
                    <GraduationCap size={18} /> <h3>{profileData.role.toLowerCase() === 'student' ? 'Academic Information' : 'Professional Information'}</h3>
                  </div>
                  <div className="spms-profile__info-body">
                    {profileData.role.toLowerCase() === 'student' ? (
                      <>
                        <div className="spms-profile__detail">
                          <span className="spms-profile__detail-label">Enrollment Number</span>
                          <span className="spms-profile__detail-value">{profileData.displayId}</span>
                        </div>
                        <div className="spms-profile__detail">
                          <span className="spms-profile__detail-label">Semester</span>
                          <span className="spms-profile__detail-value">{profileData.semester}</span>
                        </div>
                        <div className="spms-profile__detail">
                          <span className="spms-profile__detail-label">CPI / Grade</span>
                          <span className="spms-profile__detail-value">{profileData.cpi}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="spms-profile__detail">
                          <span className="spms-profile__detail-label">Designation</span>
                          <span className="spms-profile__detail-value">{profileData.designation}</span>
                        </div>
                        <div className="spms-profile__detail">
                          <span className="spms-profile__detail-label">Department</span>
                          <span className="spms-profile__detail-value">{profileData.department}</span>
                        </div>
                        <div className="spms-profile__detail">
                          <span className="spms-profile__detail-label">Staff ID</span>
                          <span className="spms-profile__detail-value">{profileData.displayId}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </section>

              {/* 5. RECENT ACTIVITY TIMELINE */}
              <section className="spms-profile__activity">
                <h3 className="spms-profile__activity-title"><Activity size={20}/> Recent Activity</h3>
                {profileData.timeline && profileData.timeline.length > 0 ? (
                  <div className="spms-profile__timeline">
                    {profileData.timeline.map((item, idx) => (
                      <div key={idx} className="spms-profile__timeline-item">
                        <div className="spms-profile__timeline-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
                          {item.icon}
                        </div>
                        <div className="spms-profile__timeline-content">
                          <h4 className="spms-profile__timeline-title">{item.title}</h4>
                          <span className="spms-profile__timeline-time">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="spms-profile__empty">No recent activity.</div>
                )}
              </section>
            </div>
          )}

          {/* 4. ACCOUNT SETTINGS TAB */}
          {tab === "account" && (
            <div className="spms-profile__settings-grid">
              <div className="spms-profile__form-card">
                <div className="spms-profile__info-header">
                  <User size={18} /> <h3>Update Profile</h3>
                </div>
                <form onSubmit={handleSaveProfile} className="spms-profile__form-body">
                  <div className="spms-profile__input-group">
                    <label>Full Name</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div className="spms-profile__input-group">
                    <label>Email Address</label>
                    <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                  </div>
                  <div className="spms-profile__input-group">
                    <label>Phone Number</label>
                    <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : <><Save size={16}/> Save Changes</>}
                  </button>
                </form>
              </div>

              <div className="spms-profile__form-card">
                <div className="spms-profile__info-header">
                  <Lock size={18} /> <h3>Change Password</h3>
                </div>
                <form onSubmit={handleUpdatePassword} className="spms-profile__form-body">
                  <div className="spms-profile__input-group">
                    <label>New Password</label>
                    <input type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                  </div>
                  <div className="spms-profile__input-group">
                    <label>Confirm Password</label>
                    <input type="password" value={editForm.confirmPassword} onChange={e => setEditForm({...editForm, confirmPassword: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-secondary" disabled={saving || !editForm.password}>
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-toast spms-toast--${toast.type}`}
          >
            <CheckCircle2 size={20} />
            <div className="spms-toast__content">
              <h4>{toast.type === 'success' ? 'Success' : 'Error'}</h4>
              <p>{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
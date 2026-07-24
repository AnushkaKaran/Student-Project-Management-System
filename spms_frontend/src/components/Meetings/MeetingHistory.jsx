import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Search, AlertCircle, X, Users } from "lucide-react";
import api from "../../api/axios";
import "./MeetingHistory.css";

export default function MeetingHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      // Fetch all required datasets concurrently
      const [meetingsRes, groupsRes, attendanceRes] = await Promise.all([
        api.get("/meetings"),
        api.get("/groups"),
        api.get("/project-meeting-attendance")
      ]);
      
      const allMeetings = meetingsRes.data.data || meetingsRes.data || [];
      const allGroups = groupsRes.data.data || groupsRes.data || [];
      const allAttendance = attendanceRes.data.data || attendanceRes.data || [];

      // Filter only completed meetings for the history view
      const completedMeetings = allMeetings.filter(m => m.MeetingStatus === "Completed");

      // Dynamically join and compute the data
      const computedHistory = completedMeetings.map(meeting => {
        // 1. Join Group Name
        const group = allGroups.find(g => g.ProjectGroupID === meeting.ProjectGroupID);
        const groupName = group ? group.ProjectGroupName : "Unknown Group";

        // 2. Compute Attendance Summary
        const meetingAttendance = allAttendance.filter(a => a.ProjectMeetingID === meeting.ProjectMeetingID);
        const presentCount = meetingAttendance.filter(a => a.IsPresent === 1 || a.IsPresent === true).length;
        const absentCount = meetingAttendance.filter(a => a.IsPresent === 0 || a.IsPresent === false).length;

        return {
          id: meeting.ProjectMeetingID,
          groupName: groupName,
          purpose: meeting.MeetingPurpose || "General Meeting",
          date: meeting.MeetingDateTime,
          notes: meeting.MeetingNotes || "No notes recorded",
          status: meeting.MeetingStatus,
          presentCount,
          absentCount
        };
      });

      // Sort by date descending (newest first)
      computedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

      setHistoryData(computedHistory);
    } catch (err) {
      console.error("Error computing meeting history:", err);
      showToast("Data Fetch Error", "Failed to compile the meeting history analytics.");
    } finally {
      setLoading(false);
    }
  };

  // Format Date for UI rendering
  const renderUIDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter based on search query
  const filteredHistory = historyData.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    return (
      h.groupName.toLowerCase().includes(q) || 
      h.purpose.toLowerCase().includes(q) || 
      h.notes.toLowerCase().includes(q)
    );
  });

  return (
    <div className="spms-history">
      <header className="spms-history__header">
        <div className="spms-history__title-group">
          <h1 className="spms-history__title">Meeting History & Analytics</h1>
          <p className="spms-history__subtitle">A read-only compiled log of all completed project meetings.</p>
        </div>
        
        <div className="spms-history__search-wrapper">
          <Search size={18} className="spms-history__search-icon" />
          <input 
            type="text" 
            placeholder="Search by group, purpose, or notes..." 
            className="spms-history__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Full-width Card Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="spms-history__card"
      >
        <div className="spms-history__card-header">
          <h2 className="spms-history__card-title">Completed Meetings Log</h2>
        </div>
        
        <div className="spms-history__card-body">
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="spms-history__skeleton-row"></div>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="spms-history__empty">
              <div className="spms-history__empty-icon">
                <History size={28} />
              </div>
              <h3 className="spms-history__empty-title">
                {searchQuery ? "No Matches Found" : "No Completed Meetings"}
              </h3>
              <p className="spms-history__empty-subtitle">
                {searchQuery 
                  ? "Try adjusting your search criteria." 
                  : "Meetings will appear here automatically once their status is updated to 'Completed'."}
              </p>
            </div>
          ) : (
            <div className="spms-history__table-wrapper">
              <table className="spms-history__table">
                <thead>
                  <tr>
                    <th>Project Group</th>
                    <th>Date & Purpose</th>
                    <th>Discussion Notes</th>
                    <th>Attendance Summary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredHistory.map((row) => (
                      <motion.tr 
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {row.groupName}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 500, color: '#334155' }}>
                              {row.purpose}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {renderUIDate(row.date)}
                            </span>
                          </div>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <span style={{ fontSize: '0.8125rem', color: '#475569', display: 'block', lineHeight: 1.4 }}>
                            {row.notes}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Present">
                              <span className="spms-history__stat-badge spms-history__stat-badge--present">
                                {row.presentCount}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Present</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Absent">
                              <span className="spms-history__stat-badge spms-history__stat-badge--absent">
                                {row.absentCount}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Absent</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="spms-history__badge spms-history__badge--completed">
                            {row.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modern Toast Notification for errors */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="spms-history__toast"
          >
            <div className="spms-history__toast-icon">
              <AlertCircle size={20} />
            </div>
            <div className="spms-history__toast-content">
              <h4 className="spms-history__toast-title">{toast.title}</h4>
              <p className="spms-history__toast-message">{toast.message}</p>
            </div>
            <button className="spms-history__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
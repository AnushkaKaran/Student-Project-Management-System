import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search } from "lucide-react";
import api from "../../api/axios";
import "./MemberReport.css";
import { getStudentDisplayName } from "../../utils/nameHelper";

export default function MemberReport() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required relations concurrently
      const [groupsRes, mappingsRes, studentsRes, staffRes] = await Promise.all([
        api.get("/groups"),
        api.get("/project-group-members"),
        api.get("/students"),
        api.get("/master/staff")
      ]);

      const groups = groupsRes.data.data || groupsRes.data || [];
      const mappings = mappingsRes.data.data || mappingsRes.data || [];
      const students = studentsRes.data.data || studentsRes.data || [];
      const staffList = staffRes.data.data || staffRes.data || [];

      const reportData = [];

        // Helper for names
        const getPersonName = (p, fallback) => {
          if (p.StaffName) return p.StaffName;
          return getStudentDisplayName(p) !== "Unknown Student" ? getStudentDisplayName(p) : fallback;
        };

      // Build the report rows
      groups.forEach(group => {
        
        // 1. Add Faculty Guide (if assigned)
        if (group.GuideStaffID) {
          const guide = staffList.find(s => s.StaffID === group.GuideStaffID);
          if (guide) {
            reportData.push({
              id: `F-${group.ProjectGroupID}-${guide.StaffID}`,
              memberID: guide.StaffID,
              memberName: getPersonName(guide, "Raghav (Faculty)"),
              projectID: group.ProjectGroupID,
              projectName: group.ProjectGroupName || "Unnamed Group",
              role: "Faculty",
              isLeader: false
            });
          }
        }

        // 2. Add Students mapped to this group
        const groupStudents = mappings.filter(m => m.ProjectGroupID === group.ProjectGroupID);
        groupStudents.forEach(mapping => {
          const student = students.find(s => s.StudentID === mapping.StudentID);
          if (student) {
            reportData.push({
              id: `S-${group.ProjectGroupID}-${student.StudentID}`,
              memberID: student.StudentID,
              memberName: getPersonName(student, "Raghav"),
              projectID: group.ProjectGroupID,
              projectName: group.ProjectGroupName,
              role: "Student",
              isLeader: mapping.IsLeader === 1 || mapping.IsLeader === true
            });
          }
        });

      });

      setMembers(reportData);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter based on search query
  const filteredMembers = members.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    return (
      (m.memberName || "").toLowerCase().includes(q) || 
      (m.projectName || "").toLowerCase().includes(q) ||
      (m.memberID || "").toString().toLowerCase().includes(q)
    );
  });

  return (
    <div className="spms-mreport">
      <header className="spms-mreport__header">
        <div className="spms-mreport__title-group">
          <h1 className="spms-mreport__title">Project Membership Roster</h1>
          <p className="spms-mreport__subtitle">Comprehensive view of all students and faculty mapped to project groups.</p>
        </div>
        
        <div className="spms-mreport__header-actions">
          <div className="spms-mreport__search-wrapper">
            <Search size={18} className="spms-mreport__search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or project..." 
              className="spms-mreport__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="spms-mreport__card"
      >
        <div className="spms-mreport__card-header">
          <h2 className="spms-mreport__card-title">Member Allocation List</h2>
        </div>
        
        <div className="spms-mreport__card-body">
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="spms-mreport__skeleton-row"></div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="spms-mreport__empty">
              <div className="spms-mreport__empty-icon">
                <Users size={28} />
              </div>
              <h3 className="spms-mreport__empty-title">
                {searchQuery ? "No Matches Found" : "No Members Found"}
              </h3>
              <p className="spms-mreport__empty-subtitle">
                {searchQuery 
                  ? "Try adjusting your search criteria." 
                  : "No students or faculty have been mapped to project groups yet."}
              </p>
            </div>
          ) : (
            <div className="spms-mreport__table-wrapper">
              <table className="spms-mreport__table">
                <thead>
                  <tr>
                    <th>Member Profile</th>
                    <th>System Role</th>
                    <th>Project Details</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredMembers.map((row) => {
                      const roleClass = row.role === 'Student' 
                        ? 'spms-mreport__role-badge--student' 
                        : 'spms-mreport__role-badge--faculty';

                      return (
                        <motion.tr 
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                  {row.memberName}
                                </span>
                                {row.isLeader && (
                                  <span className="spms-mreport__leader-badge">Leader</span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                ID: {row.memberID}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`spms-mreport__role-badge ${roleClass}`}>
                              {row.role}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 500, color: '#334155' }}>
                                {row.projectName} (Group ID: {row.projectID || "N/A"})
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
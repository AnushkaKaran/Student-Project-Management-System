import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, Search, Info 
} from "lucide-react";
import api from "../../api/axios";
import { getStudentDisplayName } from "../../utils/nameHelper";
import "./MarksProgressReport.css";

export default function MarksProgressReport() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSimulatedMarks();
  }, []);

  const fetchSimulatedMarks = async () => {
    try {
      setLoading(true);
      
      // Fetch live relations to base the mock marks upon
      const [groupsRes, mappingsRes, studentsRes] = await Promise.all([
        api.get("/groups"),
        api.get("/project-group-members"),
        api.get("/students")
      ]);

      const groups = groupsRes.data.data || groupsRes.data || [];
      const mappings = mappingsRes.data.data || mappingsRes.data || [];
      const students = studentsRes.data.data || studentsRes.data || [];

      const simulatedMarks = [];

      groups.forEach((group, gIndex) => {
        const groupStudents = mappings.filter(m => m.ProjectGroupID === group.ProjectGroupID);
        
        groupStudents.forEach((mapping, sIndex) => {
          const student = students.find(s => s.StudentID === mapping.StudentID);
          if (student) {
            
            // Deterministic mock generation
            const baseScore = 50 + ((gIndex * 7 + sIndex * 13) % 45); // 50 to 95
            let status = "Passed";
            if (baseScore < 60) status = "Needs Improvement";
            if (baseScore < 55) status = "Failed";

            const titles = ["Phase 1 Progress", "Weekly Update", "Sensor Testing", "Final Evaluation"];
            const titleIndex = (gIndex + sIndex) % titles.length;

            const dateOffset = (gIndex * 3 + sIndex * 2) % 30;
            const evalDate = new Date();
            evalDate.setDate(evalDate.getDate() - dateOffset);

              simulatedMarks.push({
                marksID: `MR-${1000 + simulatedMarks.length}`,
                projectID: group.ProjectGroupID || group.id || "N/A",
                projectName: group.ProjectGroupName || group.name || "Unnamed Group",
                studentID: student.StudentID || "Unknown",
                studentName: getStudentDisplayName(student),
              reportTitle: titles[titleIndex],
              marks: baseScore,
              evaluationDate: evalDate.toISOString(),
              status: status
            });
          }
        });
      });

      // Sort by marks descending
      simulatedMarks.sort((a, b) => b.marks - a.marks);
      
      setTimeout(() => {
        setMarks(simulatedMarks);
        setLoading(false);
      }, 600);

    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const renderUIDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Filter based on search query
  const filteredMarks = marks.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    return (
      (m.studentName || "").toLowerCase().includes(q) || 
      (m.projectName || "").toLowerCase().includes(q) ||
      (m.reportTitle || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="spms-marks">
      <header className="spms-marks__header">
        <div className="spms-marks__title-group">
          <h1 className="spms-marks__title">Student Evaluation Matrix</h1>
          <p className="spms-marks__subtitle">Monitor individual student grades and project evaluation scores.</p>
        </div>
        
        <div className="spms-marks__header-actions">
          <div className="spms-marks__search-wrapper">
            <Search size={18} className="spms-marks__search-icon" />
            <input 
              type="text" 
              placeholder="Search student, project or title..." 
              className="spms-marks__search-input"
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
        className="spms-marks__card"
      >
        <div className="spms-marks__card-header">
          <h2 className="spms-marks__card-title">Evaluation Records</h2>
        </div>
        
        <div className="spms-marks__card-body">
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="spms-marks__skeleton-row"></div>
              ))}
            </div>
          ) : filteredMarks.length === 0 ? (
            <div className="spms-marks__empty">
              <div className="spms-marks__empty-icon">
                <Award size={28} />
              </div>
              <h3 className="spms-marks__empty-title">
                {searchQuery ? "No Matches Found" : "No Records Available"}
              </h3>
              <p className="spms-marks__empty-subtitle">
                {searchQuery 
                  ? "Try adjusting your search criteria." 
                  : "No students have been evaluated yet."}
              </p>
            </div>
          ) : (
            <div className="spms-marks__table-wrapper">
              <table className="spms-marks__table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Student Profile</th>
                    <th>Project Context</th>
                    <th>Evaluation Metric</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredMarks.map((row) => {
                      const statusClass = row.status === 'Passed' ? 'spms-marks__status-badge--passed' 
                                       : row.status === 'Needs Improvement' ? 'spms-marks__status-badge--needs-improvement'
                                       : 'spms-marks__status-badge--failed';

                      const scoreClass = row.marks >= 80 ? 'spms-marks__score-badge--high'
                                       : row.marks >= 60 ? 'spms-marks__score-badge--medium'
                                       : 'spms-marks__score-badge--low';

                      return (
                        <motion.tr 
                          key={row.marksID}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td style={{ fontWeight: 600, color: '#6366f1' }}>
                            {row.marksID}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                {row.studentName}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                ID: {row.studentID}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 500, color: '#334155' }}>
                                {row.projectName} (Group ID: {row.projectID || "N/A"})
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 500, color: '#334155' }}>
                                {row.reportTitle}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Date: {renderUIDate(row.evaluationDate)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`spms-marks__score-badge ${scoreClass}`}>
                              {row.marks}
                            </span>
                          </td>
                          <td>
                            <span className={`spms-marks__status-badge ${statusClass}`}>
                              {row.status}
                            </span>
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
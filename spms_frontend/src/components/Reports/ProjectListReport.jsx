import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, Info, AlertTriangle 
} from "lucide-react";
import api from "../../api/axios";
import "./ProjectListReport.css";

export default function ProjectListReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSimulatedReports();
  }, []);

  const fetchSimulatedReports = async () => {
    try {
      setLoading(true);
      // Fetch real project groups to form the base of the report
      const groupsRes = await api.get("/groups");
      const realGroups = groupsRes.data.data || groupsRes.data || [];

      // Since the backend does NOT have a Reports table, we simulate report generation 
      // deterministically based on the real groups to demonstrate the UI.
      const simulatedReports = realGroups.map((g, index) => {
        // Deterministic mock generation
        const mockTypes = ["Interim", "Weekly", "Final", "Monthly"];
        const mockStatuses = ["Submitted", "Reviewed", "Rejected", "Pending"];
        
        const typeIndex = (index + g.ProjectGroupID) % mockTypes.length;
        const statusIndex = (index * 2) % mockStatuses.length;

        // Generate a date within the last 30 days
        const dateOffset = (index * 5) % 30;
        const subDate = new Date();
        subDate.setDate(subDate.getDate() - dateOffset);

        return {
          reportID: `RPT-${1000 + index}`,
          projectID: g.ProjectGroupID || "N/A",
          projectName: g.ProjectGroupName || "Unnamed Group",
          guideID: g.GuideStaffID,
          reportTitle: `${mockTypes[typeIndex]} Progress Report`,
          reportType: mockTypes[typeIndex],
          submissionDate: subDate.toISOString(),
          status: mockStatuses[statusIndex]
        };
      });

      // Sort by date descending
      simulatedReports.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
      
      // Simulate network delay for realistic loading UX
      setTimeout(() => {
        setReports(simulatedReports);
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
  const filteredReports = reports.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    return (
      (r.projectName || "").toLowerCase().includes(q) || 
      (r.reportTitle || "").toLowerCase().includes(q) ||
      (r.reportID || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="spms-report">
      <header className="spms-report__header">
        <div className="spms-report__title-group">
          <h1 className="spms-report__title">Project Submissions Report</h1>
          <p className="spms-report__subtitle">Track and review documentation submitted by project groups.</p>
        </div>
        
        <div className="spms-report__header-actions">
          <div className="spms-report__search-wrapper">
            <Search size={18} className="spms-report__search-icon" />
            <input 
              type="text" 
              placeholder="Search by project or title..." 
              className="spms-report__search-input"
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
        className="spms-report__card"
      >
        <div className="spms-report__card-header">
          <h2 className="spms-report__card-title">Submission Log</h2>
        </div>
        
        <div className="spms-report__card-body">
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="spms-report__skeleton-row"></div>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="spms-report__empty">
              <div className="spms-report__empty-icon">
                <FileText size={28} />
              </div>
              <h3 className="spms-report__empty-title">
                {searchQuery ? "No Matches Found" : "No Reports Available"}
              </h3>
              <p className="spms-report__empty-subtitle">
                {searchQuery 
                  ? "Try adjusting your search criteria." 
                  : "No groups have submitted reports yet."}
              </p>
            </div>
          ) : (
            <div className="spms-report__table-wrapper">
              <table className="spms-report__table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Project details</th>
                    <th>Document Info</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredReports.map((row) => {
                      const badgeClass = row.status === 'Reviewed' ? 'spms-report__badge--reviewed' 
                                       : row.status === 'Submitted' ? 'spms-report__badge--submitted'
                                       : row.status === 'Rejected' ? 'spms-report__badge--rejected'
                                       : 'spms-report__badge--pending';

                      return (
                        <motion.tr 
                          key={row.reportID}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td style={{ fontWeight: 600, color: '#6366f1' }}>
                            {row.reportID}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                {row.projectName} (Group ID: {row.projectID})
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 500, color: '#334155' }}>
                                {row.reportTitle}
                              </span>
                              <span className="spms-report__type-badge">
                                {row.reportType}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                              {renderUIDate(row.submissionDate)}
                            </span>
                          </td>
                          <td>
                            <span className={`spms-report__badge ${badgeClass}`}>
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
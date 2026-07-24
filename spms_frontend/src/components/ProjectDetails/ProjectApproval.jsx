import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X, ClipboardList, Search } from "lucide-react";
import api from "../../api/axios";
import "./ProjectApproval.css";

export default function ProjectApproval() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Proposed");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/groups");
      setProjects(res.data.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast("error", "Data Error", "Failed to load projects for approval.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision) => {
    if (!window.confirm(`Are you sure you want to mark this project as ${decision}?`)) return;

    try {
      setProcessingId(id);
      await api.patch(`/projects/${id}/approval`, { status: decision });
      
      showToast("success", "Decision Saved", `Project successfully marked as ${decision}.`);
      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error("Approval error:", error);
      showToast("error", "Decision Error", "Failed to update the project status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    // Filter by Status
    if (filter !== "All" && p.Status !== filter) return false;
    
    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = (p.ProjectTitle || "").toLowerCase();
      const groupName = (p.ProjectGroupName || "").toLowerCase();
      const guide = (p.GuideStaffName || "").toLowerCase();
      return title.includes(q) || groupName.includes(q) || guide.includes(q);
    }
    
    return true;
  });

  return (
    <div className="spms-approval">
      <header className="spms-approval__header">
        <div className="spms-approval__title-group">
          <h1 className="spms-approval__title">Project Approval</h1>
          <p className="spms-approval__subtitle">Review and manage project proposals submitted by student groups.</p>
        </div>
        
        <div className="spms-approval__header-actions">
          <div className="spms-approval__search-wrapper">
            <Search size={18} className="spms-approval__search-icon" />
            <input 
              type="text" 
              placeholder="Search proposals..." 
              className="spms-approval__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="spms-approval__filters">
            {["Proposed", "Approved", "Rejected", "All"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`spms-approval__filter-btn ${filter === f ? "spms-approval__filter-btn--active" : ""}`}
              >
                {f === "Proposed" ? "Pending" : f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="spms-approval__layout">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-approval__card spms-approval__card--full"
        >
          <div className="spms-approval__card-body spms-approval__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-approval__skeleton-row"></div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="spms-approval__empty">
                <div className="spms-approval__empty-icon">
                  <ClipboardList size={28} />
                </div>
                <h3 className="spms-approval__empty-title">No Projects Found</h3>
                <p className="spms-approval__empty-subtitle">
                  {filter === "Proposed" 
                    ? "There are no pending project proposals awaiting your approval." 
                    : `There are no ${filter.toLowerCase()} projects matching your search.`}
                </p>
              </div>
            ) : (
              <div className="spms-approval__table-wrapper">
                <table className="spms-approval__table">
                  <thead>
                    <tr>
                      <th>Project Proposal</th>
                      <th>Domain & Type</th>
                      <th>Guide</th>
                      <th>Status</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredProjects.map((p) => {
                        const isProcessing = processingId === p.ProjectGroupID;
                        const statusClass = p.Status === 'Approved' ? 'spms-approval__badge--approved' 
                                          : p.Status === 'Rejected' ? 'spms-approval__badge--rejected'
                                          : 'spms-approval__badge--pending';

                        return (
                          <motion.tr 
                            key={p.ProjectGroupID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                  {p.ProjectTitle || "No Title Submitted"}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Group: {p.ProjectGroupName}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 500, color: '#334155' }}>
                                  {p.ProjectArea || "—"}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {p.ProjectTypeName || "—"}
                                </span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500, color: '#334155' }}>
                              {p.GuideStaffName || "—"}
                            </td>
                            <td>
                              <span className={`spms-approval__badge ${statusClass}`}>
                                {p.Status === "Proposed" ? "Pending" : (p.Status || "Unknown")}
                              </span>
                            </td>
                            <td>
                              {p.Status === "Proposed" ? (
                                <div className="spms-approval__table-actions">
                                  <button 
                                    type="button"
                                    className={`spms-approval__icon-btn spms-approval__icon-btn--approve ${isProcessing ? 'disabled' : ''}`}
                                    onClick={() => handleDecision(p.ProjectGroupID, "Approved")}
                                    title="Approve Proposal"
                                    disabled={isProcessing}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button 
                                    type="button"
                                    className={`spms-approval__icon-btn spms-approval__icon-btn--reject ${isProcessing ? 'disabled' : ''}`}
                                    onClick={() => handleDecision(p.ProjectGroupID, "Rejected")}
                                    title="Reject Proposal"
                                    disabled={isProcessing}
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="spms-approval__table-actions" style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
                                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Processed</span>
                                </div>
                              )}
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

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-approval__toast spms-approval__toast--${toast.type}`}
          >
            <div className="spms-approval__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-approval__toast-content">
              <h4 className="spms-approval__toast-title">{toast.title}</h4>
              <p className="spms-approval__toast-message">{toast.message}</p>
            </div>
            <button className="spms-approval__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
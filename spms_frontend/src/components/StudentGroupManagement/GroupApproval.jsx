import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, CheckCircle, AlertCircle, 
  X, Search, Check, XCircle 
} from "lucide-react";
import api from "../../api/axios";
import "./GroupApproval.css";

export default function GroupApproval() {
  const [groups, setGroups] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, staffRes] = await Promise.all([
        api.get("/groups"),
        api.get("/master/staff")
      ]);
      
      setGroups(groupsRes.data.data || groupsRes.data || []);
      setStaff(staffRes.data.data || staffRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("error", "Data Error", "Failed to load project groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, decision) => {
    try {
      // Assuming the backend accepts ApprovalStatus via PATCH to /groups
      await api.patch(`/groups/${id}`, { ApprovalStatus: decision });
      showToast("success", "Status Updated", `The group has been marked as ${decision}.`);
      
      // Optimistic UI update
      setGroups(groups.map(g => 
        g.ProjectGroupID === id ? { ...g, ApprovalStatus: decision } : g
      ));
    } catch (err) {
      console.error("Approval error:", err);
      showToast("error", "Update Failed", "Could not change the group's approval status.");
    }
  };

  const getGuideName = (staffId) => {
    if (!staffId) return "Unassigned";
    const guide = staff.find(s => s.StaffID === staffId);
    return guide ? guide.StaffName : "Unknown";
  };

  // Filter based on search query
  const filteredGroups = groups.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const guideName = getGuideName(g.GuideStaffID).toLowerCase();
    const groupName = (g.ProjectGroupName || "").toLowerCase();
    
    return groupName.includes(q) || guideName.includes(q);
  });

  return (
    <div className="spms-grp-approve">
      <header className="spms-grp-approve__header">
        <div className="spms-grp-approve__title-group">
          <h1 className="spms-grp-approve__title">Group Approval Matrix</h1>
          <p className="spms-grp-approve__subtitle">Review and manage project group formations.</p>
        </div>
        
        <div className="spms-grp-approve__header-actions">
          <div className="spms-grp-approve__search-wrapper">
            <Search size={18} className="spms-grp-approve__search-icon" />
            <input 
              type="text" 
              placeholder="Search groups or guides..." 
              className="spms-grp-approve__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="spms-grp-approve__layout">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-grp-approve__card spms-grp-approve__card--full"
        >
          <div className="spms-grp-approve__card-body spms-grp-approve__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-grp-approve__skeleton-row"></div>
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="spms-grp-approve__empty">
                <div className="spms-grp-approve__empty-icon">
                  <Users size={24} />
                </div>
                <h3 className="spms-grp-approve__empty-title">
                  {searchQuery ? "No Matches Found" : "No Groups Available"}
                </h3>
                <p className="spms-grp-approve__empty-subtitle">
                  {searchQuery 
                    ? "Try adjusting your search criteria." 
                    : "There are currently no project groups registered in the system."}
                </p>
              </div>
            ) : (
              <div className="spms-grp-approve__table-wrapper">
                <table className="spms-grp-approve__table">
                  <thead>
                    <tr>
                      <th>Group Name & ID</th>
                      <th>Assigned Guide</th>
                      <th>Project Type</th>
                      <th>Status</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredGroups.map((g) => {
                        const status = g.ApprovalStatus || "Pending";
                        const badgeClass = status === 'Approved' ? 'spms-grp-approve__badge--approved' 
                                         : status === 'Rejected' ? 'spms-grp-approve__badge--rejected'
                                         : 'spms-grp-approve__badge--pending';

                        return (
                          <motion.tr 
                            key={g.ProjectGroupID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{g.ProjectGroupName}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {g.ProjectGroupID}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500, color: '#334155' }}>
                              {getGuideName(g.GuideStaffID)}
                            </td>
                            <td style={{ color: '#64748b' }}>
                              {g.ProjectTypeID ? `Type ${g.ProjectTypeID}` : "Unassigned"}
                            </td>
                            <td>
                              <span className={`spms-grp-approve__badge ${badgeClass}`}>{status}</span>
                            </td>
                            <td>
                              {status === "Pending" ? (
                                <div className="spms-grp-approve__table-actions">
                                  <button 
                                    type="button"
                                    className="spms-grp-approve__icon-btn spms-grp-approve__icon-btn--approve" 
                                    onClick={() => handleApproval(g.ProjectGroupID, "Approved")}
                                    title="Approve Group"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    type="button"
                                    className="spms-grp-approve__icon-btn spms-grp-approve__icon-btn--reject" 
                                    onClick={() => handleApproval(g.ProjectGroupID, "Rejected")}
                                    title="Reject Group"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="spms-grp-approve__table-actions" style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
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
            className={`spms-grp-approve__toast spms-grp-approve__toast--${toast.type}`}
          >
            <div className="spms-grp-approve__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-grp-approve__toast-content">
              <h4 className="spms-grp-approve__toast-title">{toast.title}</h4>
              <p className="spms-grp-approve__toast-message">{toast.message}</p>
            </div>
            <button className="spms-grp-approve__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
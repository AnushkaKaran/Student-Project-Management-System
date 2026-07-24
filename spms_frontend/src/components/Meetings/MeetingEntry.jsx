import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Save, AlertTriangle 
} from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./MeetingEntry.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

export default function MeetingEntry() {
  const [entries, setEntries] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    meetingpurpose: "",
    meetingnotes: "",
    meetingstatus: "Scheduled",
    meetingstatusdescription: "",
  });
  
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchAllData();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, groupsRes] = await Promise.all([
        api.get("/meetings"),
        api.get("/groups")
      ]);
      
      setEntries(meetingsRes.data.data || meetingsRes.data || []);
      setProjectGroups(groupsRes.data.data || groupsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("error", "Data Error", "Failed to load meeting entries.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await api.get("/meetings");
      setEntries(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching meeting entries:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId) {
      showToast("error", "Action Denied", "Please select a meeting from the table to add minutes.");
      return;
    }

    try {
      const payload = {
        MeetingPurpose: form.meetingpurpose,
        MeetingNotes: form.meetingnotes,
        MeetingStatus: form.meetingstatus,
        MeetingStatusDescription: form.meetingstatusdescription,
        MeetingStatusDatetime: new Date().toISOString(),
      };

      await api.patch(`/meetings/${editingId}`, payload);
      showToast("success", "Minutes Saved", "The meeting notes and status were successfully updated.");

      setForm({
        meetingpurpose: "",
        meetingnotes: "",
        meetingstatus: "Scheduled",
        meetingstatusdescription: "",
      });
      setEditingId(null);
      setIsModalOpen(false);
      fetchEntries();
    } catch (err) {
      console.error("Error updating meeting entry:", err);
      showToast("error", "Submission Error", "Failed to save the meeting minutes.");
    }
  };

  const handleEdit = (meeting) => {
    setForm({
      meetingpurpose: meeting.MeetingPurpose || "",
      meetingnotes: meeting.MeetingNotes || "",
      meetingstatus: meeting.MeetingStatus || "Scheduled",
      meetingstatusdescription: meeting.MeetingStatusDescription || "",
    });
    setEditingId(meeting.ProjectMeetingID);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/meetings/${deleteModal.id}`);
      showToast("success", "Record Deleted", "The meeting entry was successfully deleted.");
      
      if (editingId === deleteModal.id) {
        setEditingId(null);
        setForm({
          meetingpurpose: "",
          meetingnotes: "",
          meetingstatus: "Scheduled",
          meetingstatusdescription: "",
        });
        setIsModalOpen(false);
      }
      fetchEntries();
    } catch (err) {
      console.error("Delete Error:", err);
      showToast("error", "Deletion Error", "Failed to delete the meeting entry.");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      meetingpurpose: "",
      meetingnotes: "",
      meetingstatus: "Scheduled",
      meetingstatusdescription: "",
    });
    setIsModalOpen(false);
  };

  // Helper functions
  const getGroupName = (id) => projectGroups.find(g => g.ProjectGroupID === id)?.ProjectGroupName || "Unknown Group";
  
  const renderUIDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter based on search query (Group Name or Notes/Purpose)
  const filteredEntries = entries.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const groupName = getGroupName(m.ProjectGroupID).toLowerCase();
    const purpose = (m.MeetingPurpose || "").toLowerCase();
    const notes = (m.MeetingNotes || "").toLowerCase();
    const status = (m.MeetingStatus || "").toLowerCase();
    
    return groupName.includes(q) || purpose.includes(q) || notes.includes(q) || status.includes(q);
  });

  return (
    <div className="spms-entry">
      <header className="spms-entry__header">
        <div className="spms-entry__title-group">
          <h1 className="spms-entry__title">Meeting Minutes & Outcomes</h1>
          <p className="spms-entry__subtitle">Log discussion points and update the status of scheduled meetings.</p>
        </div>
        
        <div className="spms-entry__header-actions">
          <div className="spms-entry__search-wrapper">
            <Search size={18} className="spms-entry__search-icon" />
            <input 
              type="text" 
              placeholder="Search by group or keywords..." 
              className="spms-entry__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="spms-entry__layout">
        
        {/* Right Column: Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-entry__card spms-entry__card--full"
        >
          <div className="spms-entry__card-body spms-entry__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-entry__skeleton-row"></div>
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="spms-entry__empty">
                <div className="spms-entry__empty-icon">
                  <FileText size={24} />
                </div>
                <h3 className="spms-entry__empty-title">
                  {searchQuery ? "No Matches Found" : "No Meetings Found"}
                </h3>
                <p className="spms-entry__empty-subtitle">
                  {searchQuery ? "Try adjusting your search keywords." : "No meetings are currently scheduled."}
                </p>
              </div>
            ) : (
              <div className="spms-entry__table-wrapper">
                <table className="spms-entry__table">
                  <thead>
                    <tr>
                      <th>Project Group</th>
                      <th>Meeting Info</th>
                      <th>Status Log</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredEntries.map((m) => {
                        const isCompleted = m.MeetingStatus === 'Completed';
                        const isCancelled = m.MeetingStatus === 'Cancelled';
                        const badgeClass = isCompleted ? 'spms-entry__badge--completed' 
                                         : isCancelled ? 'spms-entry__badge--cancelled' 
                                         : 'spms-entry__badge--scheduled';

                        return (
                          <motion.tr 
                            key={m.ProjectMeetingID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{getGroupName(m.ProjectGroupID)}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {m.MeetingDateTime ? renderUIDate(m.MeetingDateTime) : 'No Date Set'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 500, color: '#334155' }}>{m.MeetingPurpose || '-'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                  {m.MeetingNotes || 'No notes added'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                <span className={`spms-entry__badge ${badgeClass}`}>{m.MeetingStatus || 'Scheduled'}</span>
                                {m.MeetingStatusDatetime && (
                                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                    Updated: {renderUIDate(m.MeetingStatusDatetime)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="spms-entry__table-actions">
                                <button 
                                  type="button"
                                  className="spms-entry__icon-btn spms-entry__icon-btn--edit" 
                                  onClick={() => handleEdit(m)}
                                  title="Add Minutes / Update Status"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  type="button"
                                  className="spms-entry__icon-btn spms-entry__icon-btn--delete" 
                                  onClick={() => confirmDelete(m.ProjectMeetingID)}
                                  title="Delete Record"
                                >
                                  <Trash2 size={16} />
                                </button>
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel}
        title="Record Minutes"
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-entry__form-group">
              <label className="spms-entry__label">Meeting Purpose</label>
              <input
                name="meetingpurpose"
                value={form.meetingpurpose}
                onChange={handleChange}
                placeholder="e.g. Phase 1 Code Review"
                className="spms-entry__input"
                disabled={!editingId}
              />
            </div>
            <div className="spms-entry__form-group">
              <label className="spms-entry__label">Current Status</label>
              <select
                name="meetingstatus"
                value={form.meetingstatus}
                onChange={handleChange}
                className="spms-entry__select"
                disabled={!editingId}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-entry__form-group" style={{ flex: '1' }}>
              <label className="spms-entry__label">Status Remarks (Optional)</label>
              <input
                name="meetingstatusdescription"
                value={form.meetingstatusdescription}
                onChange={handleChange}
                placeholder="Reason for cancellation or delay"
                className="spms-entry__input"
                disabled={!editingId}
              />
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-entry__form-group" style={{ flex: '1' }}>
              <label className="spms-entry__label">Meeting Minutes / Notes</label>
              <textarea
                name="meetingnotes"
                value={form.meetingnotes}
                onChange={handleChange}
                placeholder="Detailed notes from the discussion..."
                className="spms-entry__textarea"
                disabled={!editingId}
                rows={5}
              />
            </div>
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!editingId}>
              <Save size={16} /> Save Minutes
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Meeting Entry"
        itemName={entries.find(e => e.ProjectMeetingID === deleteModal.id)?.MeetingPurpose || "this meeting"}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-entry__toast spms-entry__toast--${toast.type}`}
          >
            <div className="spms-entry__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-entry__toast-content">
              <h4 className="spms-entry__toast-title">{toast.title}</h4>
              <p className="spms-entry__toast-message">{toast.message}</p>
            </div>
            <button className="spms-entry__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

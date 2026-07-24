import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Plus, Save, AlertTriangle 
} from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./MeetingSchedule.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

export default function MeetingSchedule() {
  const [meetings, setMeetings] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    projectgroupid: "",
    guidestaffid: "",
    meetingdatetime: "",
    meetinglocation: "",
    description: "",
  });
  
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Convert ISO string to 'yyyy-MM-ddTHH:mm' for input
  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date - offset).toISOString().slice(0, 16);
  };

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
      const [meetingsRes, groupsRes, staffRes] = await Promise.all([
        api.get("/meetings"),
        api.get("/groups"),
        api.get("/master/staff")
      ]);
      
      setMeetings(meetingsRes.data.data || meetingsRes.data || []);
      setProjectGroups(groupsRes.data.data || groupsRes.data || []);
      setStaffList(staffRes.data.data || staffRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("error", "Data Error", "Failed to load meetings data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await api.get("/meetings");
      setMeetings(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching meetings:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.projectgroupid || !form.guidestaffid || !form.meetingdatetime) {
      showToast("error", "Validation Error", "Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        ProjectGroupID: form.projectgroupid,
        GuideStaffID: form.guidestaffid,
        MeetingDateTime: form.meetingdatetime,
        MeetingLocation: form.meetinglocation,
        Description: form.description,
      };

      if (editingId) {
        await api.patch(`/meetings/${editingId}`, payload);
        showToast("success", "Meeting Updated", "The meeting was updated successfully.");
      } else {
        await api.post("/meetings", payload);
        showToast("success", "Meeting Scheduled", "A new meeting has been scheduled.");
      }

      fetchMeetings();
      handleCancel();
    } catch (err) {
      console.error("Submit Error:", err);
      showToast("error", "Submission Error", "Failed to save the meeting.");
    }
  };

  const handleEdit = (meeting) => {
    setForm({
      projectgroupid: meeting.ProjectGroupID || "",
      guidestaffid: meeting.GuideStaffID || "",
      meetingdatetime: formatDateForInput(meeting.MeetingDateTime),
      meetinglocation: meeting.MeetingLocation || "",
      description: meeting.Description || "",
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
      showToast("success", "Meeting Cancelled", "The meeting was successfully deleted.");
      
      if (editingId === deleteModal.id) handleCancel();
      fetchMeetings();
    } catch (err) {
      console.error("Delete Error:", err);
      showToast("error", "Deletion Error", "Failed to delete the meeting.");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      projectgroupid: "",
      guidestaffid: "",
      meetingdatetime: "",
      meetinglocation: "",
      description: "",
    });
    setIsModalOpen(false);
  };

  // Helper functions for joining data visually
  const getGroupName = (id) => projectGroups.find(g => g.ProjectGroupID === id)?.ProjectGroupName || "Unknown Group";
  const getStaffName = (id) => staffList.find(s => s.StaffID === id)?.StaffName || "Unknown Staff";
  
  // Format Date for UI rendering
  const renderUIDate = (isoString) => {
    if (!isoString) return "No Date";
    const date = new Date(isoString);
    return date.toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const groupName = getGroupName(m.ProjectGroupID).toLowerCase();
    const staffName = getStaffName(m.GuideStaffID).toLowerCase();
    const location = (m.MeetingLocation || "").toLowerCase();
    
    return groupName.includes(q) || staffName.includes(q) || location.includes(q);
  });

  return (
    <div className="spms-meetings">
      <header className="spms-meetings__header">
        <div className="spms-meetings__title-group">
          <h1 className="spms-meetings__title">Meeting Schedule</h1>
          <p className="spms-meetings__subtitle">Schedule and manage project milestone meetings and reviews.</p>
        </div>
        
        <div className="spms-meetings__header-actions">
          <div className="spms-meetings__search-wrapper">
            <Search size={18} className="spms-meetings__search-icon" />
            <input 
              type="text" 
              placeholder="Search by group, staff, or location..." 
              className="spms-meetings__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Schedule Meeting
          </button>
        </div>
      </header>

      <div className="spms-meetings__layout">
        
        {/* Right Column: Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-meetings__card spms-meetings__card--full"
        >
          <div className="spms-meetings__card-body spms-meetings__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-meetings__skeleton-row"></div>
                ))}
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="spms-meetings__empty">
                <div className="spms-meetings__empty-icon">
                  <Calendar size={24} />
                </div>
                <h3 className="spms-meetings__empty-title">
                  {searchQuery ? "No Matches Found" : "No Meetings Scheduled"}
                </h3>
                <p className="spms-meetings__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Schedule your first project meeting using the form."}
                </p>
              </div>
            ) : (
              <div className="spms-meetings__table-wrapper">
                <table className="spms-meetings__table">
                  <thead>
                    <tr>
                      <th>Group & Guide</th>
                      <th>Date & Time</th>
                      <th>Location & Agenda</th>
                      <th>Status</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredMeetings.map((m) => {
                        const isUpcoming = new Date(m.MeetingDateTime) > new Date();
                        
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
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Guide: {getStaffName(m.GuideStaffID)}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500, color: '#334155' }}>
                              {renderUIDate(m.MeetingDateTime)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span>{m.MeetingLocation || '-'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.Description || 'No agenda'}</span>
                              </div>
                            </td>
                            <td>
                              {isUpcoming ? (
                                <span className="spms-meetings__badge spms-meetings__badge--upcoming">Upcoming</span>
                              ) : (
                                <span className="spms-meetings__badge spms-meetings__badge--past">Past</span>
                              )}
                            </td>
                            <td>
                              <div className="spms-meetings__table-actions">
                                <button 
                                  type="button"
                                  className="spms-meetings__icon-btn spms-meetings__icon-btn--edit" 
                                  onClick={() => handleEdit(m)}
                                  title="Edit Meeting"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  type="button"
                                  className="spms-meetings__icon-btn spms-meetings__icon-btn--delete" 
                                  onClick={() => confirmDelete(m.ProjectMeetingID)}
                                  title="Cancel Meeting"
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
        title={editingId ? "Reschedule Meeting" : "Schedule New Meeting"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-meetings__form-group">
              <label className="spms-meetings__label">Project Group *</label>
              <select
                name="projectgroupid"
                value={form.projectgroupid}
                onChange={handleChange}
                className="spms-meetings__select"
                required
              >
                <option value="">-- Select Group --</option>
                {projectGroups.map(g => (
                  <option key={g.ProjectGroupID} value={g.ProjectGroupID}>
                    {g.ProjectGroupName}
                  </option>
                ))}
              </select>
            </div>
            <div className="spms-meetings__form-group">
              <label className="spms-meetings__label">Guide Faculty *</label>
              <select
                name="guidestaffid"
                value={form.guidestaffid}
                onChange={handleChange}
                className="spms-meetings__select"
                required
              >
                <option value="">-- Select Staff --</option>
                {staffList.map(s => (
                  <option key={s.StaffID} value={s.StaffID}>
                    {s.StaffName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-meetings__form-group">
              <label className="spms-meetings__label">Date & Time *</label>
              <input
                type="datetime-local"
                name="meetingdatetime"
                value={form.meetingdatetime}
                onChange={handleChange}
                className="spms-meetings__input"
                required
              />
            </div>
            <div className="spms-meetings__form-group">
              <label className="spms-meetings__label">Meeting Location</label>
              <input
                name="meetinglocation"
                value={form.meetinglocation}
                onChange={handleChange}
                placeholder="e.g. Room 402, Main Block"
                className="spms-meetings__input"
              />
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-meetings__form-group" style={{ flex: '1' }}>
              <label className="spms-meetings__label">Meeting Agenda / Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief agenda of the meeting"
                className="spms-meetings__input"
              />
            </div>
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingId ? "Update" : "Schedule"}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Meeting"
        itemName={meetings.find(m => m.ProjectMeetingID === deleteModal.id)?.ProjectTitle || "this meeting"}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-meetings__toast spms-meetings__toast--${toast.type}`}
          >
            <div className="spms-meetings__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-meetings__toast-content">
              <h4 className="spms-meetings__toast-title">{toast.title}</h4>
              <p className="spms-meetings__toast-message">{toast.message}</p>
            </div>
            <button className="spms-meetings__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
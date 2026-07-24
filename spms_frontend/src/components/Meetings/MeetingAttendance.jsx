import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Plus, Save, AlertTriangle 
} from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./MeetingAttendance.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { getStudentDisplayName } from "../../utils/nameHelper";

export default function MeetingAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    ProjectMeetingID: "",
    StudentID: "",
    IsPresent: 1, // 1 = Present, 0 = Absent
    AttendanceRemarks: "",
    Description: "",
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
      const [attendanceRes, meetingsRes, studentsRes] = await Promise.all([
        api.get("/project-meeting-attendance"),
        api.get("/meetings"),
        api.get("/students")
      ]);
      
      setAttendance(attendanceRes.data.data || attendanceRes.data || []);
      setMeetings(meetingsRes.data.data || meetingsRes.data || []);
      setStudents(studentsRes.data.data || studentsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("error", "Data Error", "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/project-meeting-attendance");
      setAttendance(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.name === "IsPresent" ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ProjectMeetingID || !form.StudentID) {
      showToast("error", "Validation Error", "Please select both a meeting and a student.");
      return;
    }

    try {
      if (editingId) {
        await api.patch(`/project-meeting-attendance/${editingId}`, form);
        showToast("success", "Record Updated", "The attendance record was updated.");
      } else {
        await api.post("/project-meeting-attendance", form);
        showToast("success", "Attendance Logged", "The student's attendance has been recorded.");
      }

      setForm({ ProjectMeetingID: "", StudentID: "", IsPresent: 1, AttendanceRemarks: "", Description: "" });
      setEditingId(null);
      setIsModalOpen(false);
      fetchAttendance();
    } catch (err) {
      console.error("Submit Error:", err);
      showToast("error", "Submission Error", "Failed to save the attendance record.");
    }
  };

  const handleEdit = (record) => {
    setForm({
      ProjectMeetingID: record.ProjectMeetingID || "",
      StudentID: record.StudentID || "",
      IsPresent: record.IsPresent ? 1 : 0,
      AttendanceRemarks: record.AttendanceRemarks || "",
      Description: record.Description || "",
    });
    setEditingId(record.ProjectMeetingAttendanceID);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/project-meeting-attendance/${deleteModal.id}`);
      showToast("success", "Record Deleted", "The attendance record was permanently removed.");
      
      if (editingId === deleteModal.id) {
        setEditingId(null);
        setForm({ ProjectMeetingID: "", StudentID: "", IsPresent: 1, AttendanceRemarks: "", Description: "" });
        setIsModalOpen(false);
      }
      fetchAttendance();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("error", "Deletion Error", "Failed to delete the attendance record.");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ ProjectMeetingID: "", StudentID: "", IsPresent: 1, AttendanceRemarks: "", Description: "" });
    setIsModalOpen(false);
  };

  // Helper functions
  const getStudentName = (id) => getStudentDisplayName(students.find(s => s.StudentID === id));
  
  const renderMeetingLabel = (id) => {
    const meeting = meetings.find(m => m.ProjectMeetingID === id);
    if (!meeting) return "Unknown Meeting";
    
    // Attempt to format date nicely for dropdown
    const dateStr = meeting.MeetingDateTime 
      ? new Date(meeting.MeetingDateTime).toLocaleDateString()
      : "No Date";
      
    return `${dateStr} - ${meeting.MeetingPurpose || "General Meeting"}`;
  };

  // Filter based on search query
  const filteredAttendance = attendance.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const studentName = getStudentName(a.StudentID).toLowerCase();
    const meetingLabel = renderMeetingLabel(a.ProjectMeetingID).toLowerCase();
    const remarks = (a.AttendanceRemarks || "").toLowerCase();
    
    return studentName.includes(q) || meetingLabel.includes(q) || remarks.includes(q);
  });

  return (
    <div className="spms-attendance">
      <header className="spms-attendance__header">
        <div className="spms-attendance__title-group">
          <h1 className="spms-attendance__title">Meeting Attendance</h1>
          <p className="spms-attendance__subtitle">Log and track student participation in scheduled project meetings.</p>
        </div>
        
        <div className="spms-attendance__header-actions">
          <div className="spms-attendance__search-wrapper">
            <Search size={18} className="spms-attendance__search-icon" />
            <input 
              type="text" 
              placeholder="Search by student or remarks..." 
              className="spms-attendance__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Log Attendance
          </button>
        </div>
      </header>

      <div className="spms-attendance__layout">
        
        {/* Right Column: Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-attendance__card spms-attendance__card--full"
        >
          <div className="spms-attendance__card-body spms-attendance__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-attendance__skeleton-row"></div>
                ))}
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="spms-attendance__empty">
                <div className="spms-attendance__empty-icon">
                  <ClipboardCheck size={24} />
                </div>
                <h3 className="spms-attendance__empty-title">
                  {searchQuery ? "No Matches Found" : "No Attendance Recorded"}
                </h3>
                <p className="spms-attendance__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Select a meeting and student to log the first record."}
                </p>
              </div>
            ) : (
              <div className="spms-attendance__table-wrapper">
                <table className="spms-attendance__table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Meeting</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredAttendance.map((a) => {
                        const isPresent = a.IsPresent === 1 || a.IsPresent === true;

                        return (
                          <motion.tr 
                            key={a.ProjectMeetingAttendanceID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>
                              {getStudentName(a.StudentID)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 500, color: '#334155' }}>
                                  {renderMeetingLabel(a.ProjectMeetingID)}
                                </span>
                              </div>
                            </td>
                            <td>
                              {isPresent ? (
                                <span className="spms-attendance__badge spms-attendance__badge--present">Present</span>
                              ) : (
                                <span className="spms-attendance__badge spms-attendance__badge--absent">Absent</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span>{a.AttendanceRemarks || '-'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                  {a.Description}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="spms-attendance__table-actions">
                                <button 
                                  type="button"
                                  className="spms-attendance__icon-btn spms-attendance__icon-btn--edit" 
                                  onClick={() => handleEdit(a)}
                                  title="Edit Record"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  type="button"
                                  className="spms-attendance__icon-btn spms-attendance__icon-btn--delete" 
                                  onClick={() => confirmDelete(a.ProjectMeetingAttendanceID)}
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
        title={editingId ? "Edit Record" : "Log Attendance"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-attendance__form-group">
              <label className="spms-attendance__label">Target Meeting *</label>
              <select
                name="ProjectMeetingID"
                value={form.ProjectMeetingID}
                onChange={handleChange}
                className="spms-attendance__select"
                required
              >
                <option value="">-- Select Meeting --</option>
                {meetings.map(m => (
                  <option key={m.ProjectMeetingID} value={m.ProjectMeetingID}>
                    {renderMeetingLabel(m.ProjectMeetingID)}
                  </option>
                ))}
              </select>
            </div>
            <div className="spms-attendance__form-group">
              <label className="spms-attendance__label">Student *</label>
              <select
                name="StudentID"
                value={form.StudentID}
                onChange={handleChange}
                className="spms-attendance__select"
                required
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.StudentID} value={s.StudentID}>
                    {getStudentDisplayName(s)} ({s.RollNo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-attendance__form-group">
              <label className="spms-attendance__label">Attendance Status</label>
              <select
                name="IsPresent"
                value={form.IsPresent}
                onChange={handleChange}
                className="spms-attendance__select"
              >
                <option value={1}>Present</option>
                <option value={0}>Absent</option>
              </select>
            </div>
            <div className="spms-attendance__form-group">
              <label className="spms-attendance__label">Remarks (Optional)</label>
              <input
                name="AttendanceRemarks"
                value={form.AttendanceRemarks}
                onChange={handleChange}
                placeholder="e.g. Arrived late"
                className="spms-attendance__input"
              />
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-attendance__form-group" style={{ flex: '1' }}>
              <label className="spms-attendance__label">Description</label>
              <input
                name="Description"
                value={form.Description}
                onChange={handleChange}
                placeholder="Additional context"
                className="spms-attendance__input"
              />
            </div>
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingId ? "Update" : "Log"} Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="spms-attendance__modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="spms-attendance__modal"
            >
              <div className="spms-attendance__modal-header">
                <div className="spms-attendance__modal-icon">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="spms-attendance__modal-title">Delete Attendance Record</h3>
              </div>
              <div className="spms-attendance__modal-body">
                Are you sure you want to remove this attendance log? 
                This action is permanent and cannot be undone.
              </div>
              <div className="spms-attendance__modal-footer">
                <button 
                  className="spms-attendance__modal-btn spms-attendance__modal-btn--cancel"
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                >
                  Cancel
                </button>
                <button 
                  className="spms-attendance__modal-btn spms-attendance__modal-btn--confirm"
                  onClick={handleDelete}
                >
                  Yes, Delete Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-attendance__toast spms-attendance__toast--${toast.type}`}
          >
            <div className="spms-attendance__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-attendance__toast-content">
              <h4 className="spms-attendance__toast-title">{toast.title}</h4>
              <p className="spms-attendance__toast-message">{toast.message}</p>
            </div>
            <button className="spms-attendance__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
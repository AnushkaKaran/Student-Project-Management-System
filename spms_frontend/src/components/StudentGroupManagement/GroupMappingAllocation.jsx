import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Plus, Save, AlertTriangle, UserPlus 
} from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./GroupMappingAllocation.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { getStudentDisplayName } from "../../utils/nameHelper";

export default function GroupMappingAllocation() {
  const [projectGroups, setProjectGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    ProjectGroupID: "",
    StudentID: "",
    IsGroupLeader: 0,
    Description: ""
  });
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null });

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
      // Fetch concurrently for performance
      const [groupsRes, studentsRes, membersRes] = await Promise.all([
        api.get("/groups"),
        api.get("/students"),
        api.get("/project-group-members")
      ]);
      
      setProjectGroups(groupsRes.data.data || groupsRes.data || []);
      setStudents(studentsRes.data.data || studentsRes.data || []);
      setGroupMembers(membersRes.data.data || membersRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("error", "Data Error", "Failed to load mapping data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const res = await api.get("/project-group-members");
      setGroupMembers(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching group members:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "IsGroupLeader" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ProjectGroupID || !form.StudentID) {
      showToast("error", "Validation Error", "Please select both a Project Group and a Student.");
      return;
    }

    try {
      if (editingIndex !== null) {
        // Updating existing mapping
        const memberToUpdate = groupMembers[editingIndex];
        await api.patch(`/project-group-members/${memberToUpdate.ProjectGroupMemberID}`, form);
        showToast("success", "Mapping Updated", "The group member was updated successfully.");
      } else {
        // Creating new mapping
        await api.post("/project-group-members", form);
        showToast("success", "Member Added", "Student successfully allocated to the group.");
      }

      fetchGroupMembers(); // Refresh just the members table to save bandwidth
      handleCancel();
    } catch (err) {
      console.error("Submit error:", err);
      showToast("error", "Submission Error", "Failed to save the mapping record.");
    }
  };

  const handleEdit = (index) => {
    const member = groupMembers[index];
    setForm({
      ProjectGroupMemberID: member.ProjectGroupMemberID, // Read-only for PATCH path
      ProjectGroupID: member.ProjectGroupID || "",
      StudentID: member.StudentID || "",
      IsGroupLeader: member.IsGroupLeader ? 1 : 0,
      Description: member.Description || ""
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const confirmDelete = (index) => {
    setDeleteModal({ isOpen: true, index });
  };

  const handleDelete = async () => {
    if (deleteModal.index === null) return;
    
    try {
      const memberToDelete = groupMembers[deleteModal.index];
      await api.delete(`/project-group-members/${memberToDelete.ProjectGroupMemberID}`);
      showToast("success", "Member Removed", "The student was removed from the project group.");
      
      if (editingIndex === deleteModal.index) handleCancel();
      fetchGroupMembers();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("error", "Deletion Error", "Failed to delete the mapping record.");
    } finally {
      setDeleteModal({ isOpen: false, index: null });
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setForm({
      ProjectGroupID: "",
      StudentID: "",
      IsGroupLeader: 0,
      Description: ""
    });
    setIsModalOpen(false);
  };

  // Helper functions for joining data visually
  const getGroupName = (id) => projectGroups.find(g => g.ProjectGroupID === id)?.ProjectGroupName || "Unknown Group";
  const getStudentName = (id) => getStudentDisplayName(students.find(s => s.StudentID === id));
  const getGuideName = (id) => projectGroups.find(g => g.ProjectGroupID === id)?.GuideStaffName || "No Guide";

  // Filter members based on search query (Student Name or Group Name)
  const filteredMembers = groupMembers.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const groupName = getGroupName(m.ProjectGroupID).toLowerCase();
    const studentName = getStudentName(m.StudentID).toLowerCase();
    
    return groupName.includes(q) || studentName.includes(q);
  });

  return (
    <div className="spms-mapping">
      <header className="spms-mapping__header">
        <div className="spms-mapping__title-group">
          <h1 className="spms-mapping__title">Group Member Allocation</h1>
          <p className="spms-mapping__subtitle">Map students to project groups and designate group leaders.</p>
        </div>
        
        <div className="spms-mapping__header-actions">
          <div className="spms-mapping__search-wrapper">
            <Search size={18} className="spms-mapping__search-icon" />
            <input 
              type="text" 
              placeholder="Search by student or group name..." 
              className="spms-mapping__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Allocate Member
          </button>
        </div>
      </header>

      <div className="spms-mapping__layout">
        
        {/* Right Column: Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-mapping__card spms-mapping__card--full"
        >
          <div className="spms-mapping__card-body spms-mapping__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-mapping__skeleton-row"></div>
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="spms-mapping__empty">
                <div className="spms-mapping__empty-icon">
                  <Users size={24} />
                </div>
                <h3 className="spms-mapping__empty-title">
                  {searchQuery ? "No Matches Found" : "No Allocations Found"}
                </h3>
                <p className="spms-mapping__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Allocate your first student to a project group."}
                </p>
              </div>
            ) : (
              <div className="spms-mapping__table-wrapper">
                <table className="spms-mapping__table">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Student</th>
                      <th>Role</th>
                      <th>Faculty Guide</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredMembers.map((m) => {
                        const originalIndex = groupMembers.findIndex(gm => gm.ProjectGroupMemberID === m.ProjectGroupMemberID);
                        const isLeader = m.IsGroupLeader === 1 || m.IsGroupLeader === true;
                        
                        return (
                          <motion.tr 
                            key={m.ProjectGroupMemberID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{getGroupName(m.ProjectGroupID)}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.Description || 'No description'}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500, color: '#334155' }}>
                              {getStudentName(m.StudentID)}
                            </td>
                            <td>
                              {isLeader ? (
                                <span className="spms-mapping__badge spms-mapping__badge--leader">Leader</span>
                              ) : (
                                <span className="spms-mapping__badge spms-mapping__badge--member">Member</span>
                              )}
                            </td>
                            <td style={{ color: '#64748b' }}>
                              {getGuideName(m.ProjectGroupID)}
                            </td>
                            <td>
                              <div className="spms-mapping__table-actions">
                                <button 
                                  type="button"
                                  className="spms-mapping__icon-btn spms-mapping__icon-btn--edit" 
                                  onClick={() => handleEdit(originalIndex)}
                                  title="Edit Allocation"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  type="button"
                                  className="spms-mapping__icon-btn spms-mapping__icon-btn--delete" 
                                  onClick={() => confirmDelete(originalIndex)}
                                  title="Remove Member"
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
        title={editingIndex !== null ? "Edit Allocation" : "Allocate Member"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-mapping__form-group">
              <label className="spms-mapping__label">Project Group *</label>
              <select 
                name="ProjectGroupID" 
                value={form.ProjectGroupID} 
                onChange={handleChange}
                className="spms-mapping__select"
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
            <div className="spms-mapping__form-group">
              <label className="spms-mapping__label">Student *</label>
              <select 
                name="StudentID" 
                value={form.StudentID} 
                onChange={handleChange}
                className="spms-mapping__select"
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
            <div className="spms-mapping__form-group">
              <label className="spms-mapping__label">Group Role</label>
              <select 
                name="IsGroupLeader" 
                value={form.IsGroupLeader} 
                onChange={handleChange}
                className="spms-mapping__select"
              >
                <option value={0}>Standard Member</option>
                <option value={1}>Group Leader</option>
              </select>
            </div>
            <div className="spms-mapping__form-group">
              <label className="spms-mapping__label">Allocation Description</label>
              <input
                name="Description"
                value={form.Description}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                className="spms-mapping__input"
              />
            </div>
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingIndex !== null ? "Update" : "Allocate"} Member
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Group Member Allocation"
        itemName={getStudentName(groupMembers[deleteModal.index]?.StudentID)}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-mapping__toast spms-mapping__toast--${toast.type}`}
          >
            <div className="spms-mapping__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-mapping__toast-content">
              <h4 className="spms-mapping__toast-title">{toast.title}</h4>
              <p className="spms-mapping__toast-message">{toast.message}</p>
            </div>
            <button className="spms-mapping__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
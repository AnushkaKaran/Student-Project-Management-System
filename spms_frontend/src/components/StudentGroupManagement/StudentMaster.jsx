import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Plus, Save, AlertTriangle, UserPlus, Lock 
} from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./StudentMaster.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { getStudentDisplayName } from "../../utils/nameHelper";

export default function StudentMaster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({ 
    StudentName: "", 
    RollNo: "", 
    Email: "", 
    Password: "student123",
    Phone: "", 
    Description: "", 
    active: true 
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null });

  useEffect(() => {
    fetchStudents();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students");
      setStudents(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      showToast("error", "Data Error", "Failed to load student directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.StudentName?.trim() || !form.RollNo?.trim() || !form.Email?.trim()) {
      showToast("error", "Validation Error", "Please fill all required fields before submitting.");
      return;
    }

    try {
      if (editingIndex !== null) {
        const studentToUpdate = students[editingIndex];
        await api.put(`/students/${studentToUpdate.StudentID}`, form);
        showToast("success", "Student Updated", "The student record was updated successfully.");
      } else {
        await api.post("/students", form);
        showToast("success", "Student Added", "A new student was added to the directory.");
      }

      fetchStudents();
      handleCancel();
    } catch (err) {
      console.error("Failed to save student", err);
      showToast("error", "Submission Error", "Failed to save the student record.");
    }
  };

  const handleEdit = (index) => {
    const s = students[index];
    setForm({
      StudentName: s.StudentName || "",
      RollNo: s.RollNo || "",
      Email: s.Email || "",
      Phone: s.Phone || "",
      Description: s.Description || "",
      Password: "student123",
      active: s.active !== false
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
      const studentToDelete = students[deleteModal.index];
      await api.delete(`/students/${studentToDelete.StudentID}`);
      showToast("success", "Student Deleted", "The student record was removed permanently.");
      
      if (editingIndex === deleteModal.index) handleCancel();
      fetchStudents();
    } catch (err) {
      console.error("Failed to delete student", err);
      showToast("error", "Deletion Error", "Failed to delete the student.");
    } finally {
      setDeleteModal({ isOpen: false, index: null });
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setForm({
      StudentName: "",
      RollNo: "",
      Email: "",
      Password: "student123",
      Phone: "",
      Description: "",
      active: true
    });
    setIsModalOpen(false);
  };

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.StudentName && s.StudentName.toLowerCase().includes(q)) ||
      (s.RollNo && s.RollNo.toLowerCase().includes(q)) ||
      (s.Email && s.Email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="spms-students">
      <header className="spms-students__header">
        <div className="spms-students__title-group">
          <h1 className="spms-students__title">Student Directory</h1>
          <p className="spms-students__subtitle">Manage student accounts, enrollment details, and system access.</p>
        </div>
        
        <div className="spms-students__header-actions">
          <div className="spms-students__search-wrapper">
            <Search size={18} className="spms-students__search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, roll no, or email..." 
              className="spms-students__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Student
          </button>
        </div>
      </header>

      <div className="spms-students__layout">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-students__card spms-students__card--full"
        >
          <div className="spms-students__card-body spms-students__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-students__skeleton-row"></div>
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="spms-students__empty">
                <div className="spms-students__empty-icon">
                  <Users size={24} />
                </div>
                <h3 className="spms-students__empty-title">
                  {searchQuery ? "No Matches Found" : "No Students Found"}
                </h3>
                <p className="spms-students__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Register your first student using the form."}
                </p>
              </div>
            ) : (
              <div className="spms-students__table-wrapper">
                <table className="spms-students__table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll No</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredStudents.map((s, idx) => {
                        return (
                          <motion.tr 
                            key={s.StudentID || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{getStudentDisplayName(s)}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.Email}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500, color: '#334155' }}>
                              {s.RollNo}
                            </td>
                            <td style={{ color: '#64748b' }}>
                              {s.Phone || '-'}
                            </td>
                            <td>
                              <span className="spms-students__badge spms-students__badge--active">Active</span>
                            </td>
                            <td>
                              <div className="spms-students__table-actions">
                                <button 
                                  type="button"
                                  className="spms-students__icon-btn spms-students__icon-btn--edit" 
                                  onClick={() => handleEdit(idx)}
                                  title="Edit Student"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  type="button"
                                  className="spms-students__icon-btn spms-students__icon-btn--delete" 
                                  onClick={() => confirmDelete(idx)}
                                  title="Delete Student"
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
        title={editingIndex !== null ? "Edit Student" : "Add New Student"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-students__form-group">
              <label className="spms-students__label">Full Name *</label>
              <input
                name="StudentName"
                value={form.StudentName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="spms-students__input"
                required
              />
            </div>
            <div className="spms-students__form-group">
              <label className="spms-students__label">Email Address *</label>
              <input
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="spms-students__input"
                required
              />
            </div>
          </div>
          <div className="spms-modal__form-row">
            <div className="spms-students__form-group">
              <label className="spms-students__label">Roll Number *</label>
              <input
                name="RollNo"
                value={form.RollNo}
                onChange={handleChange}
                placeholder="e.g. CS2024-001"
                className="spms-students__input"
                required
              />
            </div>
            <div className="spms-students__form-group">
              <label className="spms-students__label">Phone Number</label>
              <input
                name="Phone"
                value={form.Phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className="spms-students__input"
              />
            </div>
          </div>
          {!editingIndex && (
            <div className="spms-students__form-group">
              <label className="spms-students__label">Password *</label>
              <input
                type="password"
                name="Password"
                value={form.Password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="spms-students__input"
                required
              />
            </div>
          )}
          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingIndex !== null ? "Update" : "Save"} Student
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Student"
        itemName={students[deleteModal.index]?.StudentName}
      />

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-students__toast spms-students__toast--${toast.type}`}
          >
            <div className="spms-students__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-students__toast-content">
              <h4 className="spms-students__toast-title">{toast.title}</h4>
              <p className="spms-students__toast-message">{toast.message}</p>
            </div>
            <button className="spms-students__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
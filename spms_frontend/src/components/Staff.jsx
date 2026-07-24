import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Plus, Save, AlertTriangle 
} from "lucide-react";
import api from "../api/axios";
import Modal from "./Modal";
import "./Staff.css";
import DeleteConfirmModal from "./common/DeleteConfirmModal";

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    StaffID: "",
    StaffName: "",
    Phone: "",
    Email: "",
    Password: "",
    Description: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null });

  useEffect(() => {
    fetchStaff();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get("/master/staff");
      setStaffList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      showToast("error", "Data Error", "Failed to load staff directory.");
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

    if (!form.StaffName?.trim() || !form.Password?.trim()) {
      showToast("error", "Validation Error", "Please provide at least a Staff Name and Password.");
      return;
    }

    try {
      if (editingIndex !== null) {
        await api.patch(`/master/staff/${form.StaffID}`, form);
        showToast("success", "Staff Updated", "The staff record was updated successfully.");
      } else {
        await api.post("/master/staff", form);
        showToast("success", "Staff Added", "A new staff member was added.");
      }

      fetchStaff();
      handleCancel();
    } catch (err) {
      console.error("Submit error:", err);
      showToast("error", "Submission Error", "Failed to save the staff record.");
    }
  };

  const handleEdit = (index) => {
    const staff = staffList[index];
    setForm({
      StaffID: staff.StaffID || "",
      StaffName: staff.StaffName || "",
      Phone: staff.Phone || "",
      Email: staff.Email || "",
      Password: staff.Password || "",
      Description: staff.Description || "",
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
      const staffToDelete = staffList[deleteModal.index];
      await api.delete(`/master/staff/${staffToDelete.StaffID}`);
      showToast("success", "Staff Deleted", "The staff record was removed permanently.");
      
      if (editingIndex === deleteModal.index) handleCancel();
      fetchStaff();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("error", "Deletion Error", "Failed to delete the staff member.");
    } finally {
      setDeleteModal({ isOpen: false, index: null });
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setForm({
      StaffID: "",
      StaffName: "",
      Phone: "",
      Email: "",
      Password: "",
      Description: "",
    });
    setIsModalOpen(false);
  };

  const filteredStaff = staffList.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.StaffName && s.StaffName.toLowerCase().includes(q)) ||
      (s.Email && s.Email.toLowerCase().includes(q)) ||
      (String(s.StaffID).toLowerCase().includes(q))
    );
  });

  return (
    <div className="spms-staff">
      <header className="spms-staff__header">
        <div className="spms-staff__title-group">
          <h1 className="spms-staff__title">Faculty & Staff</h1>
          <p className="spms-staff__subtitle">Manage university faculty, admin roles, and system credentials.</p>
        </div>
        
        <div className="spms-staff__header-actions">
          <div className="spms-staff__search-wrapper">
            <Search size={18} className="spms-staff__search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              className="spms-staff__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </header>

      <div className="spms-staff__layout">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-staff__card spms-staff__card--full"
        >
          <div className="spms-staff__card-body spms-staff__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-staff__skeleton-row"></div>
                ))}
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="spms-staff__empty">
                <div className="spms-staff__empty-icon">
                  <Briefcase size={24} />
                </div>
                <h3 className="spms-staff__empty-title">
                  {searchQuery ? "No Matches Found" : "No Staff Found"}
                </h3>
                <p className="spms-staff__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Register your first staff member using the form."}
                </p>
              </div>
            ) : (
              <div className="spms-staff__table-wrapper">
                <table className="spms-staff__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Contact Info</th>
                      <th>Password</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredStaff.map((staff, index) => (
                        <motion.tr 
                          key={staff.StaffID || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            #{staff.StaffID}
                          </td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>
                            {staff.StaffName}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ color: '#334155' }}>{staff.Email}</span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{staff.Phone || '-'}</span>
                            </div>
                          </td>
                          <td style={{ color: '#64748b' }}>
                            {staff.Password ? '********' : <span style={{ color: '#ef4444' }}>Not Set</span>}
                          </td>
                          <td>
                            <div className="spms-staff__table-actions">
                              <button 
                                type="button"
                                className="spms-staff__icon-btn spms-staff__icon-btn--edit" 
                                onClick={() => handleEdit(index)}
                                title="Edit Staff"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                type="button"
                                className="spms-staff__icon-btn spms-staff__icon-btn--delete" 
                                onClick={() => confirmDelete(index)}
                                title="Delete Staff"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
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
        title={editingIndex !== null ? "Edit Staff" : "Add New Staff"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-staff__form-group">
              <label className="spms-staff__label">Full Name *</label>
              <input
                name="StaffName"
                value={form.StaffName}
                onChange={handleChange}
                placeholder="e.g. Dr. Jane Smith"
                className="spms-staff__input"
                required
              />
            </div>
            <div className="spms-staff__form-group">
              <label className="spms-staff__label">Email Address *</label>
              <input
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="spms-staff__input"
                required
              />
            </div>
          </div>
          
          <div className="spms-modal__form-row">
            <div className="spms-staff__form-group">
              <label className="spms-staff__label">Phone Number</label>
              <input
                name="Phone"
                value={form.Phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className="spms-staff__input"
              />
            </div>
            {!editingIndex && (
              <div className="spms-staff__form-group">
                <label className="spms-staff__label">Password *</label>
                <input
                  type="password"
                  name="Password"
                  value={form.Password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="spms-staff__input"
                  required
                />
              </div>
            )}
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingIndex !== null ? "Update" : "Save"} Staff
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Staff Member"
        itemName={staffList[deleteModal.index]?.StaffName}
      />

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-staff__toast spms-staff__toast--${toast.type}`}
          >
            <div className="spms-staff__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-staff__toast-content">
              <h4 className="spms-staff__toast-title">{toast.title}</h4>
              <p className="spms-staff__toast-message">{toast.message}</p>
            </div>
            <button className="spms-staff__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

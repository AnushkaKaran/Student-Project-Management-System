import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderTree, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Plus, Save, AlertTriangle 
} from "lucide-react";
import api from "../api/axios";
import Modal from "./Modal";
import "./ProjectType.css";
import DeleteConfirmModal from "./common/DeleteConfirmModal";

export default function ProjectType() {
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    ProjectTypeName: "",
    Description: ""
  });
  
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProjectTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/master/project-types");
      setProjectTypes(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching project types:", err);
      showToast("error", "Data Error", "Failed to load project types from the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ProjectTypeName.trim()) {
      showToast("error", "Validation Error", "Project Type Name is required.");
      return;
    }

    try {
      if (editingId) {
        await api.patch(`/master/project-types/${editingId}`, form);
        showToast("success", "Type Updated", "The project type was successfully updated.");
      } else {
        await api.post("/master/project-types", form);
        showToast("success", "Type Added", "A new project type has been created.");
      }

      setForm({ ProjectTypeName: "", Description: "" });
      setEditingId(null);
      setIsModalOpen(false);
      fetchProjectTypes();
    } catch (err) {
      console.error("Submit Error:", err);
      showToast("error", "Submission Error", "Failed to save the project type.");
    }
  };

  const handleEdit = (type) => {
    setForm({
      ProjectTypeName: type.ProjectTypeName || "",
      Description: type.Description || "",
    });
    setEditingId(type.ProjectTypeID);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/master/project-types/${deleteModal.id}`);
      showToast("success", "Type Deleted", "The project type was permanently removed.");
      
      if (editingId === deleteModal.id) {
        setEditingId(null);
        setForm({ ProjectTypeName: "", Description: "" });
        setIsModalOpen(false);
      }
      fetchProjectTypes();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("error", "Deletion Error", "Cannot delete this project type as it may be linked to existing projects.");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ ProjectTypeName: "", Description: "" });
    setIsModalOpen(false);
  };

  // Filter based on search query
  const filteredTypes = projectTypes.filter(pt => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (pt.ProjectTypeName || "").toLowerCase().includes(q) || 
      (pt.Description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="spms-projtype">
      <header className="spms-projtype__header">
        <div className="spms-projtype__title-group">
          <h1 className="spms-projtype__title">Project Type Setup</h1>
          <p className="spms-projtype__subtitle">Define and manage categories of student projects.</p>
        </div>
        
        <div className="spms-projtype__header-actions">
          <div className="spms-projtype__search-wrapper">
            <Search size={18} className="spms-projtype__search-icon" />
            <input 
              type="text" 
              placeholder="Search project types..." 
              className="spms-projtype__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </header>

      <div className="spms-projtype__layout">
        
        {/* Right Column: Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-projtype__card spms-projtype__card--full"
        >
          <div className="spms-projtype__card-body spms-projtype__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-projtype__skeleton-row"></div>
                ))}
              </div>
            ) : filteredTypes.length === 0 ? (
              <div className="spms-projtype__empty">
                <div className="spms-projtype__empty-icon">
                  <FolderTree size={24} />
                </div>
                <h3 className="spms-projtype__empty-title">
                  {searchQuery ? "No Matches Found" : "No Project Types"}
                </h3>
                <p className="spms-projtype__empty-subtitle">
                  {searchQuery ? "Try adjusting your search query." : "Use the form to define your first project type."}
                </p>
              </div>
            ) : (
              <div className="spms-projtype__table-wrapper">
                <table className="spms-projtype__table">
                  <thead>
                    <tr>
                      <th>Type Label</th>
                      <th>Description</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredTypes.map((pt) => (
                        <motion.tr 
                          key={pt.ProjectTypeID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>
                            {pt.ProjectTypeName}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                              {pt.Description || '-'}
                            </span>
                          </td>
                          <td>
                            <div className="spms-projtype__table-actions">
                              <button 
                                type="button"
                                className="spms-projtype__icon-btn spms-projtype__icon-btn--edit" 
                                onClick={() => handleEdit(pt)}
                                title="Edit Type"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                type="button"
                                className="spms-projtype__icon-btn spms-projtype__icon-btn--delete" 
                                onClick={() => confirmDelete(pt.ProjectTypeID)}
                                title="Delete Type"
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
        title={editingId ? "Edit Project Type" : "Add Project Type"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-projtype__form-group" style={{ flex: '1' }}>
              <label className="spms-projtype__label">Type Name *</label>
              <input
                name="ProjectTypeName"
                value={form.ProjectTypeName}
                onChange={handleChange}
                placeholder="e.g. Research, Web App"
                className="spms-projtype__input"
                required
              />
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-projtype__form-group" style={{ flex: '1' }}>
              <label className="spms-projtype__label">Description</label>
              <textarea
                name="Description"
                value={form.Description}
                onChange={handleChange}
                placeholder="Provide context for this project type..."
                className="spms-projtype__textarea"
              />
            </div>
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingId ? "Update" : "Save"} Category
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Project Type"
        itemName={projectTypes.find(pt => pt.ProjectTypeID === deleteModal.id)?.ProjectTypeName || "this project type"}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-projtype__toast spms-projtype__toast--${toast.type}`}
          >
            <div className="spms-projtype__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-projtype__toast-content">
              <h4 className="spms-projtype__toast-title">{toast.title}</h4>
              <p className="spms-projtype__toast-message">{toast.message}</p>
            </div>
            <button className="spms-projtype__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
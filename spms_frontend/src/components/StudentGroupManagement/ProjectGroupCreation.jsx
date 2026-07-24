import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Pencil, Trash2, CheckCircle, AlertCircle, X, Plus, Save, AlertTriangle, Search } from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./ProjectGroupCreation.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

export default function ProjectGroupCreation() {
  const [groups, setGroups] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    ProjectGroupName: "",
    ProjectTypeID: "",
    ProjectTitle: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null });
  
  // Custom Toast State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchProjectTypes();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      showToast("error", "Data Error", "Failed to load project groups.");
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const res = await api.get("/master/project-types");
      setProjectTypes(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch project types:", err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ProjectGroupName.trim()) {
      showToast("error", "Validation Error", "Group Name is required.");
      return;
    }

    try {
      if (editingIndex !== null) {
        const groupToUpdate = groups[editingIndex];
        await api.patch(`/groups/${groupToUpdate.ProjectGroupID}`, form);
        showToast("success", "Group Updated", "The project group has been updated successfully.");
      } else {
        await api.post("/groups", form);
        showToast("success", "Group Created", "A new project group has been created.");
      }

      fetchGroups();
      handleCancel();
    } catch (err) {
      console.error("Failed to save group", err);
      showToast("error", "Submission Error", "Failed to save the Project Group.");
    }
  };

  const handleEdit = (index) => {
    setForm({
      ProjectGroupName: groups[index].ProjectGroupName || "",
      ProjectTypeID: groups[index].ProjectTypeID || "",
      ProjectTitle: groups[index].ProjectTitle || "",
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
      const groupToDelete = groups[deleteModal.index];
      await api.delete(`/groups/${groupToDelete.ProjectGroupID}`);
      fetchGroups();
      showToast("success", "Group Deleted", "The project group was removed.");
      if (editingIndex === deleteModal.index) handleCancel();
    } catch (err) {
      console.error("Failed to delete group", err);
      showToast("error", "Deletion Error", "Failed to delete the Project Group.");
    } finally {
      setDeleteModal({ isOpen: false, index: null });
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setForm({
      ProjectGroupName: "",
      ProjectTypeID: "",
      ProjectTitle: "",
    });
    setIsModalOpen(false);
  };

  const filteredGroups = groups.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (g.ProjectGroupName && g.ProjectGroupName.toLowerCase().includes(q)) ||
      (g.ProjectTitle && g.ProjectTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="spms-group-creation">
      <header className="spms-group-creation__header">
        <div className="spms-group-creation__title-group">
          <h1 className="spms-group-creation__title">Group Creation</h1>
          <p className="spms-group-creation__subtitle">Manage student project groups and assign initial topics.</p>
        </div>
        
        <div className="spms-group-creation__header-actions">
          <div className="spms-group-creation__search-wrapper">
            <Search size={18} className="spms-group-creation__search-icon" />
            <input 
              type="text" 
              placeholder="Search groups..." 
              className="spms-group-creation__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Group
          </button>
        </div>
      </header>

      <div className="spms-group-creation__layout">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-group-creation__card spms-group-creation__card--full"
        >
          <div className="spms-group-creation__card-body spms-group-creation__card-body--no-padding">
            
            {filteredGroups.length === 0 ? (
              <div className="spms-group-creation__empty">
                <div className="spms-group-creation__empty-icon">
                  <FolderKanban size={24} />
                </div>
                <h3 className="spms-group-creation__empty-title">
                  {searchQuery ? "No Matches Found" : "No Groups Found"}
                </h3>
                <p className="spms-group-creation__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Create your first project group using the form."}
                </p>
              </div>
            ) : (
              <div className="spms-group-creation__table-wrapper">
                <table className="spms-group-creation__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Group Name</th>
                      <th>Project Type</th>
                      <th>Project Title</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredGroups.map((group, index) => (
                        <motion.tr 
                          key={group.ProjectGroupID || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            #{group.ProjectGroupID}
                          </td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>
                            {group.ProjectGroupName}
                          </td>
                          <td style={{ color: '#334155' }}>
                            {getProjectTypeName(group.ProjectTypeID)}
                          </td>
                          <td style={{ color: '#475569' }}>
                            {group.ProjectTitle || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Title</span>}
                          </td>
                          <td>
                            <div className="spms-group-creation__table-actions">
                              <button 
                                type="button"
                                className="spms-group-creation__icon-btn spms-group-creation__icon-btn--edit" 
                                onClick={() => handleEdit(index)}
                                title="Edit Group"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                type="button"
                                className="spms-group-creation__icon-btn spms-group-creation__icon-btn--delete" 
                                onClick={() => confirmDelete(index)}
                                title="Delete Group"
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
        title={editingIndex !== null ? "Edit Project Group" : "Create New Group"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-group-creation__form-group">
              <label className="spms-group-creation__label">Group Name *</label>
              <input
                name="ProjectGroupName"
                value={form.ProjectGroupName}
                onChange={handleChange}
                placeholder="e.g. Alpha Team"
                className="spms-group-creation__input"
                required
              />
            </div>
            <div className="spms-group-creation__form-group">
              <label className="spms-group-creation__label">Project Type *</label>
              <select 
                name="ProjectTypeID"
                value={form.ProjectTypeID}
                onChange={handleChange}
                className="spms-group-creation__select"
                required
              >
                <option value="">-- Select Type --</option>
                {projectTypes.map(pt => (
                  <option key={pt.ProjectTypeID} value={pt.ProjectTypeID}>
                    {pt.ProjectTypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="spms-group-creation__form-group">
            <label className="spms-group-creation__label">Project Title (Optional)</label>
            <input
              name="ProjectTitle"
              value={form.ProjectTitle}
              onChange={handleChange}
              placeholder="e.g. AI Based Health Monitor"
              className="spms-group-creation__input"
            />
          </div>

          <div className="spms-group-creation__form-group">
            <label className="spms-group-creation__label">Project Area / Domain</label>
            <input
              name="ProjectArea"
              value={form.ProjectArea}
              onChange={handleChange}
              placeholder="e.g. Machine Learning"
              className="spms-group-creation__input"
            />
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingIndex !== null ? "Update" : "Save"} Group
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Project Group"
        itemName={groups[deleteModal.index]?.ProjectGroupName}
      />

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-group-creation__toast spms-group-creation__toast--${toast.type}`}
          >
            <div className="spms-group-creation__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-group-creation__toast-content">
              <h4 className="spms-group-creation__toast-title">{toast.title}</h4>
              <p className="spms-group-creation__toast-message">{toast.message}</p>
            </div>
            <button className="spms-group-creation__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

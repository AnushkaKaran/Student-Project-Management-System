import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Pencil, Trash2, CheckCircle, AlertCircle, X, Send, Search, Plus, AlertTriangle } from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./ProjectProposal.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

export default function ProjectProposal() {
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    ProjectGroupID: "",
    ProjectTitle: "",
    ProjectArea: "",
    ProjectDescription: "",
  });

  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchGroups();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showToast("error", "Data Error", "Failed to load project groups.");
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

    if (!form.ProjectGroupID) {
      showToast("error", "Validation Error", "Please select a group first.");
      return;
    }

    try {
      const payload = {
        ProjectTitle: form.ProjectTitle,
        ProjectArea: form.ProjectArea,
        ProjectDescription: form.ProjectDescription,
      };

      if (editingId) {
        await api.patch(`/groups/${editingId}`, payload);
        showToast("success", "Proposal Updated", "The proposal details were successfully updated.");
      } else {
        await api.patch(`/groups/${form.ProjectGroupID}`, payload);
        showToast("success", "Proposal Submitted", "The project proposal was successfully submitted.");
      }

      handleCancel();
      fetchGroups();
    } catch (error) {
      console.error("Submit error:", error);
      showToast("error", "Submission Error", "Failed to save the project proposal.");
    }
  };

  const handleEdit = (group) => {
    setForm({
      ProjectGroupID: group.ProjectGroupID,
      ProjectTitle: group.ProjectTitle || "",
      ProjectArea: group.ProjectArea || "",
      ProjectDescription: group.ProjectDescription || "",
    });
    setEditingId(group.ProjectGroupID);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await api.patch(`/groups/${deleteModal.id}`, {
        ProjectTitle: null,
        ProjectArea: null,
        ProjectDescription: null,
      });

      showToast("success", "Proposal Deleted", "The proposal details were removed.");
      if (editingId === deleteModal.id) handleCancel();
      fetchGroups();
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Deletion Error", "Failed to delete the proposal.");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      ProjectGroupID: "",
      ProjectTitle: "",
      ProjectArea: "",
      ProjectDescription: "",
    });
    setIsModalOpen(false);
  };

  const filteredGroups = groups.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const title = (g.ProjectTitle || "").toLowerCase();
    const groupName = (g.ProjectGroupName || "").toLowerCase();
    const area = (g.ProjectArea || "").toLowerCase();
    
    return title.includes(q) || groupName.includes(q) || area.includes(q);
  });

  return (
    <div className="spms-proposal">
      <header className="spms-proposal__header">
        <div className="spms-proposal__title-group">
          <h1 className="spms-proposal__title">Project Proposals</h1>
          <p className="spms-proposal__subtitle">Attach titles, domains, and descriptions to existing student groups.</p>
        </div>
        
        <div className="spms-proposal__header-actions">
          <div className="spms-proposal__search-wrapper">
            <Search size={18} className="spms-proposal__search-icon" />
            <input 
              type="text" 
              placeholder="Search proposals..." 
              className="spms-proposal__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Submit Proposal
          </button>
        </div>
      </header>

      <div className="spms-proposal__layout">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-proposal__card spms-proposal__card--full"
        >
          <div className="spms-proposal__card-body spms-proposal__card-body--no-padding">
            
            {filteredGroups.length === 0 ? (
              <div className="spms-proposal__empty">
                <div className="spms-proposal__empty-icon">
                  <FileText size={24} />
                </div>
                <h3 className="spms-proposal__empty-title">
                  {searchQuery ? "No Matches Found" : "No Proposals Found"}
                </h3>
                <p className="spms-proposal__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Submit a proposal for a student group."}
                </p>
              </div>
            ) : (
              <div className="spms-proposal__table-wrapper">
                <table className="spms-proposal__table">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Project Title</th>
                      <th>Domain</th>
                      <th>Description</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.map((g) => {
                      const hasProposal = g.ProjectTitle || g.ProjectDescription;
                      
                      return (
                        <tr key={g.ProjectGroupID} style={{ opacity: hasProposal ? 1 : 0.6 }}>
                          <td style={{ fontWeight: 500, color: '#0f172a' }}>{g.ProjectGroupName}</td>
                          <td>{g.ProjectTitle || '—'}</td>
                          <td>{g.ProjectArea || '—'}</td>
                          <td>
                            <div className="spms-proposal__table-desc" title={g.ProjectDescription}>
                              {g.ProjectDescription || '—'}
                            </div>
                          </td>
                          <td>
                            <div className="spms-proposal__table-actions">
                              <button 
                                type="button"
                                className="spms-proposal__icon-btn spms-proposal__icon-btn--edit" 
                                onClick={() => handleEdit(g)}
                                title="Edit Proposal"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                type="button"
                                className="spms-proposal__icon-btn spms-proposal__icon-btn--delete" 
                                onClick={() => confirmDelete(g.ProjectGroupID)}
                                title="Delete Proposal"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
        title={editingId ? "Edit Proposal Details" : "Submit New Proposal"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-proposal__form-group">
              <label className="spms-proposal__label">Select Group *</label>
              <select
                name="ProjectGroupID"
                value={form.ProjectGroupID}
                onChange={handleChange}
                required
                disabled={editingId !== null} 
                className="spms-proposal__select"
              >
                <option value="">-- Choose a Group --</option>
                {groups.map((g) => (
                  <option key={g.ProjectGroupID} value={g.ProjectGroupID}>
                    {g.ProjectGroupName}
                  </option>
                ))}
              </select>
            </div>
            <div className="spms-proposal__form-group">
              <label className="spms-proposal__label">Project Title</label>
              <input
                name="ProjectTitle"
                value={form.ProjectTitle}
                onChange={handleChange}
                placeholder="e.g. Smart Attendance App"
                className="spms-proposal__input"
              />
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-proposal__form-group" style={{ flex: '1' }}>
              <label className="spms-proposal__label">Domain / Area</label>
              <input
                name="ProjectArea"
                value={form.ProjectArea}
                onChange={handleChange}
                placeholder="e.g. Artificial Intelligence"
                className="spms-proposal__input"
              />
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-proposal__form-group" style={{ flex: '1' }}>
              <label className="spms-proposal__label">Description</label>
              <textarea
                name="ProjectDescription"
                value={form.ProjectDescription}
                onChange={handleChange}
                placeholder="Briefly describe the project goals..."
                className="spms-proposal__textarea"
              />
            </div>
          </div>

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!form.ProjectGroupID}>
              {editingId ? <CheckCircle size={16} /> : <Send size={16} />}
              {editingId ? "Update Proposal" : "Submit Proposal"}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Project Proposal"
        itemName={groups.find(g => g.ProjectGroupID === deleteModal.id)?.ProjectGroupName || "this proposal"}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-proposal__toast spms-proposal__toast--${toast.type}`}
          >
            <div className="spms-proposal__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-proposal__toast-content">
              <h4 className="spms-proposal__toast-title">{toast.title}</h4>
              <p className="spms-proposal__toast-message">{toast.message}</p>
            </div>
            <button className="spms-proposal__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

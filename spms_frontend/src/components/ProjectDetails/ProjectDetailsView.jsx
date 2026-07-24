import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Pencil, Trash2, CheckCircle, AlertCircle, X, Save, AlertTriangle, Plus, Search } from "lucide-react";
import api from "../../api/axios";
import Modal from "../Modal";
import "./ProjectDetailsView.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

export default function ProjectDetails() {
  const [details, setDetails] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [form, setForm] = useState({
    ProjectGroupID: "",
    GuideStaffName: "",
    AverageCPI: "",
    ConvenerStaffID: "",
    ExpertStaffID: "",
    Description: "" 
  });

  // Custom Toast State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDetails = async () => {
    try {
      const res = await api.get("/groups");
      setDetails(res.data.data || []);
    } catch (error) {
      console.error("Error fetching groups", error);
      showToast("error", "Data Error", "Failed to load project details.");
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
      await api.patch(`/groups/${form.ProjectGroupID}`, {
        GuideStaffName: form.GuideStaffName,
        AverageCPI: form.AverageCPI,
        ConvenerStaffID: form.ConvenerStaffID,
        ExpertStaffID: form.ExpertStaffID,
        Description: form.Description,
      });

      showToast("success", "Details Saved", "Project administrative details were updated successfully.");

      handleCancel();
      fetchDetails();
    } catch (error) {
      console.error("Submit error:", error);
      showToast("error", "Submission Error", "Failed to save the project details.");
    }
  };

  const handleEdit = (group) => {
    setForm({
      ProjectGroupID: group.ProjectGroupID,
      GuideStaffName: group.GuideStaffName || "",
      AverageCPI: group.AverageCPI || "",
      ConvenerStaffID: group.ConvenerStaffID || "",
      ExpertStaffID: group.ExpertStaffID || "",
      Description: group.Description || "",
    });
    setEditingId(group.ProjectGroupID);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (deleteModal.id === null) return;

    try {
      await api.delete(`/groups/${deleteModal.id}`);

      showToast("success", "Group Deleted", "The project group was deleted.");
      if (editingId === deleteModal.id) handleCancel();
      fetchDetails();
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Deletion Error", "Failed to delete the project group.");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      ProjectGroupID: "",
      GuideStaffName: "",
      AverageCPI: "",
      ConvenerStaffID: "",
      ExpertStaffID: "",
      Description: "",
    });
    setIsModalOpen(false);
  };

  const filteredDetails = details.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.ProjectGroupName && d.ProjectGroupName.toLowerCase().includes(q)) ||
      (d.GuideStaffName && d.GuideStaffName.toLowerCase().includes(q)) ||
      (d.Description && d.Description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="spms-details">
      <header className="spms-details__header">
        <div className="spms-details__title-group">
          <h1 className="spms-details__title">Project Details</h1>
          <p className="spms-details__subtitle">Manage administrative details, guides, experts, and CPI information.</p>
        </div>
        
        <div className="spms-details__header-actions">
          <div className="spms-details__search-wrapper">
            <Search size={18} className="spms-details__search-icon" />
            <input 
              type="text" 
              placeholder="Search groups or guides..." 
              className="spms-details__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Details
          </button>
        </div>
      </header>

      <div className="spms-details__layout">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-details__card spms-details__card--full"
        >
          <div className="spms-details__card-body spms-details__card-body--no-padding">
            
            {filteredDetails.length === 0 ? (
              <div className="spms-details__empty">
                <div className="spms-details__empty-icon">
                  <FolderOpen size={24} />
                </div>
                <h3 className="spms-details__empty-title">
                  {searchQuery ? "No Matches Found" : "No Details Found"}
                </h3>
                <p className="spms-details__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Create a group first to manage its details."}
                </p>
              </div>
            ) : (
              <div className="spms-details__table-wrapper">
                <table className="spms-details__table">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Guide</th>
                      <th>Convener ID</th>
                      <th>Expert ID</th>
                      <th>Avg CPI</th>
                      <th>Description</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredDetails.map((g) => (
                        <motion.tr 
                          key={g.ProjectGroupID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>
                            {g.ProjectGroupName}
                          </td>
                          <td style={{ fontWeight: 500, color: '#334155' }}>
                            {g.GuideStaffName || "Unassigned"}
                          </td>
                          <td>{g.ConvenerStaffID || "-"}</td>
                          <td>{g.ExpertStaffID || "-"}</td>
                          <td>
                            {g.AverageCPI ? (
                              <span className="spms-details__badge spms-details__badge--cpi">
                                {g.AverageCPI}
                              </span>
                            ) : "-"}
                          </td>
                          <td style={{ color: '#64748b' }}>
                            {g.Description || "-"}
                          </td>
                          <td>
                            <div className="spms-details__table-actions">
                              <button 
                                type="button"
                                className="spms-details__icon-btn spms-details__icon-btn--edit" 
                                onClick={() => handleEdit(g)}
                                title="Edit Details"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                type="button"
                                className="spms-details__icon-btn spms-details__icon-btn--delete" 
                                onClick={() => confirmDelete(g.ProjectGroupID)}
                                title="Delete Details"
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
        title={editingId ? "Edit Group Details" : "Add Group Details"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-details__form-group">
              <label className="spms-details__label">Project Group *</label>
              <select 
                name="ProjectGroupID"
                value={form.ProjectGroupID}
                onChange={handleChange}
                className="spms-details__select"
                required
                disabled={editingId !== null}
              >
                <option value="">-- Select Group --</option>
                {details.map(g => (
                  <option key={g.ProjectGroupID} value={g.ProjectGroupID}>
                    {g.ProjectGroupName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="spms-modal__form-row">
            <div className="spms-details__form-group">
              <label className="spms-details__label">Average CPI</label>
              <input
                type="number"
                step="0.01"
                name="AverageCPI"
                value={form.AverageCPI}
                onChange={handleChange}
                placeholder="e.g. 8.5"
                className="spms-details__input"
              />
            </div>
            <div className="spms-details__form-group">
              <label className="spms-details__label">Convener ID</label>
              <input
                type="number"
                name="ConvenerStaffID"
                value={form.ConvenerStaffID}
                onChange={handleChange}
                placeholder="e.g. 1"
                className="spms-details__input"
              />
            </div>
            <div className="spms-details__form-group">
              <label className="spms-details__label">Expert ID</label>
              <input
                type="number"
                name="ExpertStaffID"
                value={form.ExpertStaffID}
                onChange={handleChange}
                placeholder="e.g. 2"
                className="spms-details__input"
              />
            </div>
          </div>
          <div className="spms-modal__form-row">
            <div className="spms-details__form-group">
              <label className="spms-details__label">Description</label>
              <input
                name="Description"
                value={form.Description}
                onChange={handleChange}
                placeholder="Additional notes..."
                className="spms-details__input"
              />
            </div>
          </div>
          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingId ? "Update" : "Save"} Details
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Project Group"
        itemName={details.find(g => g.ProjectGroupID === deleteModal.id)?.ProjectGroupName || "this group"}
      />

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-details__toast spms-details__toast--${toast.type}`}
          >
            <div className="spms-details__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-details__toast-content">
              <h4 className="spms-details__toast-title">{toast.title}</h4>
              <p className="spms-details__toast-message">{toast.message}</p>
            </div>
            <button className="spms-details__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

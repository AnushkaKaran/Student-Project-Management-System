import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Pencil, Trash2, CheckCircle, AlertCircle, 
  X, Search, Plus, Save, AlertTriangle 
} from "lucide-react";
import DeleteConfirmModal from "./common/DeleteConfirmModal";
import Modal from "./Modal";
import "./AcademicYearSetup.css";

const STORAGE_KEY = "spms_academic_years";
const DEMO_DATA = [
  { YearID: 1, YearName: "2024-2025", IsActive: 0 },
  { YearID: 2, YearName: "2025-2026", IsActive: 1 }
];

export default function AcademicYearSetup() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [form, setForm] = useState({
    YearName: "",
    IsActive: 1
  });
  
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAcademicYears = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setYears(JSON.parse(stored));
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_DATA));
          setYears(DEMO_DATA);
        }
      } catch (err) {
        console.error("Error reading localStorage", err);
        setYears(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const saveToStorage = (newData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setYears(newData);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.YearName.trim()) {
      showToast("error", "Validation Error", "Please provide a Year Name.");
      return;
    }

    let updatedYears = [...years];

    // If making this one active, deactivate all others
    if (form.IsActive === 1) {
      updatedYears = updatedYears.map(y => ({ ...y, IsActive: 0 }));
    }

    if (editingId) {
      // Update
      updatedYears = updatedYears.map(y => 
        y.YearID === editingId ? { ...y, ...form } : y
      );
      saveToStorage(updatedYears);
      showToast("success", "Year Updated", "The academic year was successfully updated.");
    } else {
      // Add
      const newId = updatedYears.length > 0 ? Math.max(...updatedYears.map(y => y.YearID)) + 1 : 1;
      const newYear = { YearID: newId, ...form };
      updatedYears.push(newYear);
      saveToStorage(updatedYears);
      showToast("success", "Year Added", "A new academic year has been created.");
    }

    setForm({ YearName: "", IsActive: 1 });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (year) => {
    setForm({
      YearName: year.YearName || "",
      IsActive: year.IsActive === 0 || year.IsActive === false ? 0 : 1,
    });
    setEditingId(year.YearID);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = () => {
    if (!deleteModal.id) return;
    
    const updatedYears = years.filter(y => y.YearID !== deleteModal.id);
    saveToStorage(updatedYears);
    
    showToast("success", "Year Deleted", "The academic year was permanently removed.");
    
    if (editingId === deleteModal.id) {
      setEditingId(null);
      setForm({ YearName: "", IsActive: 1 });
      setIsModalOpen(false);
    }
    
    setDeleteModal({ isOpen: false, id: null });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ YearName: "", IsActive: 1 });
    setIsModalOpen(false);
  };

  // Filter based on search query
  const filteredYears = years.filter(y => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (y.YearName || "").toLowerCase().includes(q);
  });

  return (
    <div className="spms-academic">
      <header className="spms-academic__header">
        <div className="spms-academic__title-group">
          <h1 className="spms-academic__title">Academic Year Setup</h1>
          <p className="spms-academic__subtitle">Manage global academic cycles (Frontend Simulation).</p>
        </div>
        
        <div className="spms-academic__header-actions">
          <div className="spms-academic__search-wrapper">
            <Search size={18} className="spms-academic__search-icon" />
            <input 
              type="text" 
              placeholder="Search academic years..." 
              className="spms-academic__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Year
          </button>
        </div>
      </header>

      <div className="spms-academic__layout">
        
        {/* Right Column: Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-academic__card spms-academic__card--full"
        >
          <div className="spms-academic__card-body spms-academic__card-body--no-padding">
            
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="spms-academic__skeleton-row"></div>
                ))}
              </div>
            ) : filteredYears.length === 0 ? (
              <div className="spms-academic__empty">
                <div className="spms-academic__empty-icon">
                  <Calendar size={24} />
                </div>
                <h3 className="spms-academic__empty-title">
                  {searchQuery ? "No Matches Found" : "No Academic Years"}
                </h3>
                <p className="spms-academic__empty-subtitle">
                  {searchQuery ? "Try adjusting your search query." : "Use the form to create your first academic year."}
                </p>
              </div>
            ) : (
              <div className="spms-academic__table-wrapper">
                <table className="spms-academic__table">
                  <thead>
                    <tr>
                      <th>Year Label</th>
                      <th>Status</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredYears.map((y) => {
                        const status = (y.IsActive === 1 || y.IsActive === true) ? 'Active' : 'Inactive';
                        const badgeClass = status === 'Active' ? 'spms-academic__badge--active' : 'spms-academic__badge--past';

                        return (
                          <motion.tr 
                            key={y.YearID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>
                              {y.YearName}
                            </td>
                            <td>
                              <span className={`spms-academic__badge ${badgeClass}`}>{status}</span>
                            </td>
                            <td>
                              <div className="spms-academic__table-actions">
                                <button 
                                  type="button"
                                  className="spms-academic__icon-btn spms-academic__icon-btn--edit" 
                                  onClick={() => handleEdit(y)}
                                  title="Edit Year"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  type="button"
                                  className="spms-academic__icon-btn spms-academic__icon-btn--delete" 
                                  onClick={() => confirmDelete(y.YearID)}
                                  title="Delete Year"
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
        title={editingId ? "Edit Academic Year" : "Add Academic Year"}
      >
        <form onSubmit={handleSubmit}>
          <div className="spms-modal__form-row">
            <div className="spms-academic__form-group">
              <label className="spms-academic__label">Year Label *</label>
              <input
                name="YearName"
                value={form.YearName}
                onChange={handleChange}
                placeholder="e.g. 2026-2027"
                className="spms-academic__input"
                required
              />
            </div>
          </div>

          <div className="spms-modal__form-row">
            <div className="spms-academic__form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                name="IsActive"
                checked={form.IsActive === 1}
                onChange={handleChange}
                id="isActiveCheckbox"
              />
              <label htmlFor="isActiveCheckbox" className="spms-academic__label" style={{ marginBottom: 0 }}>Active Year</label>
            </div>
          </div>
          
          {form.IsActive === 1 && (
            <div style={{ fontSize: '0.8rem', color: '#6366f1', marginBottom: '16px' }}>
              * Setting this as Active will automatically deactivate all other academic years.
            </div>
          )}

          <div className="spms-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingId ? "Update" : "Save"} Year
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        itemType="Academic Year"
        itemName={years.find(y => y.YearID === deleteModal.id)?.YearName || "Unknown Year"}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-academic__toast spms-academic__toast--${toast.type}`}
          >
            <div className="spms-academic__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-academic__toast-content">
              <h4 className="spms-academic__toast-title">{toast.title}</h4>
              <p className="spms-academic__toast-message">{toast.message}</p>
            </div>
            <button className="spms-academic__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
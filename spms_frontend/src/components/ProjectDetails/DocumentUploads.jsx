import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CloudUpload, FileText, FileImage, FileArchive, File, 
  Trash2, Download, CheckCircle, AlertCircle, X, CloudOff,
  Search, Plus, AlertTriangle
} from "lucide-react";
import Modal from "../Modal";
import "./DocumentUploads.css";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

// Simulated Backend Upload
const simulatedUploadToBackend = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => resolve({ 
          id: Math.random().toString(36).substr(2, 9),
          serverUrl: URL.createObjectURL(file) 
        }), 400);
      }
      onProgress(progress);
    }, 200);
  });
};

export default function DocumentUploads() {
  const [uploads, setUploads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUploads([
      {
        id: "1",
        fileName: "chatbot_report.pdf",
        fileType: "application/pdf",
        fileSize: 2450000, 
        uploadDate: new Date().toISOString().split('T')[0],
        downloadUrl: "#"
      },
      {
        id: "2",
        fileName: "ecommerce_code.zip",
        fileType: "application/zip",
        fileSize: 15600000, 
        uploadDate: new Date().toISOString().split('T')[0],
        downloadUrl: "#"
      }
    ]);
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (uploadingFile) return; 
    
    if (file.size > 50 * 1024 * 1024) {
      showToast("error", "File Too Large", "Please select a file smaller than 50MB.");
      return;
    }

    setUploadingFile(file.name);
    setUploadProgress(0);

    try {
      const response = await simulatedUploadToBackend(file, (progress) => {
        setUploadProgress(progress);
      });

      const newUpload = {
        id: response.id,
        fileName: file.name,
        fileType: file.type || getExtension(file.name),
        fileSize: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        downloadUrl: response.serverUrl
      };

      setUploads([newUpload, ...uploads]);
      showToast("success", "Upload Complete", `${file.name} was successfully uploaded.`);
      
      setTimeout(() => {
        setIsModalOpen(false);
      }, 500);

    } catch (error) {
      showToast("error", "Upload Failed", "There was a problem uploading your file.");
    } finally {
      setUploadingFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = () => {
    if (!deleteModal.id) return;
    
    const updated = uploads.filter(u => u.id !== deleteModal.id);
    setUploads(updated);
    showToast("success", "File Deleted", "The document has been removed.");
    setDeleteModal({ isOpen: false, id: null });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const getFileIcon = (type, name) => {
    const ext = getExtension(name);
    if (type.includes("pdf") || ext === "pdf") return <FileText size={18} className="spms-uploads__file-icon--pdf" />;
    if (type.includes("image") || ["jpg", "png", "gif", "jpeg"].includes(ext)) return <FileImage size={18} className="spms-uploads__file-icon--image" />;
    if (type.includes("zip") || type.includes("rar") || ["zip", "rar", "7z"].includes(ext)) return <FileArchive size={18} className="spms-uploads__file-icon--archive" />;
    if (["doc", "docx", "txt", "csv", "xlsx"].includes(ext)) return <FileText size={18} className="spms-uploads__file-icon--doc" />;
    return <File size={18} className="spms-uploads__file-icon--default" />;
  };

  const filteredUploads = uploads.filter((u) => {
    if (!searchQuery) return true;
    return (u.fileName || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="spms-uploads">
      <header className="spms-uploads__header">
        <div className="spms-uploads__title-group">
          <h1 className="spms-uploads__title">Document Uploads</h1>
          <p className="spms-uploads__subtitle">Upload project reports, code archives, and presentations.</p>
        </div>
        
        <div className="spms-uploads__header-actions">
          <div className="spms-uploads__search-wrapper">
            <Search size={18} className="spms-uploads__search-icon" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="spms-uploads__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Upload Document
          </button>
        </div>
      </header>

      <div className="spms-uploads__layout">
        
        {/* Right Column: Files Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="spms-uploads__card spms-uploads__card--full"
        >
          <div className="spms-uploads__card-body spms-uploads__card-body--no-padding">
            
            {filteredUploads.length === 0 ? (
              <div className="spms-uploads__empty">
                <div className="spms-uploads__empty-icon">
                  <CloudOff size={24} />
                </div>
                <h3 className="spms-uploads__empty-title">
                  {searchQuery ? "No Matches Found" : "No Documents Yet"}
                </h3>
                <p className="spms-uploads__empty-subtitle">
                  {searchQuery ? "Try adjusting your search criteria." : "Upload your first document to get started."}
                </p>
              </div>
            ) : (
              <div className="spms-uploads__table-wrapper">
                <table className="spms-uploads__table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Size</th>
                      <th>Upload Date</th>
                      <th>Status</th>
                      <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredUploads.map((u) => (
                        <motion.tr 
                          key={u.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td>
                            <div className="spms-uploads__file-cell">
                              <div className="spms-uploads__file-icon">
                                {getFileIcon(u.fileType, u.fileName)}
                              </div>
                              <span className="spms-uploads__file-name">{u.fileName}</span>
                            </div>
                          </td>
                          <td>{formatBytes(u.fileSize)}</td>
                          <td>{u.uploadDate}</td>
                          <td>
                            <span className="spms-uploads__badge spms-uploads__badge--success">Ready</span>
                          </td>
                          <td>
                            <div className="spms-uploads__table-actions">
                              <a 
                                href={u.downloadUrl}
                                download={u.fileName}
                                className="spms-uploads__icon-btn spms-uploads__icon-btn--download" 
                                title="Download File"
                                onClick={(e) => {
                                  if (u.downloadUrl === "#") {
                                    e.preventDefault();
                                    showToast("error", "Simulated File", "Cannot download dummy prototype files.");
                                  }
                                }}
                              >
                                <Download size={16} />
                              </a>
                              <button 
                                type="button"
                                className="spms-uploads__icon-btn spms-uploads__icon-btn--delete" 
                                onClick={() => confirmDelete(u.id)}
                                title="Delete File"
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
        onClose={() => setIsModalOpen(false)}
        title="Upload Document"
      >
        <div 
          className={`spms-uploads__dropzone ${isDragging ? "spms-uploads__dropzone--active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="spms-uploads__dropzone-input" 
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={uploadingFile !== null}
          />
          <CloudUpload size={40} className="spms-uploads__dropzone-icon" />
          <p className="spms-uploads__dropzone-text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="spms-uploads__dropzone-hint">PDF, ZIP, Images or Office Docs (max 50MB)</p>
        </div>

        {uploadingFile && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="spms-uploads__progress-container"
          >
            <div className="spms-uploads__progress-header">
              <span className="spms-uploads__progress-name">{uploadingFile}</span>
              <span className="spms-uploads__progress-percent">{uploadProgress}%</span>
            </div>
            <div className="spms-uploads__progress-bar-bg">
              <div 
                className="spms-uploads__progress-bar-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </motion.div>
        )}
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, index: null })}
        onConfirm={handleDelete}
        itemType="Document"
        itemName={uploads.find(u => u.id === deleteModal.id)?.name || "this document"}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-uploads__toast spms-uploads__toast--${toast.type}`}
          >
            <div className="spms-uploads__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-uploads__toast-content">
              <h4 className="spms-uploads__toast-title">{toast.title}</h4>
              <p className="spms-uploads__toast-message">{toast.message}</p>
            </div>
            <button className="spms-uploads__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
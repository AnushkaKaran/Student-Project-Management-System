import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, FileText, Users, Award, 
  CheckCircle, AlertCircle, X 
} from "lucide-react";
import "./ExportReport.css";

export default function ExportReport() {
  const [exportState, setExportState] = useState({
    marks: { format: "pdf", loading: false },
    students: { format: "excel", loading: false },
    faculty: { format: "pdf", loading: false }
  });
  
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFormatChange = (cardId, format) => {
    setExportState(prev => ({
      ...prev,
      [cardId]: { ...prev[cardId], format }
    }));
  };

  const handleExport = (cardId, reportName) => {
    const config = exportState[cardId];
    
    // Simulate generation and download
    setExportState(prev => ({
      ...prev,
      [cardId]: { ...config, loading: true }
    }));

    setTimeout(() => {
      setExportState(prev => ({
        ...prev,
        [cardId]: { ...config, loading: false }
      }));
      
      const fileName = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${config.format}`;
      showToast("success", "Export Successful", `Generated ${fileName} and started download.`);
    }, 1500); // 1.5s simulation
  };

  return (
    <div className="spms-export">
      <header className="spms-export__header">
        <div className="spms-export__title-group">
          <h1 className="spms-export__title">System Data Export</h1>
          <p className="spms-export__subtitle">Generate and download comprehensive reports from the database.</p>
        </div>
      </header>

      <div className="spms-export__grid">
        
        {/* Card 1: Marks Report */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="spms-export__card"
        >
          <div className="spms-export__card-header">
            <div className="spms-export__card-icon spms-export__card-icon--orange">
              <Award size={24} />
            </div>
            <div className="spms-export__card-title-group">
              <h3 className="spms-export__card-title">Evaluation Records</h3>
              <p className="spms-export__card-desc">Simulated marks and progress report dataset.</p>
            </div>
          </div>
          <div className="spms-export__card-body">
            <div className="spms-export__control-group">
              <label className="spms-export__label">Export Format</label>
              <select 
                className="spms-export__select"
                value={exportState.marks.format}
                onChange={(e) => handleFormatChange("marks", e.target.value)}
                disabled={exportState.marks.loading}
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="excel">Excel Spreadsheet (.xlsx)</option>
                <option value="png">Image Export (.png)</option>
              </select>
            </div>
            <button 
              className="spms-export__btn"
              onClick={() => handleExport("marks", "Evaluation_Records")}
              disabled={exportState.marks.loading}
            >
              {exportState.marks.loading ? (
                <div className="spms-export__spinner"></div>
              ) : (
                <><Download size={18} /> Generate Export</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Card 2: Student Roster */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="spms-export__card"
        >
          <div className="spms-export__card-header">
            <div className="spms-export__card-icon spms-export__card-icon--green">
              <Users size={24} />
            </div>
            <div className="spms-export__card-title-group">
              <h3 className="spms-export__card-title">Student Roster</h3>
              <p className="spms-export__card-desc">Complete database of registered students and details.</p>
            </div>
          </div>
          <div className="spms-export__card-body">
            <div className="spms-export__control-group">
              <label className="spms-export__label">Export Format</label>
              <select 
                className="spms-export__select"
                value={exportState.students.format}
                onChange={(e) => handleFormatChange("students", e.target.value)}
                disabled={exportState.students.loading}
              >
                <option value="excel">Excel Spreadsheet (.xlsx)</option>
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="csv">Comma Separated (.csv)</option>
              </select>
            </div>
            <button 
              className="spms-export__btn"
              onClick={() => handleExport("students", "Student_Roster")}
              disabled={exportState.students.loading}
            >
              {exportState.students.loading ? (
                <div className="spms-export__spinner"></div>
              ) : (
                <><Download size={18} /> Generate Export</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Card 3: System Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="spms-export__card"
        >
          <div className="spms-export__card-header">
            <div className="spms-export__card-icon spms-export__card-icon--purple">
              <FileText size={24} />
            </div>
            <div className="spms-export__card-title-group">
              <h3 className="spms-export__card-title">System Overview</h3>
              <p className="spms-export__card-desc">Aggregated statistics on groups, staff, and projects.</p>
            </div>
          </div>
          <div className="spms-export__card-body">
            <div className="spms-export__control-group">
              <label className="spms-export__label">Export Format</label>
              <select 
                className="spms-export__select"
                value={exportState.faculty.format}
                onChange={(e) => handleFormatChange("faculty", e.target.value)}
                disabled={exportState.faculty.loading}
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="png">Image Export (.png)</option>
              </select>
            </div>
            <button 
              className="spms-export__btn"
              onClick={() => handleExport("faculty", "System_Overview")}
              disabled={exportState.faculty.loading}
            >
              {exportState.faculty.loading ? (
                <div className="spms-export__spinner"></div>
              ) : (
                <><Download size={18} /> Generate Export</>
              )}
            </button>
          </div>
        </motion.div>

      </div>

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`spms-export__toast spms-export__toast--${toast.type}`}
          >
            <div className="spms-export__toast-icon">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="spms-export__toast-content">
              <h4 className="spms-export__toast-title">{toast.title}</h4>
              <p className="spms-export__toast-message">{toast.message}</p>
            </div>
            <button className="spms-export__toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
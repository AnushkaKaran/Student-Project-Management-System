import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import "./DeleteConfirmModal.css";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "Delete Record",
  itemName,
  itemType = "record" // e.g. "Group", "Student", "Staff"
}) {
  const modalRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !isDeleting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="spms-delete-modal__overlay" onClick={handleBackdropClick}>
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="spms-delete-modal"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="spms-delete-modal__close"
              onClick={onClose}
              disabled={isDeleting}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="spms-delete-modal__header">
              <div className="spms-delete-modal__icon-wrapper">
                <AlertTriangle size={28} className="spms-delete-modal__icon" />
              </div>
              <h3 className="spms-delete-modal__title">{title}</h3>
            </div>

            <div className="spms-delete-modal__body">
              <p className="spms-delete-modal__text">
                Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
              </p>
              {itemName && (
                <div className="spms-delete-modal__item-box">
                  <span className="spms-delete-modal__item-label">Deleting {itemType}:</span>
                  <span className="spms-delete-modal__item-name">"{itemName}"</span>
                </div>
              )}
            </div>

            <div className="spms-delete-modal__footer">
              <button
                type="button"
                className="spms-delete-modal__btn spms-delete-modal__btn--cancel"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="spms-delete-modal__btn spms-delete-modal__btn--confirm"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="spms-delete-modal__spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

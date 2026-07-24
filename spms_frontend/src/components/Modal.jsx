import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import "./Modal.css";

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="spms-modal__overlay" onClick={onClose}>
          <motion.div
            className="spms-modal__container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="spms-modal__header">
              <h2 className="spms-modal__title">{title}</h2>
              <button type="button" className="spms-modal__close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            <div className="spms-modal__content">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

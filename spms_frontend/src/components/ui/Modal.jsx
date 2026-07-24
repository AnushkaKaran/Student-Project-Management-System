import { useEffect } from "react";
import "./ui.css";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div className={`ui-modal ui-modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal-header">
          <h3>{title}</h3>
          <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./CompositionModal.module.css";

interface CompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function CompositionModal({ isOpen, onClose, children }: CompositionModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

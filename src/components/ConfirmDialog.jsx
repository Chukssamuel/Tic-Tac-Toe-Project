import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="stats-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onKeyDown={handleKeyDown}
    >
      <div className="confirm-modal-card">
        <div className="confirm-modal-header">
          <div className="confirm-icon-wrapper">
            <AlertTriangle className={isDanger ? 'confirm-icon-danger' : 'confirm-icon-primary'} size={24} />
          </div>
          <button
            type="button"
            className="stats-close-btn"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="confirm-modal-body">
          <h3 id="confirm-dialog-title" className="confirm-title">
            {title}
          </h3>
          <p id="confirm-dialog-desc" className="confirm-desc">
            {message}
          </p>
        </div>

        <div className="confirm-modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="confirm-btn-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={isDanger ? 'confirm-btn-danger' : 'confirm-btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}


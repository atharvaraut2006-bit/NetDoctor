import React from 'react';
import { AlertTriangleIcon, StopCircleIcon, RotateCcwIcon, XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  iconType?: 'stop' | 'reset' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'primary',
  iconType = 'warning',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (iconType) {
      case 'stop':
        return <StopCircleIcon size={22} color="var(--color-error)" />;
      case 'reset':
        return <RotateCcwIcon size={22} color="var(--primary-blue)" />;
      case 'warning':
      default:
        return <AlertTriangleIcon size={22} color="var(--color-warning)" />;
    }
  };

  const getConfirmBtnClass = () => {
    switch (variant) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-secondary';
      case 'primary':
      default:
        return 'btn-primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {getIcon()}
            <h2 className="modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h2>
          </div>

          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} aria-label="Close modal">
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${getConfirmBtnClass()}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

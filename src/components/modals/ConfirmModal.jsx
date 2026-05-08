import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import './ConfirmModal.css';

export default function ConfirmModal() {
  const { modalData, closeModal } = useUiStore();
  
  if (!modalData) return null;

  const { 
    title = 'Are you sure?', 
    message = 'This action cannot be undone.', 
    onConfirm, 
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // 'danger' | 'success' | 'info'
  } = modalData;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="confirm-modal__icon success" size={48} />;
      case 'info': return <Info className="confirm-modal__icon info" size={48} />;
      default: return <AlertTriangle className="confirm-modal__icon danger" size={48} />;
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal__close" onClick={handleCancel}>
          <X size={20} />
        </button>

        <div className="confirm-modal__body">
          <div className="confirm-modal__icon-container">
            {getIcon()}
          </div>
          
          <h2 className="confirm-modal__title">{title}</h2>
          <p className="confirm-modal__message">{message}</p>
        </div>

        <div className="confirm-modal__footer">
          <button className="confirm-modal__btn-cancel" onClick={handleCancel}>
            {cancelText}
          </button>
          <button 
            className={`confirm-modal__btn-confirm ${type}`} 
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import './Toast.css';

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle    size={18} />,
  info:    <Info        size={18} />,
  warning: <AlertTriangle size={18} />,
};

function Toast({ id, type = 'info', message }) {
  const removeToast = useUiStore((s) => s.removeToast);

  return (
    <div className={`toast toast--${type} animate-slide-in-right`}>
      <span className="toast__icon">{ICONS[type]}</span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={() => removeToast(id)}
        aria-label="বন্ধ করুন"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}

export default Toast;

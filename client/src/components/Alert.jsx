import { useEffect } from 'react';
import './Alert.css';

export default function Alert({ type = 'info', message, icon, onClose, autoClose = 3500 }) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className={`alert alert-${type}`}>
      {icon && <span className="alert-icon">{icon}</span>}
      <span className="alert-message">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close alert">
          ✕
        </button>
      )}
    </div>
  );
}

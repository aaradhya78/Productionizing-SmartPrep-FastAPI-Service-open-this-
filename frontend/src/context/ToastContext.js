import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg, dur) => show(msg, 'success', dur), [show]);
  const error = useCallback((msg, dur) => show(msg, 'error', dur), [show]);
  const warning = useCallback((msg, dur) => show(msg, 'warning', dur), [show]);
  const info = useCallback((msg, dur) => show(msg, 'info', dur), [show]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="toast-icon success" />;
      case 'warning': return <AlertTriangle size={16} className="toast-icon warning" />;
      case 'error': return <AlertCircle size={16} className="toast-icon error" />;
      default: return <Info size={16} className="toast-icon info" />;
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            {getIcon(t.type)}
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Close notification">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

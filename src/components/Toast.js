'use client';

import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timerRef = useRef({});

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        timerRef.current[id] = setTimeout(() => removeToast(id), duration);
        return id;
    }, [removeToast]);

    const toast = {
        success: (msg, opts) => addToast(msg, 'success', opts?.duration),
        error: (msg, opts) => addToast(msg, 'error', opts?.duration ?? 6000),
        warning: (msg, opts) => addToast(msg, 'warning', opts?.duration),
        info: (msg, opts) => addToast(msg, 'info', opts?.duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const ICONS = {
    success: FiCheckCircle,
    error: FiXCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
};

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container" aria-live="polite">
            <AnimatePresence>
                {toasts.map(toast => {
                    const Icon = ICONS[toast.type] || FiInfo;
                    return (
                        <motion.div
                            key={toast.id}
                            className={`toast toast-${toast.type}`}
                            initial={{ opacity: 0, x: 80, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.85 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <div className="toast-icon-wrap">
                                <Icon size={20} />
                            </div>
                            <span className="toast-message">{toast.message}</span>
                            <button className="toast-close" onClick={() => removeToast(toast.id)}>
                                <FiX size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

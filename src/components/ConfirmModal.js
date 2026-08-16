"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmModal({ 
    isOpen, 
    title = "Are you sure?", 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Yes, delete", 
    isDestructive = true 
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={onCancel} style={{ zIndex: 99999 }}>
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                    
                    <div className="ai-modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                        <h3 style={{ color: isDestructive ? '#ef4444' : 'var(--text-primary)' }}>
                            {isDestructive && <FiAlertTriangle />} {title}
                        </h3>
                        <button className="ai-modal-close" onClick={onCancel}><FiX /></button>
                    </div>

                    <div className="ai-modal-body" style={{ paddingTop: 0, paddingBottom: '1.5rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {message}
                        </p>
                    </div>

                    <div className="ai-modal-footer">
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                        <button 
                            className="btn" 
                            style={{ 
                                background: isDestructive ? '#ef4444' : 'var(--primary-color)', 
                                color: '#fff', 
                                border: 'none' 
                            }} 
                            onClick={() => {
                                onConfirm();
                                onCancel();
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Confirm', confirmVariant = 'danger' }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 9999 }}>
                <motion.div
                    className="modal card"
                    style={{ maxWidth: '420px' }}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: 'var(--danger-bg)', color: 'var(--danger)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem', fontSize: '1.5rem'
                        }}>
                            <FiAlertTriangle />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                            {title}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                            {message}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                            <button
                                className="btn"
                                style={{ background: 'var(--danger)', color: 'white' }}
                                onClick={onConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

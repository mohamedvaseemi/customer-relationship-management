"use client";
import React from 'react';
import ThemeSelector from '@/components/ThemeSelector';
import { motion } from 'framer-motion';
import '@/styles/Appearance.css';

export default function Appearance() {
    return (
        <div className="appearance-settings">
            <div className="settings-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title">Appearance & Themes</h1>
                    <p className="page-subtitle">Personalize your CRM experience with professional themes.</p>
                </div>
            </div>

            <div className="settings-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card appearance-card"
                >
                    <ThemeSelector />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card preview-card"
                >
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Theme Preview</h3>
                    <p className="text-muted mb-6" style={{ color: 'var(--text-secondary)' }}>This is how your current theme looks across various UI elements.</p>

                    <div className="preview-elements" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="preview-section">
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Buttons</h4>
                            <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-primary">Primary Action</button>
                                <button className="btn btn-secondary">Secondary</button>
                            </div>
                        </div>

                        <div className="preview-section">
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Badges</h4>
                            <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
                                <span className="status-badge-alt badge-active">Active</span>
                                <span className="status-badge-alt badge-pending">Pending</span>
                                <span className="status-badge-alt badge-blocked">Closed</span>
                            </div>
                        </div>

                        <div className="preview-section">
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Inputs</h4>
                            <input type="text" className="input-alt" placeholder="Sample input field..." readOnly style={{ width: '100%' }} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

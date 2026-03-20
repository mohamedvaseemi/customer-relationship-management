'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import ThemeSelector from '@/components/ThemeSelector';
import { FiLayout, FiMaximize, FiMonitor, FiType } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Appearance.css';

const AppearancePage = () => {
    const { theme } = useTheme();

    return (
        <div className="appearance-settings">
            <div className="settings-section-header">
                <div>
                    <h1 className="page-title">Appearance</h1>
                    <p className="page-subtitle">Customize how ModernCRM looks and feels on your device.</p>
                </div>
            </div>

            <div className="appearance-grid">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="appearance-card card"
                >
                    <div className="card-header-alt">
                        <FiLayout size={20} className="text-primary" />
                        <div>
                            <h3>Theme Selection</h3>
                            <p>Choose between professional light and dark modes</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <ThemeSelector />
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="preview-card card"
                >
                    <div className="card-header-alt">
                        <FiMonitor size={20} className="text-primary" />
                        <div>
                            <h3>UI Preview</h3>
                            <p>See how your components will look with the current theme</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="preview-elements">
                            <div className="preview-section">
                                <h4>Buttons</h4>
                                <div className="flex-gap">
                                    <button className="btn btn-primary">Primary Action</button>
                                    <button className="btn btn-secondary">Secondary</button>
                                    <button className="btn btn-outline">Outline</button>
                                </div>
                            </div>
                            
                            <div className="preview-section">
                                <h4>Badges</h4>
                                <div className="flex-gap">
                                    <span className="badge badge-success">Success</span>
                                    <span className="badge badge-warning">Pending</span>
                                    <span className="badge badge-danger">High Priority</span>
                                    <span className="badge badge-info">New Info</span>
                                </div>
                            </div>

                            <div className="preview-section">
                                <h4>Form Controls</h4>
                                <div className="input-wrapper" style={{ maxWidth: '300px' }}>
                                    <FiType />
                                    <input type="text" className="input-styled" placeholder="Preview input styling" defaultValue="ModernCRM Interface" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AppearancePage;

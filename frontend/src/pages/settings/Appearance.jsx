import React from 'react';
import ThemeSelector from '../../components/ThemeSelector';
import { motion } from 'framer-motion';
import './Appearance.css';

const Appearance = () => {
    return (
        <div className="appearance-settings">
            <div className="settings-header">
                <div>
                    <h1 className="page-title">Appearance & Themes</h1>
                    <p className="page-subtitle">Personalize your IntWhizz CRM experience with professional themes.</p>
                </div>
            </div>

            <div className="settings-content">
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
                    <h3>Theme Preview</h3>
                    <p className="text-muted mb-6">This is how your current theme looks across various UI elements.</p>

                    <div className="preview-elements">
                        <div className="preview-section">
                            <h4>Buttons</h4>
                            <div className="flex gap-3">
                                <button className="btn btn-primary">Primary Action</button>
                                <button className="btn btn-secondary">Secondary</button>
                            </div>
                        </div>

                        <div className="preview-section">
                            <h4>Badges</h4>
                            <div className="flex gap-3">
                                <span className="badge badge-success">Active</span>
                                <span className="badge badge-warning">Pending</span>
                                <span className="badge badge-danger">Closed</span>
                            </div>
                        </div>

                        <div className="preview-section">
                            <h4>Inputs</h4>
                            <input type="text" className="input" placeholder="Sample input field..." readOnly />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Appearance;

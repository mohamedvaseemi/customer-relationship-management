"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiX } from 'react-icons/fi';
import ThemeSelector from './ThemeSelector';
import { useTheme } from '../context/ThemeContext';

const FloatingCustomizer = () => {
    const { customizerOpen: isOpen, setCustomizerOpen: setIsOpen } = useTheme();

    return (
        <>
            <motion.button
                className="floating-customizer-btn"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Appearance & Themes"
                aria-label="Open appearance and theme customizer"
            >
                <FiSettings size={24} aria-hidden="true" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div
                        className="floating-customizer-overlay"
                        onClick={() => setIsOpen(false)}
                        role="presentation"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            className="floating-customizer-panel"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Appearance and theme customizer"
                        >
                            <div className="floating-customizer-header">
                                <h3>Appearance Customization</h3>
                                <button className="icon-btn" onClick={() => setIsOpen(false)} aria-label="Close customizer">
                                    <FiX size={20} aria-hidden="true" />
                                </button>
                            </div>
                            <div className="floating-customizer-content">
                                <ThemeSelector />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingCustomizer;

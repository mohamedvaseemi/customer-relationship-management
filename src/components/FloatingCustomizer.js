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
            >
                <FiSettings size={24} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="floating-customizer-overlay" onClick={() => setIsOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            className="floating-customizer-panel"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="floating-customizer-header">
                                <h3>Appearance Customization</h3>
                                <button className="icon-btn" onClick={() => setIsOpen(false)}>
                                    <FiX size={20} />
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

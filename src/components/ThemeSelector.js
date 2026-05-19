"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FiCheck } from 'react-icons/fi';
import '@/styles/ThemeSelector.css';

const THEMES = [
    { id: 'light', name: 'Professional Light', color: '#1e3a8a', type: 'light' },
    { id: 'dark', name: 'Navy Dark', color: '#111827', type: 'dark' },
    { id: 'midnight', name: 'Midnight Pro', color: '#020617', type: 'dark' },
    { id: 'emerald', name: 'Forest Emerald', color: '#10b981', type: 'light' },
    { id: 'sapphire', name: 'Deep Sapphire', color: '#2563eb', type: 'light' },
    { id: 'onyx', name: 'Corporate Onyx', color: '#4b5563', type: 'light' },
    { id: 'amethyst', name: 'Royal Amethyst', color: '#8b5cf6', type: 'light' },
    { id: 'ruby', name: 'Ruby Crimson', color: '#e11d48', type: 'light' },
];

const ThemeSelector = ({ onClose }) => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="theme-selector">
            <div className="theme-selector-header">
                <h3>Select Theme</h3>
                <p>Choose a professional look for your workspace</p>
            </div>
            <div className="theme-grid">
                {THEMES.map((t) => (
                    <button
                        key={t.id}
                        className={`theme-option ${theme === t.id ? 'active' : ''}`}
                        onClick={() => {
                            setTheme(t.id);
                            if (onClose) onClose();
                        }}
                    >
                        <div
                            className="theme-preview"
                            style={{ backgroundColor: t.color }}
                        >
                            {theme === t.id && <FiCheck className="check-icon" />}
                        </div>
                        <span className="theme-name">{t.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeSelector;

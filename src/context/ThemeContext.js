"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') || 'light';
    }
    return 'light';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);
    const [customizerOpen, setCustomizerOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, customizerOpen, setCustomizerOpen }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Fallback for SSR
        if (typeof window === 'undefined') return 'light';
        return localStorage.getItem('theme') || 'light';
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Ensure the class name is set on the document element once mounted
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // To prevent hydration mismatch, we don't render children until mounted
    // OR we return a stable layout. Let's return children but provide a 'mounted' flag if needed.
    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);

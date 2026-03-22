'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    });
    const [user, setUser] = useState(() => {
        if (typeof window === 'undefined') return null;
        const u = localStorage.getItem('user');
        try { return u ? JSON.parse(u) : null; } catch { return null; }
    });
    const [loading, setLoading] = useState(false); // No longer loading initially as we read from storage

    useEffect(() => {
        // Still verify the token exists, if we want to do a background refresh we can here
        // But for now, just mark loading as false
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    // Refresh user data from server (useful after profile updates)
    const refreshUser = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return;
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${storedToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            }
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

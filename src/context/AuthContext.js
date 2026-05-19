"use client";
import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to load user:', error);
            setToken(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        const { token, user } = response.data;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
        setToken(token);
        setUser(user);
        return response.data;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        const { token, user } = response.data;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
        setToken(token);
        setUser(user);
        return response.data;
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setToken(null);
        setUser(null);
    };

    const [sampleDataEnabled, setSampleDataEnabled] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sampleDataEnabled');
            if (saved === null) {
                localStorage.setItem('sampleDataEnabled', 'true');
                setSampleDataEnabled(true);
            } else {
                setSampleDataEnabled(saved === 'true');
            }
        }
    }, []);

    const toggleSampleData = () => {
        const newValue = !sampleDataEnabled;
        setSampleDataEnabled(newValue);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sampleDataEnabled', String(newValue));
            window.dispatchEvent(new Event('storage'));
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        sampleDataEnabled,
        toggleSampleData
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

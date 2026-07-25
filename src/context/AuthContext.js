"use client";
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../api/api';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

const getInitialToken = () => {
    if (typeof window !== 'undefined') {
        return Cookies.get('token') || null;
    }
    return null;
};

const getInitialSampleData = () => {
    if (typeof window !== 'undefined') {
        const saved = Cookies.get('sampleDataEnabled');
        return saved === 'true';
    }
    return false;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(getInitialToken);
    const [sampleDataEnabled, setSampleDataEnabled] = useState(getInitialSampleData);

    const loadUser = useCallback(async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data.user);
        } catch (error) {
            // Silently handle
            setToken(null);
            if (typeof window !== 'undefined') {
                Cookies.remove('token');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token, loadUser]);

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        const { token: newToken, user: newUser } = response.data;
        if (typeof window !== 'undefined') {
            Cookies.set('token', newToken, { expires: 7 });
        }
        setToken(newToken);
        setUser(newUser);
        return response.data;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        const { token: newToken, user: newUser } = response.data;
        if (typeof window !== 'undefined') {
            Cookies.set('token', newToken, { expires: 7 });
        }
        setToken(newToken);
        setUser(newUser);
        return response.data;
    };

    const loginWithGoogle = async (credential) => {
        const response = await authAPI.googleAuth(credential);
        const { token: newToken, user: newUser } = response.data;
        if (typeof window !== 'undefined') {
            Cookies.set('token', newToken, { expires: 7 });
        }
        setToken(newToken);
        setUser(newUser);
        return response.data;
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            Cookies.remove('token');
        }
        setToken(null);
        setUser(null);
    };

    const toggleSampleData = () => {
        const newValue = !sampleDataEnabled;
        setSampleDataEnabled(newValue);
        if (typeof window !== 'undefined') {
            Cookies.set('sampleDataEnabled', String(newValue), { expires: 365 });
            window.dispatchEvent(new Event('storage'));
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
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

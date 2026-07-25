"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight, FiGrid } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Auth.css';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email: formData.email, password: formData.password });
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const errorType = params.get('error');
            if (errorType) {
                let userFriendlyError = 'Google authentication failed.';
                if (errorType === 'google_config_missing') {
                    userFriendlyError = 'Google Sign-In is not configured correctly on the server. Please check environment variables.';
                } else if (errorType === 'missing_authorization_code') {
                    userFriendlyError = 'Authorization code was not returned from Google. Please try again.';
                } else if (errorType === 'invalid_google_payload') {
                    userFriendlyError = 'Could not verify your identity with Google.';
                } else if (errorType === 'localstorage_failed') {
                    userFriendlyError = 'Failed to store your authentication session locally. Please enable local storage.';
                } else if (errorType === 'access_denied') {
                    userFriendlyError = 'Access was denied. You cancelled Google Sign-In.';
                } else {
                    userFriendlyError = `Google authentication failed: ${decodeURIComponent(errorType)}`;
                }
                setError(userFriendlyError);
                
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }, []);

    const handleGoogleLogin = () => {
        setError('');
        const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').replace(/['"]/g, '');
        if (!clientId || clientId === 'your_google_client_id.apps.googleusercontent.com') {
            setError('Google Sign-In client ID is not configured in .env file.');
            return;
        }
        
        const redirectUri = `${window.location.origin}/api/auth/callback/google`;
        const scope = 'openid email profile';
        const responseType = 'code';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
        
        window.location.href = authUrl;
    };

    return (
        <div className="auth-container">
            <div className="auth-split-layout">
                {/* Branding Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="auth-branding-panel"
                >
                    <div className="brand-content">
                        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', fontWeight: 'bold' }}>
                            <img src="/favicon.gif" alt="" style={{ width: 50, height: 50, borderRadius: 10 }} />
                            <span>Kibon</span>
                        </div>
                        <h1 className="brand-headline">
                            Manage your pipeline with precision.
                        </h1>
                        <p className="brand-subline">
                            The all-in-one platform for modern sales teams to track, analyze, and close deals faster than ever.
                        </p>

                    </div>
                </motion.div>

                {/* Form Panel */}
                <div className="auth-form-panel">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="auth-form-box"
                    >
                        <div className="auth-header">
                            <h2 className="auth-title">
                                Sign In
                            </h2>
                            <p className="auth-subtitle">
                                Enter your details to access your workspace.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="error-message"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="input-field">
                                <label htmlFor="email">Work Email</label>
                                <div className="input-wrapper">
                                    <FiMail />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="input-styled"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-field">
                                <div className="flex justify-between">
                                    <label htmlFor="password">Password</label>
                                    <button type="button" className="forgot-password" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}>Forgot password?</button>
                                </div>
                                <div className="input-wrapper">
                                    <FiLock />
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className="input-styled"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Processing...' : (
                                    <>
                                        Sign Into Workspace
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="social-login">
                            <div className="social-divider">Or continue with</div>
                            <button
                                type="button"
                                className="social-btn"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                <FcGoogle size={20} />
                                Sign in with Google
                            </button>
                        </div>

                        <div className="auth-footer">
                            New to Kibon?
                            <button
                                className="auth-link"
                                onClick={() => router.push('/register')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Sign Up
                            </button>
                        </div>

                        <div className="auth-legal-footer" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
                            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>Terms & Conditions</Link>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <Link href="/refund-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>Refund Policy</Link>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>Contact Us</Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}


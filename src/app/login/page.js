"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import '@/styles/Auth.css';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) router.push('/dashboard');
    }, [user, router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    // 🟢 Client-Side Google Auth to properly route New vs Existing Users
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Fetch user info from Google
                const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                
                // Send to backend to check if user exists
                const res = await axios.post('/api/auth/google', { 
                    email: userInfo.data.email,
                    firstName: userInfo.data.given_name,
                    lastName: userInfo.data.family_name,
                    picture: userInfo.data.picture
                });

                if (res.data.isNewUser) {
                    // Force new Google users to complete Personal Details
                    sessionStorage.setItem('pendingGoogleAuth', JSON.stringify(userInfo.data));
                    router.push('/register?google=true');
                } else {
                    // Existing User -> Login instantly
                    login(res.data.user, res.data.token);
                    router.push('/dashboard');
                }
            } catch (err) {
                setError('Google authentication failed.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google login was cancelled.')
    });

    return (
        <div className="auth-container">
            <div className="auth-split-layout">
                {/* Branding Panel */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="auth-branding-panel">
                    <div className="auth-logo">
                        <img src="/favicon.gif" alt="Kibon Logo" style={{ width: 42, height: 42, borderRadius: 10 }} />
                        <span>Kibon CRM</span>
                    </div>
                    
                    <div className="brand-content">
                        <h1 className="brand-headline">Grow your business,<br />not your busywork.</h1>
                        <p className="brand-subline">The intelligent workspace for small businesses to organize contacts, close deals, and build lasting customer relationships.</p>

                        <div className="brand-features">
                            <div className="feature-item">
                                <div className="feature-icon"><FiCheckCircle /></div>
                                <span>Track your sales pipeline effortlessly</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><FiCheckCircle /></div>
                                <span>Automate repetitive daily tasks</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><FiCheckCircle /></div>
                                <span>Real-time analytics and reporting</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Form Panel */}
                <div className="auth-form-panel">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-form-box">
                        <div className="auth-header">
                            <h2 className="auth-title">Welcome back</h2>
                            <p className="auth-subtitle">Sign in to your workspace to continue.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="error-message">
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="input-field">
                                <label htmlFor="email">Work Email</label>
                                <div className="input-wrapper">
                                    <FiMail />
                                    <input id="email" type="email" name="email" className="input-styled" placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-field">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label htmlFor="password">Password</label>
                                    <button type="button" className="forgot-password" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
                                </div>
                                <div className="input-wrapper">
                                    <FiLock />
                                    <input id="password" type="password" name="password" className="input-styled" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                </div>
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Signing in...' : <>Sign In <FiArrowRight /></>}
                            </button>
                        </form>

                        <div className="social-login">
                            <div className="social-divider">Or continue with</div>
                            <button type="button" className="social-btn" onClick={() => handleGoogleLogin()} disabled={loading}>
                                <FcGoogle size={20} /> Sign in with Google
                            </button>
                        </div>

                        <div className="auth-footer">
                            New to Kibon? 
                            <button className="auth-link" onClick={() => router.push('/register')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '6px' }}>
                                Create an account
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
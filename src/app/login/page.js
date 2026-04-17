'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiArrowRight, FiGrid } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/Loader';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login, register } = useAuth();

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
            if (isLogin) {
                await login({ email: formData.email, password: formData.password });
            } else {
                await register(formData);
            }
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Loader isLoading={loading} />
            <div className="auth-split-layout">
                {/* Branding Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="auth-branding-panel"
                >
                    <div className="brand-content">
                        <div className="brand-logo-large">
                            <FiGrid /> ModernCRM
                        </div>
                        <h1 className="brand-headline">
                            Sales intelligence, simplified.
                        </h1>
                        <p className="brand-subline">
                            The definitive platform for high-performance teams to scale relationship-driven growth.
                        </p>

                        <div className="testimonial-box" style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                                &quot;The transition to ModernCRM was the best decision for our sales growth. The UI is intuitive and the analytics are groundbreaking.&quot;
                            </p>
                            <div>
                                <strong>Sarah Jenkins</strong>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Head of Sales @ TechFlow</div>
                            </div>
                        </div>
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
                                {isLogin ? 'Welcome back' : 'Get started'}
                            </h2>
                            <p className="auth-subtitle">
                                {isLogin ? 'Enter your credentials to access ModernCRM.' : 'Create your account to start growing.'}
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

                            {!isLogin && (
                                <div className="input-field">
                                    <label>Full Name</label>
                                    <div className="input-wrapper">
                                        <FiUser />
                                        <input
                                            type="text"
                                            name="name"
                                            className="input-styled"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="input-field">
                                <label>Work Email</label>
                                <div className="input-wrapper">
                                    <FiMail />
                                    <input
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
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label>Password</label>
                                    {isLogin && <a href="#" style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600 }}>Forgot?</a>}
                                </div>
                                <div className="input-wrapper">
                                    <FiLock />
                                    <input
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
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            {isLogin ? "Don&apos;t have an account?" : "Already have an account?"}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem', fontWeight: 800, color: 'var(--primary-color)' }}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

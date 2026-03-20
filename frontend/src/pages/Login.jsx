import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight, FiGrid } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Auth.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

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
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
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
                        <div className="brand-logo-large">
                            <FiGrid /> IntWhizz CRM
                        </div>
                        <h1 className="brand-headline">
                            Manage your pipeline with precision.
                        </h1>
                        <p className="brand-subline">
                            The all-in-one platform for modern sales teams to track, analyze, and close deals faster than ever.
                        </p>

                        <div className="testimonial-box">
                            <p className="testimonial-text">
                                "The transition to IntWhizz CRM was the best decision for our sales growth. The UI is intuitive and the analytics are groundbreaking."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-info">
                                    <h5>Sarah Jenkins</h5>
                                    <span>Head of Sales @ TechFlow</span>
                                </div>
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
                                {isLogin ? 'Sign In' : 'Get Started'}
                            </h2>
                            <p className="auth-subtitle">
                                {isLogin ? 'Enter your details to access your workspace.' : 'Create your pro account in seconds.'}
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
                                <div className="flex justify-between">
                                    <label>Password</label>
                                    {isLogin && <a href="#" className="forgot-password">Forgot?</a>}
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
                                        {isLogin ? 'Sign Into Workspace' : 'Create My Account'}
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="social-login">
                            <div className="social-divider">Or continue with</div>
                            <button className="social-btn">
                                <img src="https://www.google.com/favicon.ico" alt="Google" width="16" />
                                Google Account
                            </button>
                        </div>

                        <div className="auth-footer">
                            {isLogin ? "New to IntWhizz CRM?" : "Already have an account?"}
                            <button
                                className="auth-link"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;

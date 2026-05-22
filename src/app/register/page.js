"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight, FiArrowLeft, FiGrid, FiDatabase, FiCheckCircle, FiAlertCircle, FiActivity, FiChevronDown, FiCheck, FiSearch, FiRefreshCw, FiGlobe, FiBriefcase, FiUsers, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '@/styles/Auth.css';



export default function Register() {
    const [isLogin, setIsLogin] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    
    const [businessDetails, setBusinessDetails] = useState({
        companyName: '',
        industry: 'Technology',
        website: '',
        employeeCount: '1-10'
    });

    const [connectionDetails, setConnectionDetails] = useState({
        backend_url: '',
        api_key: ''
    });

    const [connectionTestStatus, setConnectionTestStatus] = useState(null);
    const [testingConnection, setTestingConnection] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const { login, register, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const isGoogleOnboarding = params.get('google') === 'true';
            if (user && !isGoogleOnboarding) {
                router.push('/dashboard');
            }
        } else if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    useEffect(() => {
        const cleanClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').replace(/['"]/g, '');
        console.log("Client Id in Register: ", cleanClientId);
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const isGoogleOnboarding = params.get('google') === 'true';
            const stepParam = params.get('step');
            if (isGoogleOnboarding || stepParam === '2') {
                setStep(2);
            }
            
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

    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const isGoogleOnboarding = params.get('google') === 'true';
            if (isGoogleOnboarding) {
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    email: user.email || ''
                }));
            }
        }
    }, [user]);

    const handleGoogleLogin = () => {
        setError('');
        const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').replace(/['"]/g, '');
        console.log("Client Id in Register: ", clientId);
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleBusinessChange = (e) => {
        setBusinessDetails({
            ...businessDetails,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleConnectionChange = (e) => {
        setConnectionDetails({
            ...connectionDetails,
            [e.target.name]: e.target.value
        });
        setError('');
        setConnectionTestStatus(null);
    };

    const handleTestConnection = async () => {
        setError('');
        setTestingConnection(true);
        setConnectionTestStatus(null);
        try {
            const response = await axios.post('/api/auth/test-connection', connectionDetails);
            setConnectionTestStatus({
                success: true,
                message: response.data.message || 'Backend connection test succeeded!'
            });
        } catch (err) {
            setConnectionTestStatus({
                success: false,
                message: err.response?.data?.error || err.message || 'Backend connection failed.'
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            setLoading(true);
            try {
                await login({ email: formData.email, password: formData.password });
                router.push('/dashboard');
            } catch (err) {
                setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
            } finally {
                setLoading(false);
            }
        } else {
            // Registration steps navigation
            if (step === 1) {
                if (!formData.name || !formData.email || !formData.password) {
                    setError('Please fill in all account details.');
                    return;
                }
                setStep(2);
            } else if (step === 2) {
                if (!businessDetails.companyName) {
                    setError('Company name is required.');
                    return;
                }
                setStep(3);
            }
        }
    };

    const handleRegisterSubmit = async (skipConnection = false) => {
        setError('');
        setLoading(true);
        try {
            const params = new URLSearchParams(window.location.search);
            const isGoogleOnboarding = params.get('google') === 'true';

            if (isGoogleOnboarding) {
                // Since user already exists from Google SSO, we save crm_settings manually
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Save Company Details
                const employeeCountMap = {
                    '1-10': 10,
                    '11-50': 50,
                    '51-200': 200,
                    '201-500': 500,
                    '501+': 1000
                };
                const empCount = employeeCountMap[businessDetails.employeeCount] || 0;

                await axios.post('/api/settings/company', {
                    company_name: businessDetails.companyName,
                    industry: businessDetails.industry,
                    website: businessDetails.website,
                    employee_count: empCount
                }, { headers });

                // 2. Save Connection Details
                await axios.post('/api/settings/connection', {
                    backend_url: skipConnection ? '' : connectionDetails.backend_url,
                    api_key: skipConnection ? '' : connectionDetails.api_key,
                    backend_connected: skipConnection ? 0 : 1
                }, { headers });
            } else {
                // Normal registration
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    businessDetails,
                    connectionDetails: skipConnection ? null : connectionDetails,
                    skipConnection
                });
            }
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('sampleDataEnabled', skipConnection ? 'true' : 'false');
                window.dispatchEvent(new Event('storage'));
            }
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Registration failed.');
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
                            <FiGrid /> ModernCRM
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
                                Create Account (Step {step}/3)
                            </h2>
                            <p className="auth-subtitle">
                                {step === 1 
                                    ? 'Create your account credentials.' 
                                    : step === 2 
                                        ? 'Provide your business details.' 
                                        : 'Connect your application database.'}
                            </p>
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
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
                                                required
                                            />
                                        </div>
                                    </div>

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
                                        <label>Password</label>
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

                                    <button type="submit" className="auth-btn">
                                        Continue to Business Details
                                        <FiArrowRight />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                                    <div className="flex flex-col gap-4">
                                        <div className="input-field">
                                            <label>Company Name *</label>
                                            <div className="input-wrapper">
                                                <FiGrid />
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    className="input-styled"
                                                    placeholder="Acme Corp"
                                                    value={businessDetails.companyName}
                                                    onChange={handleBusinessChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="input-field">
                                            <label>Website URL</label>
                                            <div className="input-wrapper">
                                                <FiGlobe />
                                                <input
                                                    type="url"
                                                    name="website"
                                                    className="input-styled"
                                                    placeholder="https://acme.com"
                                                    value={businessDetails.website}
                                                    onChange={handleBusinessChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-field">
                                            <label>Industry</label>
                                            <div className="input-wrapper">
                                                <FiBriefcase />
                                                <select
                                                    name="industry"
                                                    className="input-styled"
                                                    value={businessDetails.industry}
                                                    onChange={handleBusinessChange}
                                                    style={{ appearance: 'none', cursor: 'pointer' }}
                                                >
                                                    <option value="Technology">Technology</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="Healthcare">Healthcare</option>
                                                    <option value="Retail">Retail</option>
                                                    <option value="Manufacturing">Manufacturing</option>
                                                    <option value="Education">Education</option>
                                                    <option value="Services">Services</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                
                                            </div>
                                        </div>

                                        <div className="input-field">
                                            <label>Employee Count</label>
                                            <div className="input-wrapper">
                                                <FiUsers />
                                                <select
                                                    name="employeeCount"
                                                    className="input-styled"
                                                    value={businessDetails.employeeCount}
                                                    onChange={handleBusinessChange}
                                                    style={{ appearance: 'none', cursor: 'pointer' }}
                                                >
                                                    <option value="1-10">1-10 Employees</option>
                                                    <option value="11-50">11-50 Employees</option>
                                                    <option value="51-200">51-200 Employees</option>
                                                    <option value="201-500">201-500 Employees</option>
                                                    <option value="501+">501+ Employees</option>
                                                </select>
                                                
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-6">
                                        <button type="button" className="btn btn-secondary w-full" onClick={() => setStep(1)}>
                                            <FiArrowLeft /> Back
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary w-full"
                                            disabled={!businessDetails.companyName}
                                        >
                                            Next <FiArrowRight />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="flex flex-col gap-4 mb-4">
                                        <div className="input-field">
                                            <label>Backend URL</label>
                                            <div className="input-wrapper">
                                                <FiDatabase />
                                                <input
                                                    type="text"
                                                    name="backend_url"
                                                    className="input-styled"
                                                    placeholder="https://your-backend.com/api"
                                                    value={connectionDetails.backend_url}
                                                    onChange={handleConnectionChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-field">
                                            <label>API Key</label>
                                            <div className="input-wrapper">
                                                <FiLock />
                                                <input
                                                    type={showApiKey ? "text" : "password"}
                                                    name="api_key"
                                                    className="input-styled"
                                                    placeholder="Enter API Key"
                                                    value={connectionDetails.api_key}
                                                    onChange={handleConnectionChange}
                                                    style={{ paddingRight: '4.5rem' }}
                                                />
                                                <div className="flex items-center gap-1" style={{ position: 'absolute', right: '0.75rem', zIndex: 10 }}>
                                                    {connectionDetails.api_key && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(connectionDetails.api_key);
                                                                setCopied(true);
                                                                setTimeout(() => setCopied(false), 2000);
                                                            }}
                                                            style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'var(--text-muted)',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            title="Copy API Key"
                                                        >
                                                            {copied ? <FiCheckCircle style={{ color: 'var(--success)' }} /> : <FiCopy />}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowApiKey(!showApiKey)}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'var(--text-muted)',
                                                            transition: 'color 0.2s'
                                                        }}
                                                        title={showApiKey ? "Hide API Key" : "Show API Key"}
                                                    >
                                                        {showApiKey ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {connectionTestStatus && (
                                        <div className={`p-3 rounded mb-4 text-sm flex items-center gap-2 ${connectionTestStatus.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                            {connectionTestStatus.success ? <FiCheckCircle /> : <FiAlertCircle />}
                                            <span>{connectionTestStatus.message}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2 mb-4">
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-full flex items-center justify-center gap-2"
                                            onClick={() => {
                                                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                                                let newKey = 'crm_key_';
                                                for (let i = 0; i < 32; i++) {
                                                    newKey += characters.charAt(Math.floor(Math.random() * characters.length));
                                                }
                                                setConnectionDetails(prev => ({
                                                    ...prev,
                                                    api_key: newKey,
                                                    backend_url: prev.backend_url || (typeof window !== 'undefined' ? window.location.origin : '')
                                                }));
                                            }}
                                            style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                        >
                                            Generate API Key
                                        </button>

                                        {connectionDetails.backend_url && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary w-full"
                                                    onClick={handleTestConnection}
                                                    disabled={testingConnection}
                                                >
                                                    {testingConnection ? 'Testing...' : 'Test Connection'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary w-full"
                                                    onClick={() => handleRegisterSubmit(false)}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Connecting...' : 'Connect CRM Backend'}
                                                </button>
                                            </>
                                        )}

                                        <button
                                            type="button"
                                            className="btn btn-outline w-full"
                                            onClick={() => handleRegisterSubmit(true)}
                                            disabled={loading}
                                            style={{ borderStyle: 'dashed', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                        >
                                            Skip Setup (Add API Key Later)
                                        </button>
                                    </div>

                                    <button type="button" className="btn btn-ghost w-full" onClick={() => setStep(2)}>
                                        <FiArrowLeft /> Back to Business Details
                                    </button>
                                </motion.div>
                            )}

                        </form>

                        {step === 1 && (
                            <div className="social-login">
                                <div className="social-divider">Or continue with</div>
                                <button
                                    type="button"
                                    className="social-btn"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <FcGoogle size={20} />
                                    Sign up with Google
                                </button>
                            </div>
                        )}

                        <div className="auth-footer">
                            Already have an account?
                            <button
                                className="auth-link"
                                onClick={() => router.push('/login')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

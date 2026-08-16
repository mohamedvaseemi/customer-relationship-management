"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
    FiMail, FiLock, FiUser, FiArrowRight, FiArrowLeft, 
    FiGrid, FiBriefcase, FiUsers, FiAlertCircle 
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Cookies from 'js-cookie';
import '@/styles/Auth.css';

export default function Register() {
    const [step, setStep] = useState(1);
    const [accountType, setAccountType] = useState('company'); // 'individual' or 'company'
    
    // Core User Data
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    
    // Workspace Data
    const [workspace, setWorkspace] = useState({ companyName: '', industry: 'Technology', employeeCount: '1-10', phone: '' });
    
    const [isGoogleOnboarding, setIsGoogleOnboarding] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }

        // Check if user was redirected from Login page via Google
        const pendingGoogle = sessionStorage.getItem('pendingGoogleAuth');
        if (pendingGoogle) {
            const googleData = JSON.parse(pendingGoogle);
            setFormData(prev => ({
                ...prev,
                name: `${googleData.given_name} ${googleData.family_name}`,
                email: googleData.email
            }));
            setIsGoogleOnboarding(true);
            setStep(1); // Force them to choose Account Type first
        }
    }, [user, router]);

    // Google Auth executed inside Register Page
    const handleGoogleRegister = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                
                setFormData(prev => ({
                    ...prev,
                    name: `${userInfo.data.given_name} ${userInfo.data.family_name}`,
                    email: userInfo.data.email,
                    password: '' // Explicitly clear password as it's not needed for Google
                }));
                
                setIsGoogleOnboarding(true);
                setStep(3); // Skip credentials and jump directly to Workspace setup
            } catch (err) {
                setError('Google signup failed. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    });

    const handleNext = (e) => {
        if (e) e.preventDefault();
        setError('');
        
        if (step === 1) {
            // After Account Type selection, check if Google was already authenticated
            if (isGoogleOnboarding) {
                setStep(3); // Skip Step 2 entirely
            } else {
                setStep(2); // Proceed to manual credentials
            }
        } else if (step === 2) {
            // Validate manual credentials
            if (!formData.name || !formData.email || !formData.password) {
                return setError('Please fill all required credentials.');
            }
            if (formData.password.length < 6) {
                return setError('Password must be at least 6 characters.');
            }
            setStep(3);
        }
    };

    const handleBack = () => {
        setError('');
        if (step === 3) {
            // If they are on step 3 via Google, back takes them to step 1
            if (isGoogleOnboarding) setStep(1);
            else setStep(2);
        } else if (step === 2) {
            setStep(1);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        setLoading(true);

        // Validation for company name
        if (accountType === 'company' && !workspace.companyName.trim()) {
            setLoading(false);
            return setError('Company name is required for Business accounts.');
        }

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: isGoogleOnboarding ? null : formData.password,
                isGoogleAuth: isGoogleOnboarding,
                accountType,
                companyName: accountType === 'individual' ? 'Independent Developer' : workspace.companyName,
                industry: workspace.industry,
                employeeCount: workspace.employeeCount,
                phone: workspace.phone
            };

            const response = await axios.post('/api/auth/register', payload);
            
            // Set session successfully
            Cookies.set('token', response.data.token, { expires: 7 });
            localStorage.setItem('user', JSON.stringify(response.data.user));
            sessionStorage.removeItem('pendingGoogleAuth');
            
            // Initialize system with sample data settings
            Cookies.set('sampleDataEnabled', 'true', { expires: 365 }); 
            
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Registration failed.');
            setLoading(false);
        }
    };

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
                        <h1 className="brand-headline">Set up your workspace.</h1>
                        <p className="brand-subline">Join thousands of businesses and independent developers who trust Kibon to manage their pipeline.</p>
                        <div className="brand-features" style={{ marginTop: '2rem' }}>
                            <div className="feature-item"><div className="feature-icon">1</div><span>Select Account Type</span></div>
                            <div className="feature-item"><div className="feature-icon">2</div><span>Secure Credentials</span></div>
                            <div className="feature-item"><div className="feature-icon">3</div><span>Workspace Details</span></div>
                        </div>
                    </div>
                </motion.div>

                {/* Form Panel */}
                <div className="auth-form-panel registration-panel">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-form-box">
                        
                        <div className="auth-header">
                            <h2 className="auth-title">Create Account</h2>
                            <p className="auth-subtitle">
                                {step === 1 ? 'How will you be using Kibon?' : step === 2 ? 'Set up your credentials.' : 'Tell us about your workspace.'}
                            </p>
                        </div>

                        {/* Step Progress Indicator */}
                        <div className="step-indicator">
                            <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}></div>
                            <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}></div>
                            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                        </div>

                        {error && <div className="error-message"><FiAlertCircle /> {error}</div>}

                        <form onSubmit={step === 3 ? handleRegisterSubmit : handleNext} className="auth-form">
                            <AnimatePresence mode="wait">
                                
                                {/* STEP 1: ACCOUNT TYPE */}
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                                        <div className="account-type-grid">
                                            <button type="button" className={`type-card ${accountType === 'individual' ? 'active' : ''}`} onClick={() => setAccountType('individual')}>
                                                <FiUser className="type-icon" />
                                                <div className="type-info">
                                                    <h4>Independent Developer</h4>
                                                    <p>I'm working solo</p>
                                                </div>
                                            </button>
                                            <button type="button" className={`type-card ${accountType === 'company' ? 'active' : ''}`} onClick={() => setAccountType('company')}>
                                                <FiBriefcase className="type-icon" />
                                                <div className="type-info">
                                                    <h4>Company / Team</h4>
                                                    <p>I represent a business</p>
                                                </div>
                                            </button>
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full mt-4">
                                            Continue <FiArrowRight />
                                        </button>
                                    </motion.div>
                                )}

                                {/* STEP 2: CREDENTIALS (Skipped if Google Auth is active) */}
                                {step === 2 && !isGoogleOnboarding && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                                        <div className="input-field">
                                            <label>Full Name *</label>
                                            <div className="input-wrapper">
                                                <FiUser />
                                                <input type="text" className="input-styled" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                            </div>
                                        </div>
                                        <div className="input-field">
                                            <label>Work Email *</label>
                                            <div className="input-wrapper">
                                                <FiMail />
                                                <input type="email" className="input-styled" placeholder="name@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                            </div>
                                        </div>
                                        
                                        <div className="input-field">
                                            <label>Password *</label>
                                            <div className="input-wrapper">
                                                <FiLock />
                                                <input type="password" className="input-styled" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button type="button" className="btn btn-secondary w-full" onClick={handleBack}>
                                                <FiArrowLeft /> Back
                                            </button>
                                            <button type="submit" className="btn btn-primary w-full">
                                                Next Step <FiArrowRight />
                                            </button>
                                        </div>

                                        {/* Google Signup Button */}
                                        <div className="social-login">
                                            <div className="social-divider">Or skip manual entry with</div>
                                            <button type="button" className="social-btn" onClick={() => handleGoogleRegister()} disabled={loading}>
                                                {loading ? 'Connecting...' : <><FcGoogle size={20} /> Sign up with Google</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: WORKSPACE DETAILS */}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                                        
                                        {/* Greeting for Google Users */}
                                        {isGoogleOnboarding && (
                                            <div style={{ padding: '0.8rem', background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                <strong>Welcome, {formData.name}!</strong> Your Google account is verified. Just complete your workspace details below.
                                            </div>
                                        )}

                                        {accountType === 'company' && (
                                            <div className="input-field">
                                                <label>Company Name *</label>
                                                <div className="input-wrapper">
                                                    <FiGrid />
                                                    <input type="text" className="input-styled" placeholder="Acme Corp" value={workspace.companyName} onChange={e => setWorkspace({...workspace, companyName: e.target.value})} required />
                                                </div>
                                            </div>
                                        )}

                                        <div className="input-field">
                                            <label>Phone Number (Optional)</label>
                                            <div className="input-wrapper">
                                                <FiBriefcase />
                                                <input type="text" className="input-styled" placeholder="+1 (555) 000-0000" value={workspace.phone} onChange={e => setWorkspace({...workspace, phone: e.target.value})} />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                            <div className="input-field" style={{ flex: 1 }}>
                                                <label>Industry</label>
                                                <div className="input-wrapper">
                                                    <select className="input-styled" value={workspace.industry} onChange={e => setWorkspace({...workspace, industry: e.target.value})}>
                                                        <option value="Technology">Software / IT</option>
                                                        <option value="E-Commerce">E-Commerce</option>
                                                        <option value="Agency">Agency / Services</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {accountType === 'company' && (
                                                <div className="input-field" style={{ flex: 1 }}>
                                                    <label>Employees</label>
                                                    <div className="input-wrapper">
                                                        <FiUsers />
                                                        <select className="input-styled" value={workspace.employeeCount} onChange={e => setWorkspace({...workspace, employeeCount: e.target.value})}>
                                                            <option value="1-10">1-10</option>
                                                            <option value="11-50">11-50</option>
                                                            <option value="51-200">51-200</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack} disabled={loading}>
                                                <FiArrowLeft /> Back
                                            </button>
                                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                                                {loading ? 'Setting up Workspace...' : 'Complete Registration'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        <div className="auth-footer" style={{ marginTop: '2rem' }}>
                            Already have an account? <Link href="/login" className="auth-link">Sign In</Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
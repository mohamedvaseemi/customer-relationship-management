"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiBriefcase, FiArrowRight, FiPhone } from 'react-icons/fi';
import Cookies from 'js-cookie';
import '@/styles/Auth.css';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [accountType, setAccountType] = useState('individual'); // 'individual' or 'company'
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        companyName: '',
        phone: '',
        password: '',
        isGoogleAuth: false
    });

    useEffect(() => {
        // Load pending registration data from sessionStorage
        const pendingData = sessionStorage.getItem('pendingRegistration');
        if (pendingData) {
            const parsed = JSON.parse(pendingData);
            setFormData(prev => ({ ...prev, ...parsed }));
        } else {
            router.push('/register'); // Redirect to register if no data found
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (accountType === 'company' && !formData.companyName.trim()) {
            setError('Please enter your company name.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, accountType })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to complete setup');

            // Success: Set token and redirect
            Cookies.set('token', data.token, { expires: 7 });
            localStorage.setItem('user', JSON.stringify(data.user));
            sessionStorage.removeItem('pendingRegistration');
            
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-split-layout">
                {/* Left Branding */}
                <div className="auth-branding-panel">
                    <div className="brand-content">
                        <div className="auth-logo">Kibon CRM</div>
                        <h1 className="brand-headline">Just one last step.</h1>
                        <p className="brand-subline">Tell us a bit about how you'll be using Kibon so we can tailor your workspace.</p>
                    </div>
                </div>

                {/* Right Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-box" style={{ maxWidth: '480px' }}>
                        <div className="auth-header">
                            <h2 className="auth-title">Complete your profile</h2>
                            <p className="auth-subtitle">Welcome aboard, {formData.firstName}!</p>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Account Type Selector */}
                            <div className="input-field">
                                <label>How will you use Kibon?</label>
                                <div className="account-type-grid">
                                    <button 
                                        type="button"
                                        className={`type-card ${accountType === 'individual' ? 'active' : ''}`}
                                        onClick={() => setAccountType('individual')}
                                    >
                                        <FiUser className="type-icon" />
                                        <div className="type-info">
                                            <h4>Individual Developer</h4>
                                            <p>I'm working solo</p>
                                        </div>
                                    </button>
                                    <button 
                                        type="button"
                                        className={`type-card ${accountType === 'company' ? 'active' : ''}`}
                                        onClick={() => setAccountType('company')}
                                    >
                                        <FiBriefcase className="type-icon" />
                                        <div className="type-info">
                                            <h4>Company / Team</h4>
                                            <p>I represent a business</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {accountType === 'company' && (
                                <div className="input-field animate-fade-in">
                                    <label>Company Name *</label>
                                    <div className="input-wrapper">
                                        <FiBriefcase />
                                        <input 
                                            type="text" 
                                            className="input-styled" 
                                            placeholder="e.g. Acme Corp"
                                            value={formData.companyName}
                                            onChange={e => setFormData({...formData, companyName: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="input-field">
                                <label>Phone Number (Optional)</label>
                                <div className="input-wrapper">
                                    <FiPhone />
                                    <input 
                                        type="tel" 
                                        className="input-styled" 
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                                {loading ? 'Setting up workspace...' : <>Go to Dashboard <FiArrowRight /></>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
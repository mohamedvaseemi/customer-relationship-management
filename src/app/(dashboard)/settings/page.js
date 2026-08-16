"use client";
import { useState, useEffect, useCallback } from 'react';
import { 
    FiUser, FiLock, FiBriefcase, FiBell, 
    FiKey, FiCheck, FiCopy, FiRefreshCw, 
    FiAlertTriangle, FiTrash2, FiShield, FiGlobe, FiBox
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import '@/styles/Settings.css';

const TABS = [
    { id: 'profile', label: 'My Profile', icon: FiUser, desc: 'Personal details and credentials' },
    { id: 'security', label: 'Security & Auth', icon: FiLock, desc: 'Password and session management' },
    { id: 'organization', label: 'Organization', icon: FiBriefcase, desc: 'Company workspace & billing metadata' },
    { id: 'notifications', label: 'Notifications', icon: FiBell, desc: 'Alert channels and dispatch rules' },
    { id: 'sandbox', label: 'Sandbox & Data', icon: FiBox, desc: 'Simulated data & data purging' }, // NEW TAB
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const { sampleDataEnabled, toggleSampleData } = useAuth();

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        title: 'Senior Account Executive',
        timezone: 'Asia/Kolkata (GMT+5:30)'
    });

    // Password State
    const [security, setSecurity] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
        two_factor: false
    });

    // Organization State
    const [org, setOrg] = useState({
        name: 'Kibon Technologies Inc.',
        domain: 'kibon.io',
        industry: 'Enterprise Software & SaaS',
        currency: 'USD ($)',
        timezone: 'UTC+05:30'
    });

    // Notification Toggles
    const [notifRules, setNotifRules] = useState({
        inboundLeads: true,
        dealWon: true,
        ticketEscalation: true,
        emailDailyDigest: false,
        slackWebhookAlerts: true
    });

    // API Keys State
    const [apiKey, setApiKey] = useState('kib_live_9a7d8e6f1c2b3a4d5e6f7a8b9c0d1e2f');
    const [keyCopied, setKeyCopied] = useState(false);

    const triggerToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
    };

    // Fetch Profile details
    const fetchUserData = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/settings/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.user) {
                setProfile(prev => ({
                    ...prev,
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    role: data.user.role || 'user'
                }));
            }
        } catch (err) {
            console.error('Failed to load profile settings:', err);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Handle Profile Save
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: profile.name, phone: profile.phone })
            });
            if (!res.ok) throw new Error('Failed to update profile');
            triggerToast('success', 'Profile information updated successfully!');
        } catch (err) {
            triggerToast('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    // Handle Password Update
    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (security.new_password !== security.confirm_password) {
            return triggerToast('error', 'New passwords do not match');
        }
        if (security.new_password.length < 6) {
            return triggerToast('error', 'Password must be at least 6 characters');
        }

        setSaving(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/settings/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    current_password: security.current_password,
                    new_password: security.new_password
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Password update failed');
            triggerToast('success', 'Password changed successfully!');
            setSecurity({ current_password: '', new_password: '', confirm_password: '', two_factor: security.two_factor });
        } catch (err) {
            triggerToast('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    // Copy API Key
    const handleCopyKey = () => {
        navigator.clipboard.writeText(apiKey);
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
    };

    // Rotate Key
    const handleRotateKey = () => {
        const rand = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0')).join('');
        setApiKey(`kib_live_${rand}`);
        triggerToast('success', 'New secret API key generated!');
    };

    return (
        <div className="settings-shell">
            {/* Page Header */}
            <div className="settings-page-header">
                <div>
                    <h1 className="settings-heading">System Settings</h1>
                    <p className="settings-subheading">Configure your personal preferences, security, team organization, and integrations</p>
                </div>
            </div>

            {/* Toast Feedback */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className={`settings-toast ${toast.type}`}
                    >
                        {toast.type === 'success' ? <FiCheck /> : <FiAlertTriangle />}
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Dual-Column Grid */}
            <div className="settings-layout">
                
                {/* Left Navigation Sub-Menu */}
                <aside className="settings-nav">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`settings-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <div className="nav-icon-box">
                                    <Icon size={18} />
                                </div>
                                <div className="nav-label-box">
                                    <span className="nav-label">{tab.label}</span>
                                    <span className="nav-desc">{tab.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </aside>

                {/* Right Content Panels */}
                <main className="settings-panels">
                    
                    {/* TAB 1: Profile */}
                    {activeTab === 'profile' && (
                        <div className="settings-card">
                            <div className="card-top-bar">
                                <div>
                                    <h2 className="card-title">Personal Profile</h2>
                                    <p className="card-subtitle">Manage how your name and identity appear across deals, tickets, and team chat</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="settings-form-flow">
                                
                                {/* Avatar Banner Row */}
                                <div className="profile-hero-row">
                                    <div className="hero-avatar-circle">
                                        {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'U'}
                                    </div>
                                    <div className="hero-user-details">
                                        <h3 className="hero-user-name">{profile.name || 'Mohamed Vaseem'}</h3>
                                        <div className="hero-badge-group">
                                            <span className="badge-role">{profile.role.toUpperCase()}</span>
                                            <span className="badge-status">Active Workspace Member</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-grid-2">
                                    <div className="field-block">
                                        <label className="field-label">Full Name *</label>
                                        <input 
                                            type="text" 
                                            className="field-input" 
                                            value={profile.name} 
                                            onChange={e => setProfile({ ...profile, name: e.target.value })} 
                                            required 
                                        />
                                    </div>

                                    <div className="field-block">
                                        <label className="field-label">Email Address (Read-only)</label>
                                        <input 
                                            type="email" 
                                            className="field-input readonly" 
                                            value={profile.email} 
                                            disabled 
                                        />
                                    </div>
                                </div>

                                <div className="settings-grid-2">
                                    <div className="field-block">
                                        <label className="field-label">Phone Number</label>
                                        <input 
                                            type="text" 
                                            className="field-input" 
                                            placeholder="+91 98765 43210" 
                                            value={profile.phone} 
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })} 
                                        />
                                    </div>

                                    <div className="field-block">
                                        <label className="field-label">Job Title</label>
                                        <input 
                                            type="text" 
                                            className="field-input" 
                                            value={profile.title} 
                                            onChange={e => setProfile({ ...profile, title: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                <div className="form-submit-footer">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving Changes...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 2: Security & Password */}
                    {activeTab === 'security' && (
                        <div className="settings-card">
                            <div className="card-top-bar">
                                <div>
                                    <h2 className="card-title">Security & Credentials</h2>
                                    <p className="card-subtitle">Protect your account with a secure authentication password and 2FA</p>
                                </div>
                            </div>

                            <form onSubmit={handleSecuritySubmit} className="settings-form-flow">
                                <div className="field-block">
                                    <label className="field-label">Current Password *</label>
                                    <input 
                                        type="password" 
                                        className="field-input" 
                                        placeholder="••••••••••••" 
                                        value={security.current_password} 
                                        onChange={e => setSecurity({ ...security, current_password: e.target.value })} 
                                        required 
                                    />
                                </div>

                                <div className="settings-grid-2">
                                    <div className="field-block">
                                        <label className="field-label">New Password *</label>
                                        <input 
                                            type="password" 
                                            className="field-input" 
                                            placeholder="Minimum 6 characters" 
                                            value={security.new_password} 
                                            onChange={e => setSecurity({ ...security, new_password: e.target.value })} 
                                            required 
                                        />
                                    </div>

                                    <div className="field-block">
                                        <label className="field-label">Confirm New Password *</label>
                                        <input 
                                            type="password" 
                                            className="field-input" 
                                            placeholder="Re-enter password" 
                                            value={security.confirm_password} 
                                            onChange={e => setSecurity({ ...security, confirm_password: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="security-extra-card">
                                    <div className="extra-info">
                                        <FiShield className="extra-icon text-indigo" />
                                        <div>
                                            <h4 className="extra-title">Two-Factor Authentication (2FA)</h4>
                                            <p className="extra-desc">Enforce TOTP authenticator code verification on every login attempt.</p>
                                        </div>
                                    </div>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={security.two_factor} 
                                            onChange={e => setSecurity({ ...security, two_factor: e.target.checked })} 
                                        />
                                        <span className="slider" />
                                    </label>
                                </div>

                                <div className="form-submit-footer">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 3: Organization */}
                    {activeTab === 'organization' && (
                        <div className="settings-card">
                            <div className="card-top-bar">
                                <div>
                                    <h2 className="card-title">Organization Workspace</h2>
                                    <p className="card-subtitle">Manage company domain, default billing currency, and multi-tenant configurations</p>
                                </div>
                            </div>

                            <div className="settings-form-flow">
                                <div className="settings-grid-2">
                                    <div className="field-block">
                                        <label className="field-label">Company / Brand Name</label>
                                        <input 
                                            type="text" 
                                            className="field-input" 
                                            value={org.name} 
                                            onChange={e => setOrg({ ...org, name: e.target.value })} 
                                        />
                                    </div>

                                    <div className="field-block">
                                        <label className="field-label">Primary Domain</label>
                                        <input 
                                            type="text" 
                                            className="field-input" 
                                            value={org.domain} 
                                            onChange={e => setOrg({ ...org, domain: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                <div className="settings-grid-2">
                                    <div className="field-block">
                                        <label className="field-label">Industry Sector</label>
                                        <select 
                                            className="field-input" 
                                            value={org.industry} 
                                            onChange={e => setOrg({ ...org, industry: e.target.value })}
                                        >
                                            <option value="Enterprise Software & SaaS">Enterprise Software & SaaS</option>
                                            <option value="Fintech & Banking">Fintech & Banking</option>
                                            <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                                            <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                                        </select>
                                    </div>

                                    <div className="field-block">
                                        <label className="field-label">Default Deal Currency</label>
                                        <select 
                                            className="field-input" 
                                            value={org.currency} 
                                            onChange={e => setOrg({ ...org, currency: e.target.value })}
                                        >
                                            <option value="USD ($)">USD ($) - United States Dollar</option>
                                            <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                                            <option value="EUR (€)">EUR (€) - Euro</option>
                                            <option value="GBP (£)">GBP (£) - British Pound</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-submit-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={() => triggerToast('success', 'Organization workspace updated!')}
                                    >
                                        Save Organization
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="settings-card">
                            <div className="card-top-bar">
                                <div>
                                    <h2 className="card-title">Notification Channels & Triggers</h2>
                                    <p className="card-subtitle">Choose which CRM events deliver immediate popups, emails, or sound pings</p>
                                </div>
                            </div>

                            <div className="toggle-flow-list">
                                <div className="toggle-row-box">
                                    <div>
                                        <h4 className="toggle-heading">Inbound Lead Assignments</h4>
                                        <p className="toggle-caption">Notify in real-time when an incoming lead from web forms or API is routed to you.</p>
                                    </div>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifRules.inboundLeads} 
                                            onChange={e => setNotifRules({ ...notifRules, inboundLeads: e.target.checked })} 
                                        />
                                        <span className="slider" />
                                    </label>
                                </div>

                                <div className="toggle-row-box">
                                    <div>
                                        <h4 className="toggle-heading">Deals Won Pipeline Celebrations</h4>
                                        <p className="toggle-caption">Trigger confetti and a team feed broadcast when a deal closes successfully.</p>
                                    </div>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifRules.dealWon} 
                                            onChange={e => setNotifRules({ ...notifRules, dealWon: e.target.checked })} 
                                        />
                                        <span className="slider" />
                                    </label>
                                </div>

                                <div className="toggle-row-box">
                                    <div>
                                        <h4 className="toggle-heading">Service Desk Urgent Escalations</h4>
                                        <p className="toggle-caption">Send high-priority alerts when tickets marked as 'Urgent' exceed SLA response times.</p>
                                    </div>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifRules.ticketEscalation} 
                                            onChange={e => setNotifRules({ ...notifRules, ticketEscalation: e.target.checked })} 
                                        />
                                        <span className="slider" />
                                    </label>
                                </div>

                                <div className="toggle-row-box">
                                    <div>
                                        <h4 className="toggle-heading">Daily Email Performance Digest</h4>
                                        <p className="toggle-caption">Receive a morning 8:00 AM summary of pending calls, overdue tasks, and daily quotas.</p>
                                    </div>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifRules.emailDailyDigest} 
                                            onChange={e => setNotifRules({ ...notifRules, emailDailyDigest: e.target.checked })} 
                                        />
                                        <span className="slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sandbox' && (
                        <div className="settings-card">
                            <div className="card-top-bar">
                                <div>
                                    <h2 className="card-title">Sandbox Environment</h2>
                                    <p className="card-subtitle">Safely test features using simulated data without affecting your real workspace.</p>
                                </div>
                            </div>

                            <div className="settings-form-flow">
                                {/* The Sandbox Toggle */}
                                <div className="toggle-row-box">
                                    <div>
                                        <h4 className="toggle-heading">Enable Sandbox (Sample Data)</h4>
                                        <p className="toggle-caption">Fills your pipelines, leads, and charts with dummy data for presentation and testing.</p>
                                    </div>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={sampleDataEnabled} 
                                            onChange={toggleSampleData} 
                                        />
                                        <span className="slider" />
                                    </label>
                                </div>

                                {/* Danger Zone Purge */}
                                <div className="danger-zone-card">
                                    <div className="danger-left">
                                        <h4 className="danger-title">Delete Workspace & Purge Records</h4>
                                        <p className="danger-desc">Permanently remove all contacts, deals, documents, and tickets associated with this real instance.</p>
                                    </div>
                                    <button type="button" className="btn-danger-outline" onClick={() => setDeleteModalOpen(true)}>
                                        <FiTrash2 /> Purge Workspace
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Confirm Danger Modal */}
            <ConfirmModal 
                isOpen={deleteModalOpen}
                title="Purge CRM Workspace Data?"
                message="Are you completely sure? This action will permanently remove all company pipelines, contacts, and tickets. This cannot be undone."
                onConfirm={() => triggerToast('error', 'Workspace purge is restricted to Root Administrators.')}
                onCancel={() => setDeleteModalOpen(false)}
                confirmText="Yes, purge everything"
            />
        </div>
    );
}
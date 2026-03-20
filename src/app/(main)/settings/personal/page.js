'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { motion } from 'framer-motion';
import {
    FiUser, FiBriefcase, FiPhone, FiMapPin, FiGlobe, FiBell,
    FiLock, FiSave, FiCamera, FiChevronRight
} from 'react-icons/fi';
import './personal.css';

const AVATAR_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#f59e0b', '#10b981', '#0ea5e9',
    '#3b82f6', '#14b8a6', '#06b6d4', '#84cc16'
];

const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Singapore',
    'Australia/Sydney', 'Pacific/Auckland'
];

const SECTIONS = [
    { id: 'profile', label: 'Profile Info', icon: FiUser },
    { id: 'work', label: 'Work Details', icon: FiBriefcase },
    { id: 'regional', label: 'Regional', icon: FiGlobe },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiLock },
];

export default function PersonalSettingsPage() {
    const { user, token, refreshUser } = useAuth();
    const toast = useToast();
    const [activeSection, setActiveSection] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [migrating, setMigrating] = useState(false);

    const [profile, setProfile] = useState({
        name: '', email: '', phone: '',
        bio: '', location: '',
        job_title: '', department: '',
        timezone: 'UTC', language: 'en',
        avatar_color: '#6366f1',
        notification_prefs: { email: true, browser: true, deals: true, leads: true }
    });

    const [passwords, setPasswords] = useState({ current: '', newP: '', confirm: '' });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                location: user.location || '',
                job_title: user.job_title || '',
                department: user.department || '',
                timezone: user.timezone || 'UTC',
                language: user.language || 'en',
                avatar_color: user.avatar_color || '#6366f1',
                notification_prefs: user.notification_prefs || { email: true, browser: true, deals: true, leads: true }
            });
        }
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Profile updated successfully!');
                if (refreshUser) refreshUser();
            } else {
                toast.error(data.error || 'Failed to save profile');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newP !== passwords.confirm) {
            return toast.error('New passwords do not match');
        }
        if (passwords.newP.length < 8) {
            return toast.error('Password must be at least 8 characters');
        }
        setSaving(true);
        try {
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newP })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password changed successfully!');
                setPasswords({ current: '', newP: '', confirm: '' });
            } else {
                toast.error(data.error || 'Failed to change password');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleMigrate = async () => {
        setMigrating(true);
        try {
            const res = await fetch('/api/admin/migrate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) toast.success('Database migration successful!');
            else toast.error(data.error);
        } catch {
            toast.error('Migration failed');
        } finally {
            setMigrating(false);
        }
    };

    const avatarInitial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="personal-settings-page">
            <div className="settings-hero">
                <div>
                    <h1 className="page-title">Personal Settings</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>Manage your account, preferences, and security.</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        className="btn btn-secondary"
                        onClick={handleMigrate}
                        disabled={migrating}
                        title="Run DB migration to add new user columns"
                    >
                        {migrating ? 'Migrating...' : '⚙️ Run DB Migration'}
                    </button>
                )}
            </div>

            <div className="settings-layout">
                {/* Sidebar Nav */}
                <nav className="settings-nav card">
                    {/* Avatar Display */}
                    <div className="avatar-display">
                        <div className="big-avatar" style={{ background: profile.avatar_color }}>
                            {avatarInitial}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{profile.name || 'Your Name'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                        </div>
                    </div>

                    {SECTIONS.map(sec => (
                        <button
                            key={sec.id}
                            className={`nav-settings-btn ${activeSection === sec.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(sec.id)}
                        >
                            <sec.icon />
                            <span>{sec.label}</span>
                            <FiChevronRight className="arrow" />
                        </button>
                    ))}
                </nav>

                {/* Main Content */}
                <div className="settings-main">
                    {activeSection === 'profile' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="settings-section card">
                            <div className="section-header">
                                <FiUser />
                                <div>
                                    <h2>Profile Information</h2>
                                    <p>Your public-facing identity in ModernCRM.</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveProfile} className="settings-form">
                                <div className="form-group">
                                    <label>Avatar Color</label>
                                    <div className="color-picker">
                                        {AVATAR_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`color-swatch ${profile.avatar_color === color ? 'selected' : ''}`}
                                                style={{ background: color }}
                                                onClick={() => setProfile({ ...profile, avatar_color: color })}
                                            />
                                        ))}
                                    </div>
                                    <div className="avatar-preview">
                                        <div className="big-avatar" style={{ background: profile.avatar_color, width: 64, height: 64, fontSize: '1.5rem' }}>
                                            {avatarInitial}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preview</span>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input className="input-styled" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input className="input-styled" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="input-with-icon">
                                        <FiPhone />
                                        <input className="input-styled" type="tel" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        className="input-styled"
                                        rows={3}
                                        placeholder="Tell the team a bit about yourself..."
                                        value={profile.bio}
                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                        style={{ resize: 'vertical', minHeight: '80px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <div className="input-with-icon">
                                        <FiMapPin />
                                        <input className="input-styled" placeholder="City, Country" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
                                    <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeSection === 'work' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="settings-section card">
                            <div className="section-header">
                                <FiBriefcase />
                                <div>
                                    <h2>Work Details</h2>
                                    <p>Your professional role and organizational info.</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveProfile} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input className="input-styled" placeholder="e.g. Senior Account Executive" value={profile.job_title} onChange={e => setProfile({ ...profile, job_title: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select className="input-styled" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })}>
                                            <option value="">Select department</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Support">Support</option>
                                            <option value="Finance">Finance</option>
                                            <option value="HR">HR</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Executive">Executive</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
                                    <FiSave /> {saving ? 'Saving...' : 'Save Work Details'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeSection === 'regional' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="settings-section card">
                            <div className="section-header">
                                <FiGlobe />
                                <div>
                                    <h2>Regional Preferences</h2>
                                    <p>Set your timezone and language to personalize your experience.</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveProfile} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Timezone</label>
                                        <select className="input-styled" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}>
                                            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Language</label>
                                        <select className="input-styled" value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })}>
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                            <option value="ar">Arabic</option>
                                            <option value="hi">Hindi</option>
                                            <option value="ja">Japanese</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
                                    <FiSave /> {saving ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeSection === 'notifications' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="settings-section card">
                            <div className="section-header">
                                <FiBell />
                                <div>
                                    <h2>Notification Preferences</h2>
                                    <p>Control how and when ModernCRM notifies you.</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveProfile} className="settings-form">
                                {[
                                    { key: 'email', label: 'Email Notifications', desc: 'Receive important alerts via email' },
                                    { key: 'browser', label: 'Browser Notifications', desc: 'In-app push notifications' },
                                    { key: 'deals', label: 'Deal Updates', desc: 'When deals change stage or are assigned' },
                                    { key: 'leads', label: 'Lead Alerts', desc: 'New leads and status changes' },
                                ].map(pref => (
                                    <div key={pref.key} className="toggle-row">
                                        <div>
                                            <div className="toggle-label">{pref.label}</div>
                                            <div className="toggle-desc">{pref.desc}</div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`toggle-switch ${profile.notification_prefs?.[pref.key] ? 'on' : ''}`}
                                            onClick={() => setProfile({
                                                ...profile,
                                                notification_prefs: {
                                                    ...profile.notification_prefs,
                                                    [pref.key]: !profile.notification_prefs?.[pref.key]
                                                }
                                            })}
                                        >
                                            <span className="toggle-thumb" />
                                        </button>
                                    </div>
                                ))}
                                <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
                                    <FiSave /> {saving ? 'Saving...' : 'Save Notification Settings'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeSection === 'security' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="settings-section card">
                            <div className="section-header">
                                <FiLock />
                                <div>
                                    <h2>Security</h2>
                                    <p>Manage your password and account security.</p>
                                </div>
                            </div>
                            <form onSubmit={handleChangePassword} className="settings-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input className="input-styled" type="password" placeholder="Enter current password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input className="input-styled" type="password" placeholder="Min 8 characters" value={passwords.newP} onChange={e => setPasswords({ ...passwords, newP: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input className="input-styled" type="password" placeholder="Repeat new password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
                                    <FiLock /> {saving ? 'Updating...' : 'Change Password'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

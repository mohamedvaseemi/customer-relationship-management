'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiUser, FiMail, FiCalendar, FiShield, FiEdit2, FiCamera, 
    FiCheck, FiChevronRight, FiCreditCard, FiZap, FiStar
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import './Profile.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const subscriptionInfo = {
        free: { name: 'Starter Plan', icon: FiZap, color: 'var(--text-muted)' },
        pro: { name: 'Professional Plan', icon: FiStar, color: 'var(--primary-color)' },
        enterprise: { name: 'Enterprise Plan', icon: FiShield, color: '#f59e0b' }
    };

    const currentPlan = subscriptionInfo[user?.subscription_tier || 'free'];

    return (
        <div className="profile-page p-8" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="profile-header mb-12 flex items-end justify-between">
                <div className="flex items-center gap-8">
                    <div className="profile-avatar-wrapper relative">
                        <div className="profile-avatar-large gradient-primary">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button className="avatar-edit-btn">
                            <FiCamera size={14} />
                        </button>
                    </div>
                    <div className="profile-intro">
                        <h1 className="page-title mb-1">{user?.name}</h1>
                        <div className="flex items-center gap-3 text-muted">
                            <span className="flex items-center gap-1"><FiMail size={14} /> {user?.email}</span>
                            <span className="dot-separator">•</span>
                            <span className="badge badge-info">{user?.role?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
                    <FiEdit2 /> {isEditing ? 'Save Profile' : 'Edit Profile'}
                </button>
            </div>

            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="profile-main-content flex flex-col gap-8">
                    {/* Account Details */}
                    <div className="card-premium p-6">
                        <h3 className="mb-6 flex items-center gap-2"><FiUser /> Account Information</h3>
                        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="info-item">
                                <label className="text-xs text-muted block mb-1">Full Name</label>
                                <div className="font-bold">{user?.name}</div>
                            </div>
                            <div className="info-item">
                                <label className="text-xs text-muted block mb-1">Email Address</label>
                                <div className="font-bold">{user?.email}</div>
                            </div>
                            <div className="info-item">
                                <label className="text-xs text-muted block mb-1">Account Role</label>
                                <div className="font-bold capitalize">{user?.role}</div>
                            </div>
                            <div className="info-item">
                                <label className="text-xs text-muted block mb-1">Timezone</label>
                                <div className="font-bold">UTC (GMT+0)</div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="card-premium p-6">
                        <h3 className="mb-6 flex items-center gap-2 space-x-2">
                           <FiShield /> Security & Privacy
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 bg-tertiary rounded-md">
                                <div>
                                    <div className="font-bold">Two-Factor Authentication</div>
                                    <p className="text-xs text-muted">Secure your account with multi-factor auth.</p>
                                </div>
                                <div className="badge badge-success">Enabled</div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-tertiary rounded-md">
                                <div>
                                    <div className="font-bold">Last Password Change</div>
                                    <p className="text-xs text-muted">3 months ago</p>
                                </div>
                                <button className="btn btn-outline btn-sm">Change</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-sidebar flex flex-col gap-8">
                    {/* Subscription & Pricing Widget */}
                    <div className="card-premium p-6 border-glow">
                        <h3 className="mb-6 flex items-center gap-2"><FiCreditCard /> Billing & Tier</h3>
                        <div className="subscription-card p-4 rounded-lg mb-6" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-secondary rounded-lg" style={{ color: currentPlan.color }}>
                                    <currentPlan.icon size={20} />
                                </div>
                                <div>
                                    <div className="font-bold">{currentPlan.name}</div>
                                    <p className="text-xs text-muted">Current Intelligence Tier</p>
                                </div>
                            </div>
                        </div>
                        <ul className="text-xs text-muted flex flex-col gap-3 mb-6">
                            <li className="flex items-center gap-2"><FiCheck className="text-success" /> AI-Augmented Analytics</li>
                            <li className="flex items-center gap-2"><FiCheck className="text-success" /> Priority Lead Support</li>
                            <li className="flex items-center gap-2"><FiCheck className="text-success" /> Unlimited Workflows</li>
                        </ul>
                        <button 
                            className="btn btn-premium w-full shadow-glow" 
                            onClick={() => router.push('/pricing')}
                        >
                            View All Plans <FiChevronRight />
                        </button>
                    </div>

                    <div className="card-premium p-6 bg-glass">
                        <h4 className="mb-4">System Activity</h4>
                        <div className="activity-list flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="activity-item flex gap-3">
                                    <div className="w-1 h-8 bg-primary rounded-full" />
                                    <div>
                                        <div className="text-sm font-bold">Workspace Updated</div>
                                        <p className="text-xs text-muted">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

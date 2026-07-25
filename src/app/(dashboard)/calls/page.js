"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPhoneCall, FiVideo, FiMic, FiPhoneIncoming, FiPhoneMissed, FiPhoneForwarded } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import FeatureComingSoon from '@/components/FeatureComingSoon';

const mockCalls = [
    { id: 1, type: 'incoming', contact: 'Sarah Jenkins', company: 'TechFlow Inc', duration: '15:24', time: '10:30 AM', status: 'completed' },
    { id: 2, type: 'outgoing', contact: 'Michael Chang', company: 'Global Systems', duration: '05:12', time: '11:45 AM', status: 'completed' },
    { id: 3, type: 'missed', contact: 'Emma Wilson', company: 'Innovate LLC', duration: '00:00', time: '02:15 PM', status: 'missed' },
];

export default function Calls() {
    const { sampleDataEnabled } = useAuth();
    const [showFeature, setShowFeature] = useState(false);

    if (showFeature) return <FeatureComingSoon title="Telephony Services" />;

    const currentCalls = sampleDataEnabled ? mockCalls : [];

    return (
        <div className="page-container" style={{ padding: '0' }}>
            <div className="page-header flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Calls & Telephony</h1>
                    <p className="text-muted">Manage your VoIP communications and call logs.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => setShowFeature(true)}><FiMic /> Voicemail</button>
                    <button className="btn btn-primary" onClick={() => setShowFeature(true)}><FiPhoneCall /> Make a Call</button>
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card text-center p-6">
                    <div className="text-muted mb-2">Total Calls Today</div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--primary-color)' }}>{sampleDataEnabled ? '24' : '0'}</div>
                </div>
                <div className="card text-center p-6">
                    <div className="text-muted mb-2">Average Duration</div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>{sampleDataEnabled ? '04:15' : '00:00'}</div>
                </div>
                <div className="card text-center p-6">
                    <div className="text-muted mb-2">Missed Calls</div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--danger)' }}>{sampleDataEnabled ? '3' : '0'}</div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold">Recent Call Logs</h3>
                </div>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Type</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Contact</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Company</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Duration</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Time</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCalls.map(call => (
                                <tr key={call.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {call.type === 'incoming' && <FiPhoneIncoming style={{ color: 'var(--success)' }} />}
                                        {call.type === 'outgoing' && <FiPhoneForwarded style={{ color: 'var(--primary-color)' }} />}
                                        {call.type === 'missed' && <FiPhoneMissed style={{ color: 'var(--danger)' }} />}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{call.contact}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{call.company}</td>
                                    <td style={{ padding: '1rem' }}>{call.duration}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{call.time}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn-icon" title="Call Back"><FiPhoneCall /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

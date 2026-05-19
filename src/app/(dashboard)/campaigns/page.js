"use client";
import React from 'react';
import { FiSend, FiPieChart, FiUsers, FiActivity, FiMoreHorizontal } from 'react-icons/fi';

const mockCampaigns = [
    { id: 1, name: 'Q4 Enterprise Outreach', status: 'Active', sent: 1250, openRate: '42%', clickRate: '12%' },
    { id: 2, name: 'Product Launch Update', status: 'Draft', sent: 0, openRate: '-', clickRate: '-' },
    { id: 3, name: 'Lost Deal Reactivation', status: 'Completed', sent: 450, openRate: '28%', clickRate: '5%' },
];

export default function Campaigns() {
    return (
        <div className="page-container" style={{ padding: '0' }}>
            <div className="page-header flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Email Campaigns</h1>
                    <p className="text-muted">Create and track your automated email marketing sequences.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-primary"><FiSend /> New Campaign</button>
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card flex items-center gap-4 p-4">
                    <div className="text-primary p-3 rounded-full" style={{ background: 'var(--info-bg)' }}>
                        <FiSend size={24} />
                    </div>
                    <div>
                        <div className="text-muted">Total Sent</div>
                        <div className="font-bold text-xl">12,450</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4 p-4">
                    <div className="text-success p-3 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <FiPieChart size={24} />
                    </div>
                    <div>
                        <div className="text-muted">Avg Open Rate</div>
                        <div className="font-bold text-xl">34.2%</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4 p-4">
                    <div className="text-warning p-3 rounded-full" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                        <FiActivity size={24} />
                    </div>
                    <div>
                        <div className="text-muted">Avg Click Rate</div>
                        <div className="font-bold text-xl">8.5%</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold">Recent Campaigns</h3>
                </div>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Campaign Name</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sent</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Open Rate</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Click Rate</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCampaigns.map(camp => (
                                <tr key={camp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{camp.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${camp.status === 'Active' ? 'badge-success' : camp.status === 'Draft' ? 'badge-warning' : 'badge-info'}`}>
                                            {camp.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{camp.sent.toLocaleString()}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{camp.openRate}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{camp.clickRate}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn-icon"><FiMoreHorizontal /></button>
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

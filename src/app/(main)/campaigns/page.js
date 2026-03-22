'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FiPlus, FiTarget, FiEdit2, FiTrash2, FiSearch, FiFilter,
    FiMessageSquare, FiGlobe, FiTag, FiBarChart2, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../leads/leads.css';

export default function CampaignsPage() {
    const { token, loading: authLoading } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'email',
        status: 'planning',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget: 0,
        description: ''
    });

    const loadCampaigns = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('/api/campaigns', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setCampaigns(data.campaigns || []);
            }
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            loadCampaigns();
        }
    }, [authLoading, token, loadCampaigns]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowModal(false);
                setFormData({
                    name: '', type: 'email', status: 'planning', 
                    start_date: new Date().toISOString().split('T')[0], 
                    end_date: '', budget: 0, description: ''
                });
                loadCampaigns();
            }
        } catch (error) {
            console.error('Failed to save campaign:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this marketing campaign?')) {
            try {
                const response = await fetch(`/api/campaigns/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    loadCampaigns();
                }
            } catch (error) {
                console.error('Failed to delete campaign:', error);
            }
        }
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Marketing Hub</h1>
                    <p className="page-subtitle">Strategic management of cross-channel acquisition campaigns and performance metrics.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => setShowModal(true)}>
                        <FiPlus /> New Campaign
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="loader">Loading campaigns...</div></div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Campaign Strategy</th>
                                <th>Channel Type</th>
                                <th>Operational Status</th>
                                <th>Launch Window</th>
                                <th>Budget</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="name-text">{item.name}</div>
                                        <div className="position-text">{item.description || 'No strategy defined'}</div>
                                    </td>
                                    <td>
                                        <div className="status-badge-alt" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                                            <FiBarChart2 style={{ marginRight: '5px' }} /> {item.type}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-badge-alt ${item.status}`}>
                                            {item.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'TBD'} — {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Active'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold text-sm">
                                            ${parseFloat(item.budget).toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        No strategic campaigns found. Start by designing your first growth initiative.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal card"
                            style={{ maxWidth: '600px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Design Campaign Strategy</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Campaign Objective</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                placeholder="e.g. Q4 Growth Inbound"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Channel Type</label>
                                            <select
                                                className="select-alt"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="email">Email Sequence</option>
                                                <option value="social">Social Media</option>
                                                <option value="webinar">Webinar/Event</option>
                                                <option value="referral">Referral Program</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Strategic Status</label>
                                            <select
                                                className="select-alt"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="planning">Planning</option>
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                                <option value="paused">Paused</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Start Date</label>
                                            <input
                                                type="date"
                                                className="input-alt"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Capital Allocation ($)</label>
                                            <input
                                                type="number"
                                                className="input-alt"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-field" style={{ marginTop: '1rem' }}>
                                        <label>Campaign Strategy Context</label>
                                        <textarea
                                            className="input-alt"
                                            style={{ minHeight: '100px', paddingTop: '10px' }}
                                            placeholder="Outline the goals and target audience..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium">Initiate Campaign</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

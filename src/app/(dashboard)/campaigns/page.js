"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiSend, FiPlus, FiSearch, FiTrash2, FiActivity, FiDollarSign, FiTarget, FiX, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/ConfirmModal';
import '@/styles/Campaigns.css';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, idToDelete: null });
    
    // Form
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '', type: 'email', status: 'draft', budget: '', start_date: '', end_date: '', description: ''
    });

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/campaigns', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch (err) {
            console.error('Failed to load campaigns:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [campaigns, searchQuery]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = Cookies.get('token');
            await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            setFormData({ name: '', type: 'email', status: 'draft', budget: '', start_date: '', end_date: '', description: '' });
            fetchCampaigns();
        } catch (err) {
            console.error('Create failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
            const token = Cookies.get('token');
            await fetch(`/api/campaigns/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            fetchCampaigns(); // Revert on failure
        }
    };

    const promptDelete = (id) => setConfirmDialog({ isOpen: true, idToDelete: id });
    
    const executeDelete = async () => {
        const id = confirmDialog.idToDelete;
        try {
            setCampaigns(prev => prev.filter(c => c.id !== id));
            const token = Cookies.get('token');
            await fetch(`/api/campaigns/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        } catch (err) {
            fetchCampaigns();
        }
    };

    // Calculate Metrics
    const totalBudget = campaigns.reduce((acc, c) => acc + Number(c.budget || 0), 0);
    const activeCount = campaigns.filter(c => c.status === 'active').length;

    return (
        <div className="campaigns-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Marketing Campaigns</h1>
                    <p className="page-subtitle">Plan, execute, and track outbound sales and marketing efforts</p>
                </div>
                <button className="btn btn-primary premium-shadow" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> New Campaign
                </button>
            </div>

            {/* Metrics Row */}
            <div className="metrics-row">
                <div className="metric-card card">
                    <div className="icon-wrapper blue"><FiTarget /></div>
                    <div className="metric-info">
                        <span className="metric-label">Total Campaigns</span>
                        <span className="metric-value">{campaigns.length}</span>
                    </div>
                </div>
                <div className="metric-card card">
                    <div className="icon-wrapper green"><FiActivity /></div>
                    <div className="metric-info">
                        <span className="metric-label">Active Running</span>
                        <span className="metric-value">{activeCount}</span>
                    </div>
                </div>
                <div className="metric-card card">
                    <div className="icon-wrapper purple"><FiDollarSign /></div>
                    <div className="metric-info">
                        <span className="metric-label">Total Budget Allocation</span>
                        <span className="metric-value">${totalBudget.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search campaigns by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Campaign Grid */}
            <div className="campaign-grid">
                {filteredCampaigns.map(camp => (
                    <div key={camp.id} className="campaign-card card">
                        <div className="camp-header">
                            <h3 className="camp-title">{camp.name}</h3>
                            <select 
                                className={`status-select ${camp.status}`} 
                                value={camp.status} 
                                onChange={(e) => handleStatusChange(camp.id, e.target.value)}
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        
                        <p className="camp-desc">{camp.description || 'No description provided.'}</p>
                        
                        <div className="camp-details">
                            <div className="detail-item">
                                <span className="label">Type</span>
                                <span className="value" style={{ textTransform: 'capitalize' }}>
                                    <FiSend size={12}/> {camp.type.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Budget</span>
                                <span className="value text-green font-bold">${Number(camp.budget).toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Start Date</span>
                                <span className="value"><FiCalendar size={12}/> {camp.start_date ? new Date(camp.start_date).toLocaleDateString() : 'TBD'}</span>
                            </div>
                        </div>

                        <div className="camp-footer">
                            <span className="creator-text">By {camp.creator_name || 'System'}</span>
                            <button className="action-btn-circle delete" onClick={() => promptDelete(camp.id)} title="Delete Campaign">
                                <FiTrash2 size={14}/>
                            </button>
                        </div>
                    </div>
                ))}

                {filteredCampaigns.length === 0 && !loading && (
                    <div className="empty-state-box">
                        <div className="empty-icon-pulse"><FiSend size={40} /></div>
                        <h3>No Campaigns Active</h3>
                        <p>Launch your first email or social campaign to drive leads.</p>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create Campaign</button>
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={confirmDialog.isOpen}
                title="Delete Campaign?"
                message="Are you sure you want to delete this campaign? This will remove all associated budgeting data."
                onConfirm={executeDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, idToDelete: null })}
                confirmText="Yes, delete it"
            />

            {/* CREATE MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiTarget className="text-primary" /> Create Campaign</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreate} className="auth-form">
                                <div className="input-field">
                                    <label>Campaign Name *</label>
                                    <input type="text" className="input-styled" required placeholder="e.g. Q4 Winter Promo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="form-row">
                                    <div className="input-field">
                                        <label>Campaign Type</label>
                                        <select className="input-styled" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option value="email">Email Sequence</option>
                                            <option value="social_media">Social Media</option>
                                            <option value="webinar">Webinar</option>
                                            <option value="cold_calling">Cold Calling</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Budget ($)</label>
                                        <input type="number" className="input-styled" placeholder="5000" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-field">
                                        <label>Start Date</label>
                                        <input type="date" className="input-styled" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                                    </div>
                                    <div className="input-field">
                                        <label>End Date</label>
                                        <input type="date" className="input-styled" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label>Description & Goals</label>
                                    <textarea className="input-styled" placeholder="What is the objective of this campaign?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div className="ai-modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary premium-shadow" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Create Campaign'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
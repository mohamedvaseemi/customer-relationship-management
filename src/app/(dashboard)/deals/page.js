"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { dealsAPI } from '@/api/api';
import { 
    FiDollarSign, FiPlus, FiSearch, 
    FiTrash2, FiX, FiBriefcase
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Deals.css';

const DEAL_STAGES = [
    { key: 'prospecting', label: 'Prospecting', color: '#6366f1' },
    { key: 'qualification', label: 'Qualification', color: '#8b5cf6' },
    { key: 'proposal', label: 'Proposal', color: '#ec4899' },
    { key: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
    { key: 'won', label: 'Closed Won', color: '#10b981' }
];

export default function DealsPage() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', amount: '', stage: 'prospecting', probability: 50, notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dealsAPI.getAll();
            setDeals(res.data.deals || []);
        } catch (err) {
            console.error('Failed to fetch deals:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => 
            (deal.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (deal.company_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [deals, searchQuery]);

    const handleStageChange = async (dealId, newStage) => {
        try {
            const targetDeal = deals.find(d => d.id === dealId);
            if (!targetDeal) return;

            setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
            await dealsAPI.update(dealId, { ...targetDeal, stage: newStage });
        } catch (err) {
            console.error('Failed to update stage:', err);
            fetchDeals();
        }
    };

    const handleCreateDeal = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dealsAPI.create({
                ...formData,
                amount: parseFloat(formData.amount) || 0,
                probability: parseInt(formData.probability) || 50
            });
            setIsModalOpen(false);
            setFormData({ name: '', amount: '', stage: 'prospecting', probability: 50, notes: '' });
            fetchDeals();
        } catch (err) {
            console.error('Failed to create deal:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDeal = async (id) => {
        if (!confirm('Are you sure you want to delete this deal?')) return;
        try {
            setDeals(prev => prev.filter(d => d.id !== id));
            await dealsAPI.delete(id);
        } catch (err) {
            console.error('Failed to delete deal:', err);
            fetchDeals();
        }
    };

    return (
        <div className="deals-container">
            {/* Header */}
            <div className="deals-header">
                <div>
                    <h1 className="page-title">Deals Pipeline</h1>
                    <p className="page-subtitle">Manage revenue opportunities and stage progress</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> New Deal
                </button>
            </div>

            {/* Search Bar */}
            <div className="filters-section card" style={{ marginBottom: '1.5rem' }}>
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        className="input" 
                        placeholder="Filter deals by name or company..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* KANBAN BOARD */}
            <div className="kanban-board">
                {DEAL_STAGES.map(stage => {
                    const stageDeals = filteredDeals.filter(d => (d.stage || 'prospecting') === stage.key);
                    const totalAmount = stageDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);

                    return (
                        <div key={stage.key} className="kanban-column">
                            <div className="column-header">
                                <div className="column-title">
                                    <span className="stage-dot" style={{ backgroundColor: stage.color }} />
                                    <span>{stage.label}</span>
                                    <span className="deal-count">{stageDeals.length}</span>
                                </div>
                                <span className="column-value">${totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="column-content">
                                {stageDeals.map(deal => (
                                    <div key={deal.id} className="deal-card">
                                        <div className="deal-card-title">{deal.name}</div>
                                        <div className="deal-card-company">
                                            <FiBriefcase size={12} style={{ marginRight: '4px' }} />
                                            {deal.company_name || 'Organization'}
                                        </div>
                                        <div className="deal-card-footer">
                                            <div className="deal-amount">${Number(deal.amount || 0).toLocaleString()}</div>
                                            <span className="deal-probability">{deal.probability || 50}% probability</span>
                                        </div>
                                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <select 
                                                className="select-alt" 
                                                style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                                                value={deal.stage}
                                                onChange={(e) => handleStageChange(deal.id, e.target.value)}
                                            >
                                                <option value="prospecting">Prospecting</option>
                                                <option value="qualification">Qualification</option>
                                                <option value="proposal">Proposal</option>
                                                <option value="negotiation">Negotiation</option>
                                                <option value="won">Closed Won</option>
                                            </select>
                                            <button className="action-btn delete" onClick={() => handleDeleteDeal(deal.id)}>
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {stageDeals.length === 0 && (
                                    <div className="empty-column-placeholder">
                                        No deals in {stage.label}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CREATE DEAL MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiDollarSign /> Create Opportunity Deal</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateDeal} className="auth-form">
                                <div className="input-field">
                                    <label>Deal Opportunity Name *</label>
                                    <input 
                                        type="text" 
                                        className="input-styled" 
                                        placeholder="e.g. Enterprise CRM Migration" 
                                        value={formData.name} 
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Deal Amount ($)</label>
                                        <input 
                                            type="number" 
                                            className="input-styled" 
                                            placeholder="120000" 
                                            value={formData.amount} 
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                                            required
                                        />
                                    </div>
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Stage</label>
                                        <select 
                                            className="input-styled" 
                                            value={formData.stage} 
                                            onChange={e => setFormData({ ...formData, stage: e.target.value })}
                                        >
                                            <option value="prospecting">Prospecting</option>
                                            <option value="qualification">Qualification</option>
                                            <option value="proposal">Proposal</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="won">Closed Won</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="ai-modal-footer" style={{ marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save Opportunity'}
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
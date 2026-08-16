"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { leadsAPI } from '@/api/api';
import { 
    FiTarget, FiPlus, FiGrid, FiList, FiSearch, 
    FiFilter, FiTrash2, FiX, FiDollarSign
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Leads.css';

const KANBAN_STAGES = [
    { key: 'new', label: 'New Leads', color: '#6366f1' },
    { key: 'contacted', label: 'Contacted', color: '#8b5cf6' },
    { key: 'qualified', label: 'Qualified', color: '#ec4899' },
    { key: 'won', label: 'Won', color: '#10b981' },
    { key: 'lost', label: 'Lost', color: '#ef4444' }
];

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '', value: '', status: 'new', priority: 'medium', source: 'Website', notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await leadsAPI.getAll({
                status: statusFilter || undefined,
                priority: priorityFilter || undefined
            });
            setLeads(res.data.leads || []);
        } catch (err) {
            console.error('Failed to load leads:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, priorityFilter]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const titleMatch = (lead.title || '').toLowerCase().includes(searchQuery.toLowerCase());
            const companyMatch = (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase());
            const nameMatch = `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
            return titleMatch || companyMatch || nameMatch;
        });
    }, [leads, searchQuery]);

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const targetLead = leads.find(l => l.id === leadId);
            if (!targetLead) return;

            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            await leadsAPI.update(leadId, { ...targetLead, status: newStatus });
        } catch (err) {
            console.error('Failed to update lead status:', err);
            fetchLeads();
        }
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await leadsAPI.create({
                ...formData,
                value: parseFloat(formData.value) || 0
            });
            setIsModalOpen(false);
            setFormData({ title: '', value: '', status: 'new', priority: 'medium', source: 'Website', notes: '' });
            fetchLeads();
        } catch (err) {
            console.error('Failed to create lead:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLead = async (id) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;
        try {
            setLeads(prev => prev.filter(l => l.id !== id));
            await leadsAPI.delete(id);
        } catch (err) {
            console.error('Failed to delete lead:', err);
            fetchLeads();
        }
    };

    return (
        <div className="leads-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Leads Pipeline</h1>
                    <p className="page-subtitle">Track, qualify, and convert potential opportunities</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button 
                            className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`} 
                            onClick={() => setViewMode('kanban')}
                        >
                            <FiGrid /> Kanban
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
                            onClick={() => setViewMode('list')}
                        >
                            <FiList /> Table
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <FiPlus /> Add Lead
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="filters-section card">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        className="input" 
                        placeholder="Search leads by title, company, or contact..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFilter />
                    <select 
                        className="input" 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                    <select 
                        className="input" 
                        value={priorityFilter} 
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                </div>
            </div>

            {/* KANBAN BOARD VIEW */}
            {viewMode === 'kanban' && (
                <div className="kanban-board">
                    {KANBAN_STAGES.map(stage => {
                        const stageLeads = filteredLeads.filter(l => (l.status || 'new') === stage.key);
                        const stageValue = stageLeads.reduce((sum, l) => sum + Number(l.value || 0), 0);

                        return (
                            <div key={stage.key} className="kanban-column">
                                <div className="column-header">
                                    <div className="column-title">
                                        <span className="stage-dot" style={{ backgroundColor: stage.color }} />
                                        <span>{stage.label}</span>
                                        <span className="count-badge">{stageLeads.length}</span>
                                    </div>
                                    <span className="column-value">${stageValue.toLocaleString()}</span>
                                </div>

                                <div className="column-content">
                                    {stageLeads.map(lead => (
                                        <div key={lead.id} className="kanban-card card">
                                            <div className="card-top">
                                                <span className="lead-company">{lead.company || 'Direct Contact'}</span>
                                                <span className={`priority-tag priority-${lead.priority}`}>
                                                    {lead.priority || 'medium'}
                                                </span>
                                            </div>
                                            <h4 className="lead-title">{lead.title}</h4>
                                            
                                            <div className="card-footer">
                                                <div className="lead-value">
                                                    <FiDollarSign size={14} />
                                                    <span>{Number(lead.value || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="action-btn delete" 
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                        title="Delete Lead"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {stageLeads.length === 0 && (
                                        <div className="empty-column-placeholder">
                                            No leads in {stage.label}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TABLE LIST VIEW */}
            {viewMode === 'list' && (
                <div className="card table-responsive">
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th>Lead Title</th>
                                <th>Company</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Source</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map(lead => (
                                <tr key={lead.id}>
                                    <td>
                                        <div className="name-text">{lead.title}</div>
                                        <div className="position-text">{lead.first_name ? `${lead.first_name} ${lead.last_name}` : ''}</div>
                                    </td>
                                    <td>{lead.company || 'N/A'}</td>
                                    <td className="font-bold">${Number(lead.value || 0).toLocaleString()}</td>
                                    <td>
                                        <select 
                                            className="select-alt" 
                                            value={lead.status || 'new'}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="won">Won</option>
                                            <option value="lost">Lost</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`priority-badge priority-${lead.priority}`}>
                                            {lead.priority || 'medium'}
                                        </span>
                                    </td>
                                    <td>{lead.source || 'Direct'}</td>
                                    <td className="text-right">
                                        <button className="action-btn delete" onClick={() => handleDeleteLead(lead.id)}>
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ADD LEAD MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiTarget /> Create New Lead</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateLead} className="auth-form">
                                <div className="input-field">
                                    <label>Lead Title *</label>
                                    <input 
                                        type="text" 
                                        className="input-styled" 
                                        placeholder="e.g. Enterprise Cloud License" 
                                        value={formData.title} 
                                        onChange={e => setFormData({ ...formData, title: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Value ($)</label>
                                        <input 
                                            type="number" 
                                            className="input-styled" 
                                            placeholder="50000" 
                                            value={formData.value} 
                                            onChange={e => setFormData({ ...formData, value: e.target.value })} 
                                        />
                                    </div>
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Priority</label>
                                        <select 
                                            className="input-styled" 
                                            value={formData.priority} 
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="ai-modal-footer" style={{ marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Save Lead'}
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
"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { leadsAPI } from '@/api/api';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiDollarSign,
    FiGrid, FiList, FiChevronRight, FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Leads.css';

const KANBAN_STAGES = [
    { id: 'new', title: 'New Leads', color: '#6366f1' },
    { id: 'contacted', title: 'Contacted', color: '#f59e0b' },
    { id: 'qualified', title: 'Qualified', color: '#0ea5e9' },
    { id: 'proposal', title: 'Proposal', color: '#8b5cf6' },
    { id: 'negotiation', title: 'Negotiation', color: '#ec4899' },
    { id: 'won', title: 'Closed Won', color: '#10b981' }
];

export default function Leads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        value: '',
        status: 'new',
        priority: 'medium',
        source: 'website',
        probability: 50,
        company: ''
    });

    useEffect(() => {
        loadLeads();
    }, [searchTerm, statusFilter]);

    const loadLeads = async () => {
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;

            const response = await leadsAPI.getAll(params);
            setLeads(response.data.leads);
        } catch (error) {
            console.error('Failed to load leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupedLeads = useMemo(() => {
        const groups = {};
        KANBAN_STAGES.forEach(stage => groups[stage.id] = []);
        leads.forEach(lead => {
            if (groups[lead.status]) {
                groups[lead.status].push(lead);
            }
        });
        return groups;
    }, [leads]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedLead) {
                await leadsAPI.update(selectedLead.id, formData);
            } else {
                await leadsAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            loadLeads();
        } catch (error) {
            console.error('Failed to save lead:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await leadsAPI.delete(id);
                loadLeads();
            } catch (error) {
                console.error('Failed to delete lead:', error);
            }
        }
    };

    const handleEdit = (lead) => {
        setSelectedLead(lead);
        setFormData({
            title: lead.title,
            value: lead.value,
            status: lead.status,
            priority: lead.priority,
            source: lead.source,
            probability: lead.probability,
            company: lead.company || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedLead(null);
        setFormData({
            title: '',
            value: '',
            status: 'new',
            priority: 'medium',
            source: 'website',
            probability: 50,
            company: ''
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales Pipeline</h1>
                    <p className="page-subtitle">Track opportunities through the engagement cycle.</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle card">
                        <button
                            className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            <FiGrid /> Board
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <FiList /> List
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FiPlus /> New Opportunity
                    </button>
                </div>
            </div>

            <div className="filters-section card">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search deals, companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFilter />
                    <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Stages</option>
                        {KANBAN_STAGES.map(stage => (
                            <option key={stage.id} value={stage.id}>{stage.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container" >
                    <div className="spinner"></div>
                </div>
            ) : viewMode === 'kanban' ? (
                <div className="kanban-board">
                    {KANBAN_STAGES.map(stage => (
                        <div key={stage.id} className="kanban-column">
                            <div className="column-header">
                                <h3 className="column-title">
                                    <span className="stage-dot" style={{ backgroundColor: stage.color }}></span>
                                    {stage.title}
                                    <span className="count-badge">{groupedLeads[stage.id].length}</span>
                                </h3>
                                <div className="column-value">
                                    ${groupedLeads[stage.id].reduce((acc, lead) => acc + parseFloat(lead.value || 0), 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="column-content">
                                {groupedLeads[stage.id].map(lead => (
                                    <motion.div
                                        layoutId={lead.id}
                                        key={lead.id}
                                        className="kanban-card card"
                                    >
                                        <div className="card-top" onClick={() => handleEdit(lead)} style={{ cursor: 'pointer' }}>
                                            <span className="lead-company">{lead.company || 'Direct'}</span>
                                            <span className="priority-tag" style={{ borderLeftColor: getPriorityColor(lead.priority) }}>
                                                {lead.priority}
                                            </span>
                                        </div>
                                        <Link href={`/leads/${lead.id}`} className="lead-title-link">
                                            <h4 className="lead-title">{lead.title}</h4>
                                        </Link>
                                        <div className="card-footer">
                                            <div className="lead-value">
                                                <FiDollarSign /> {parseFloat(lead.value || 0).toLocaleString()}
                                            </div>
                                            <div className="lead-meta">
                                                <div className="probability-text">{lead.probability}%</div>
                                                <div className="mini-progress">
                                                    <div className="progress-fill" style={{ width: `${lead.probability}%`, backgroundColor: stage.color }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Opportunity</th>
                                <th>Value</th>
                                <th>Stage</th>
                                <th>Confidence</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id}>
                                    <td>
                                        <Link href={`/leads/${lead.id}`} className="name-text-link">
                                            <div className="name-text">{lead.title}</div>
                                        </Link>
                                        <div className="position-text">{lead.company}</div>
                                    </td>
                                    <td><FiDollarSign /> {parseFloat(lead.value || 0).toLocaleString()}</td>
                                    <td>
                                        <div className="status-badge-alt" style={{ backgroundColor: KANBAN_STAGES.find(s => s.id === lead.status)?.color + '20', color: KANBAN_STAGES.find(s => s.id === lead.status)?.color }}>
                                            {lead.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="progress-group">
                                            <div className="mini-progress-bar">
                                                <div className="fill" style={{ width: `${lead.probability}%` }}></div>
                                            </div>
                                            <span>{lead.probability}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => handleEdit(lead)}><FiEdit2 /></button>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(lead.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {
                showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="modal card"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">{selectedLead ? 'Edit Opportunity' : 'New Opportunity'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiPlus style={{ transform: 'rotate(45deg)' }} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field">
                                            <label>Deal Title</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Company / Organization</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Est. Value ($)</label>
                                            <input
                                                type="number"
                                                className="input-alt"
                                                value={formData.value}
                                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Confidence (%)</label>
                                            <input
                                                type="number"
                                                className="input-alt"
                                                value={formData.probability}
                                                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                                                min="0" max="100"
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Pipeline Stage</label>
                                            <select
                                                className="select-alt"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                {KANBAN_STAGES.map(stage => (
                                                    <option key={stage.id} value={stage.id}>{stage.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Priority Level</label>
                                            <select
                                                className="select-alt"
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{selectedLead ? 'Update Deal' : 'Start Deal'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
}

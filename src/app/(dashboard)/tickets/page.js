"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    FiLifeBuoy, FiPlus, FiSearch, FiTrash2, 
    FiAlertCircle, FiCheckCircle, FiClock, FiX, 
    FiUser, FiMessageSquare
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/ConfirmModal';
import '@/styles/Tickets.css';

export default function ServiceDeskPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, idToDelete: null });
    
    // Form State
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: '', description: '', priority: 'medium', status: 'open'
    });

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/tickets', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setTickets(data.tickets || []);
        } catch (err) {
            console.error('Failed to load tickets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchTickets(); 
    }, [fetchTickets]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => 
            (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            `TKT-${t.id}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tickets, searchQuery]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = Cookies.get('token');
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            setFormData({ subject: '', description: '', priority: 'medium', status: 'open' });
            fetchTickets();
        } catch (err) {
            console.error('Create failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
            const token = Cookies.get('token');
            await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            fetchTickets();
        }
    };

    const promptDelete = (id) => setConfirmDialog({ isOpen: true, idToDelete: id });
    
    const executeDelete = async () => {
        const id = confirmDialog.idToDelete;
        try {
            setTickets(prev => prev.filter(t => t.id !== id));
            const token = Cookies.get('token');
            await fetch(`/api/tickets/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        } catch (err) {
            fetchTickets();
        }
    };

    // Calculate metrics
    const openCount = tickets.filter(t => t.status === 'open').length;
    const progressCount = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

    const getStatusIcon = (status) => {
        if (status === 'open') return <FiAlertCircle className="tkt-status-icon tkt-red" />;
        if (status === 'in_progress') return <FiClock className="tkt-status-icon tkt-blue" />;
        return <FiCheckCircle className="tkt-status-icon tkt-green" />;
    };

    const getPriorityClass = (priority) => {
        if (priority === 'urgent' || priority === 'high') return 'tkt-p-high';
        if (priority === 'medium') return 'tkt-p-medium';
        return 'tkt-p-low';
    };

    return (
        <div className="tickets-page-container">
            {/* Page Header */}
            <div className="tickets-top-header">
                <div>
                    <h1 className="tickets-main-title">Service Desk</h1>
                    <p className="tickets-sub-title">Manage, assign, and resolve customer support requests</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> New Ticket
                </button>
            </div>

            {/* Metrics Row (3-Column Grid) */}
            <div className="tickets-metrics-grid">
                <div className="ticket-metric-card">
                    <div className="tkt-metric-icon-box tkt-icon-red">
                        <FiAlertCircle size={22} />
                    </div>
                    <div className="ticket-metric-info">
                        <span className="ticket-metric-label">Needs Attention</span>
                        <span className="ticket-metric-value">{openCount}</span>
                    </div>
                </div>

                <div className="ticket-metric-card">
                    <div className="tkt-metric-icon-box tkt-icon-blue">
                        <FiClock size={22} />
                    </div>
                    <div className="ticket-metric-info">
                        <span className="ticket-metric-label">In Progress</span>
                        <span className="ticket-metric-value">{progressCount}</span>
                    </div>
                </div>

                <div className="ticket-metric-card">
                    <div className="tkt-metric-icon-box tkt-icon-green">
                        <FiCheckCircle size={22} />
                    </div>
                    <div className="ticket-metric-info">
                        <span className="ticket-metric-label">Resolved</span>
                        <span className="ticket-metric-value">{resolvedCount}</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="tickets-search-bar">
                <FiSearch className="tkt-search-icon" />
                <input 
                    type="text" 
                    placeholder="Search by issue summary or ticket ID..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>

            {/* Precision List Table */}
            <div className="tickets-table-card">
                <div className="tickets-table-header">
                    <div className="tkt-col-id">Ticket</div>
                    <div className="tkt-col-summary">Issue Summary</div>
                    <div className="tkt-col-status">Status</div>
                    <div className="tkt-col-priority">Priority</div>
                    <div className="tkt-col-assignee">Assignee</div>
                    <div className="tkt-col-actions"></div>
                </div>

                <div className="tickets-table-body">
                    {filteredTickets.map(ticket => (
                        <div key={ticket.id} className="tickets-table-row">
                            <div className="tkt-col-id">
                                <span className="tkt-badge-id">TKT-{ticket.id}</span>
                            </div>
                            
                            <div className="tkt-col-summary">
                                {getStatusIcon(ticket.status)}
                                <div className="tkt-summary-text-box">
                                    <span className="tkt-summary-title">{ticket.subject}</span>
                                    {ticket.description && (
                                        <span className="tkt-summary-desc">{ticket.description}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="tkt-col-status">
                                <select 
                                    className={`tkt-status-select-native ${ticket.status}`} 
                                    value={ticket.status} 
                                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div className="tkt-col-priority">
                                <span className={`tkt-priority-pill ${getPriorityClass(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                            </div>

                            <div className="tkt-col-assignee">
                                {ticket.assigned_to_name ? (
                                    <span className="tkt-assignee-badge">
                                        <div className="tkt-avatar-circle"><FiUser size={10} /></div>
                                        {ticket.assigned_to_name.split(' ')[0]}
                                    </span>
                                ) : (
                                    <span className="tkt-unassigned">Unassigned</span>
                                )}
                            </div>

                            <div className="tkt-col-actions">
                                <button 
                                    className="tkt-row-delete-btn" 
                                    onClick={() => promptDelete(ticket.id)} 
                                    title="Delete Ticket"
                                >
                                    <FiTrash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredTickets.length === 0 && !loading && (
                        <div className="tickets-empty-container">
                            <div className="tkt-empty-icon-circle">
                                <FiMessageSquare size={36} />
                            </div>
                            <h3 className="tkt-empty-title">All caught up!</h3>
                            <p className="tkt-empty-desc">There are no support tickets matching your current filter.</p>
                            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                                Create Issue
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Confirm Modal */}
            <ConfirmModal 
                isOpen={confirmDialog.isOpen}
                title="Delete Ticket?"
                message="Are you sure you want to permanently delete this support ticket? This action cannot be undone."
                onConfirm={executeDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, idToDelete: null })}
                confirmText="Yes, delete it"
            />

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiLifeBuoy style={{ color: 'var(--primary-color)' }} /> Create Support Ticket</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreate} className="auth-form">
                                <div className="input-field">
                                    <label>Issue Summary *</label>
                                    <input 
                                        type="text" 
                                        className="input-styled" 
                                        required 
                                        placeholder="e.g. Cannot access dashboard billing..." 
                                        value={formData.subject} 
                                        onChange={e => setFormData({...formData, subject: e.target.value})} 
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="input-field">
                                        <label>Priority</label>
                                        <select className="input-styled" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Status</label>
                                        <select className="input-styled" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label>Detailed Description</label>
                                    <textarea 
                                        className="input-styled" 
                                        placeholder="Provide system logs, user context, or replication steps..." 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})} 
                                    />
                                </div>
                                <div className="ai-modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Submit Ticket'}
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
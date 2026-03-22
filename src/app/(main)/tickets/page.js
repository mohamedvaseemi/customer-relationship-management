'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiHeadphones,
    FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../leads/leads.css';

export default function TicketsPage() {
    const { token, loading: authLoading } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        status: 'open',
        priority: 'medium',
        category: 'Support',
        assigned_to: ''
    });

    const loadTickets = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);

            const response = await fetch(`/api/tickets?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTickets(data.tickets || []);
            }
        } catch (error) {
            console.error('Failed to load tickets:', error);
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, statusFilter]);

    useEffect(() => {
        if (!authLoading && token) {
            loadTickets();
        }
    }, [authLoading, token, loadTickets]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedTicket ? `/api/tickets/${selectedTicket.id}` : '/api/tickets';
            const method = selectedTicket ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowModal(false);
                resetForm();
                loadTickets();
            }
        } catch (error) {
            console.error('Failed to save ticket:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            try {
                const response = await fetch(`/api/tickets/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    loadTickets();
                }
            } catch (error) {
                console.error('Failed to delete ticket:', error);
            }
        }
    };

    const handleEdit = (ticket) => {
        setSelectedTicket(ticket);
        setFormData({
            subject: ticket.subject || '',
            description: ticket.description || '',
            status: ticket.status || 'open',
            priority: ticket.priority || 'medium',
            category: ticket.category || 'Support',
            assigned_to: ticket.assigned_to || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedTicket(null);
        setFormData({
            subject: '', description: '', status: 'open', priority: 'medium', category: 'Support', assigned_to: ''
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <FiClock className="text-warning" />;
            case 'in_progress': return <FiActivity className="text-primary" />;
            case 'resolved': return <FiCheckCircle className="text-success" />;
            case 'closed': return <FiX className="text-muted" />;
            default: return <FiAlertCircle />;
        }
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Service Desk</h1>
                    <p className="page-subtitle">Track and resolve customer support requests and technical issues.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => { resetForm(); setShowModal(true); }}>
                        <FiPlus /> New Ticket
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFilter />
                    <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loader">Loading tickets...</div>
                </div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>
                                        <div className="name-text">{ticket.subject}</div>
                                        <div className="position-text">
                                            {ticket.category} • {ticket.first_name ? `${ticket.first_name} ${ticket.last_name}` : 'Unknown Contact'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="status-badge-alt" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {getStatusIcon(ticket.status)}
                                            {ticket.status.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`priority-tag ${ticket.priority}`}>
                                            {ticket.priority}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm opacity-70">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => handleEdit(ticket)}><FiEdit2 /></button>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(ticket.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No tickets found. Your service desk is clear!
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
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">{selectedTicket ? 'Edit Ticket' : 'New Ticket'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Subject</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Priority</label>
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
                                        <div className="input-field">
                                            <label>Status</label>
                                            <select
                                                className="select-alt"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-field" style={{ marginTop: '1rem' }}>
                                        <label>Description</label>
                                        <textarea
                                            className="input-alt"
                                            style={{ minHeight: '120px', paddingTop: '10px' }}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium">{selectedTicket ? 'Update Ticket' : 'Create Ticket'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter,
    FiCalendar, FiPhone, FiCheckCircle, FiClock, FiAlertCircle, FiX,
    FiList, FiUser
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../leads/leads.css';

export default function ActivitiesPage() {
    const { token, loading: authLoading } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        activity_type: 'task',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        priority: 'medium',
        assigned_to: ''
    });

    const loadActivities = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('type', typeFilter);

            const response = await fetch(`/api/activities?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setActivities(data.activities || []);
            }
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    }, [token, statusFilter, typeFilter]);

    useEffect(() => {
        if (!authLoading && token) {
            loadActivities();
        }
    }, [authLoading, token, loadActivities]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedActivity ? `/api/activities/${selectedActivity.id}` : '/api/activities';
            const method = selectedActivity ? 'PUT' : 'POST';
            
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
                loadActivities();
            }
        } catch (error) {
            console.error('Failed to save activity:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                const response = await fetch(`/api/activities/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    loadActivities();
                }
            } catch (error) {
                console.error('Failed to delete activity:', error);
            }
        }
    };

    const handleEdit = (act) => {
        setSelectedActivity(act);
        setFormData({
            subject: act.subject || '',
            description: act.description || '',
            activity_type: act.activity_type || 'task',
            due_date: act.due_date ? new Date(act.due_date).toISOString().split('T')[0] : '',
            status: act.status || 'pending',
            priority: act.priority || 'medium',
            assigned_to: act.assigned_to || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedActivity(null);
        setFormData({
            subject: '', description: '', activity_type: 'task',
            due_date: new Date().toISOString().split('T')[0],
            status: 'pending', priority: 'medium', assigned_to: ''
        });
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'call': return <FiPhone className="text-info" />;
            case 'meeting': return <FiUser className="text-secondary" style={{ color: '#8b5cf6' }} />;
            case 'email': return <FiList className="text-primary" />;
            default: return <FiCheckCircle />;
        }
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Activity Hub</h1>
                    <p className="page-subtitle">Track every interaction and task across your entire sales strategy.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => { resetForm(); setShowModal(true); }}>
                        <FiPlus /> New Engagement
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <FiCalendar />
                    <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="call">Calls</option>
                        <option value="meeting">Meetings</option>
                        <option value="task">Tasks</option>
                    </select>
                </div>
                <div className="filter-group">
                    <FiFilter />
                    <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="loader">Syncing engagement data...</div></div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Activity Details</th>
                                <th>Type</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map(act => (
                                <tr key={act.id}>
                                    <td>
                                        <div className="name-text">{act.subject}</div>
                                        <div className="position-text">
                                            {act.first_name ? `${act.first_name} ${act.last_name}` : act.lead_name || 'System Action'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="status-badge-alt" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getActivityIcon(act.activity_type)}
                                            {act.activity_type}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {new Date(act.due_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-badge-alt ${act.status}`}>
                                            {act.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => handleEdit(act)}><FiEdit2 /></button>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(act.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activities.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        No active engagements found. Start planning your next strategic move!
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
                                <h2 className="modal-title">{selectedActivity ? 'Edit Engagement' : 'Plan Engagement'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Strategic Objective (Subject)</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Engagement Type</label>
                                            <select
                                                className="select-alt"
                                                value={formData.activity_type}
                                                onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                                            >
                                                <option value="task">Task</option>
                                                <option value="call">Call</option>
                                                <option value="meeting">Meeting</option>
                                                <option value="email">Email</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Planned Date</label>
                                            <input
                                                type="date"
                                                className="input-alt"
                                                value={formData.due_date}
                                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Workflow Status</label>
                                            <select
                                                className="select-alt"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-field" style={{ marginTop: '1rem' }}>
                                        <label>Strategic Context (Description)</label>
                                        <textarea
                                            className="input-alt"
                                            style={{ minHeight: '100px', paddingTop: '10px' }}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium">Lock Flow</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

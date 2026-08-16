"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { activitiesAPI } from '@/api/api';
import { 
    FiCalendar, FiCheckSquare, FiPhone, FiMail, 
    FiPlus, FiSearch, FiCheck, FiTrash2, FiClock, 
    FiAlertCircle, FiX, FiCheckCircle, FiUser, FiTarget
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Activities.css';

const TYPE_FILTERS = [
    { key: '', label: 'All Activities', icon: FiCalendar },
    { key: 'task', label: 'Tasks', icon: FiCheckSquare },
    { key: 'meeting', label: 'Meetings', icon: FiCalendar },
    { key: 'call', label: 'Calls', icon: FiPhone },
    { key: 'email', label: 'Emails', icon: FiMail }
];

export default function ActivitiesPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'task', subject: '', description: '', priority: 'medium', due_date: '', status: 'pending'
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const res = await activitiesAPI.getAll({
                type: selectedType || undefined,
                status: statusFilter || undefined
            });
            setActivities(res.data.activities || []);
        } catch (err) {
            console.error('Failed to load activities:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedType, statusFilter]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const filteredActivities = useMemo(() => {
        return activities.filter(act => 
            (act.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (act.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activities, searchQuery]);

    // Quick Status Toggle (Pending -> Completed)
    const handleToggleComplete = async (act) => {
        const newStatus = act.status === 'completed' ? 'pending' : 'completed';
        try {
            setActivities(prev => prev.map(a => a.id === act.id ? { ...a, status: newStatus } : a));
            await activitiesAPI.update(act.id, { ...act, status: newStatus });
        } catch (err) {
            console.error('Failed to update status:', err);
            fetchActivities();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this activity?')) return;
        try {
            setActivities(prev => prev.filter(a => a.id !== id));
            await activitiesAPI.delete(id);
        } catch (err) {
            console.error('Failed to delete activity:', err);
            fetchActivities();
        }
    };

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await activitiesAPI.create(formData);
            setIsModalOpen(false);
            setFormData({ type: 'task', subject: '', description: '', priority: 'medium', due_date: '', status: 'pending' });
            fetchActivities();
        } catch (err) {
            console.error('Failed to create activity:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'meeting': return <FiCalendar style={{ color: '#8b5cf6' }} />;
            case 'call': return <FiPhone style={{ color: '#10b981' }} />;
            case 'email': return <FiMail style={{ color: '#ec4899' }} />;
            default: return <FiCheckSquare style={{ color: '#4f46e5' }} />;
        }
    };

    return (
        <div className="activities-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Activities & Schedule</h1>
                    <p className="page-subtitle">Track follow-ups, meetings, and daily task workflow</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> New Activity
                </button>
            </div>

            {/* Filter Chips Bar */}
            <div className="filters-bar card">
                <div className="search-wrapper">
                    <FiSearch />
                    <input 
                        type="text" 
                        placeholder="Search activities by subject or description..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="type-filters">
                    {TYPE_FILTERS.map(tf => {
                        const Icon = tf.icon;
                        return (
                            <button 
                                key={tf.key} 
                                className={`filter-chip ${selectedType === tf.key ? 'active' : ''}`}
                                onClick={() => setSelectedType(tf.key)}
                            >
                                <Icon /> {tf.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Timeline Layout */}
            <div className="activities-timeline">
                <div className="timeline-items">
                    {filteredActivities.map(act => (
                        <div key={act.id} className={`timeline-card card ${act.status === 'completed' ? 'completed' : ''}`}>
                            <div className="timeline-marker">
                                <div className="marker-icon">
                                    {getTypeIcon(act.type)}
                                </div>
                                <div className="marker-line" />
                            </div>

                            <div className="activity-content">
                                <div className="activity-header">
                                    <div>
                                        <h3 className="activity-subject">{act.subject}</h3>
                                        <div className="activity-meta">
                                            <span className="activity-time">
                                                <FiClock size={12} /> {act.due_date ? new Date(act.due_date).toLocaleDateString() : 'No Due Date'}
                                            </span>
                                            <span className={`priority-indicator p-${act.priority}`}>
                                                <FiAlertCircle size={12} /> {act.priority?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button 
                                            className={`toggle-complete-btn ${act.status === 'completed' ? 'done' : ''}`}
                                            onClick={() => handleToggleComplete(act)}
                                            title="Mark Status"
                                        >
                                            {act.status === 'completed' ? <FiCheckCircle /> : <FiCheck />}
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(act.id)}>
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {act.description && (
                                    <p className="activity-desc">{act.description}</p>
                                )}

                                <div className="activity-relations">
                                    <div className="relation-tags">
                                        {act.contact_first_name && (
                                            <span className="relation-tag contact">
                                                <FiUser size={10} /> {act.contact_first_name} {act.contact_last_name || ''}
                                            </span>
                                        )}
                                        {act.lead_title && (
                                            <span className="relation-tag lead">
                                                <FiTarget size={10} /> {act.lead_title}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`status-pill ${act.status}`}>
                                        {act.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredActivities.length === 0 && !loading && (
                        <div className="card text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                            No activities found. Click "New Activity" to schedule one.
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE ACTIVITY MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiCalendar /> Schedule New Activity</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateActivity} className="auth-form">
                                <div className="form-row">
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Activity Type</label>
                                        <select className="input-styled" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option value="task">Task</option>
                                            <option value="meeting">Meeting</option>
                                            <option value="call">Call</option>
                                            <option value="email">Email</option>
                                        </select>
                                    </div>
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Priority</label>
                                        <select className="input-styled" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-field">
                                    <label>Subject / Title *</label>
                                    <input type="text" className="input-styled" required placeholder="e.g. Discovery Demo Call with Client" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                                </div>

                                <div className="input-field">
                                    <label>Due Date & Time</label>
                                    <input type="datetime-local" className="input-styled" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                                </div>

                                <div className="input-field">
                                    <label>Description / Notes</label>
                                    <textarea className="input-styled" rows="3" placeholder="Add preparation notes or call details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>

                                <div className="ai-modal-footer" style={{ marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save Activity'}
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
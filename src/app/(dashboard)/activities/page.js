"use client";
import { useState, useEffect, useMemo } from 'react';
import { activitiesAPI, contactsAPI, leadsAPI } from '@/api/api';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar,
    FiPhone, FiMail, FiCheckCircle, FiClock, FiMessageSquare, FiFlag
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import '@/styles/Activities.css';

export default function Activities() {
    const [activities, setActivities] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const [formData, setFormData] = useState({
        type: 'call',
        subject: '',
        description: '',
        due_date: '',
        contact_id: '',
        lead_id: '',
        status: 'pending',
        priority: 'medium'
    });

    useEffect(() => {
        loadActivities();
        loadRelatedData();
    }, [searchTerm, typeFilter]);

    const loadActivities = async () => {
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (typeFilter) params.type = typeFilter;

            const response = await activitiesAPI.getAll(params);
            setActivities(response.data.activities);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedData = async () => {
        try {
            const [contactsRes, leadsRes] = await Promise.all([
                contactsAPI.getAll(),
                leadsAPI.getAll()
            ]);
            setContacts(contactsRes.data.contacts || []);
            setLeads(leadsRes.data.leads || []);
        } catch (error) {
            console.error('Failed to load related data:', error);
        }
    };

    const groupedActivities = useMemo(() => {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        activities.forEach(activity => {
            try {
                const date = parseISO(activity.due_date);
                if (isToday(date)) groups.today.push(activity);
                else if (isYesterday(date)) groups.yesterday.push(activity);
                else if (isThisWeek(date)) groups.thisWeek.push(activity);
                else groups.older.push(activity);
            } catch (err) {
                groups.older.push(activity);
            }
        });

        return groups;
    }, [activities]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                contact_id: formData.contact_id || null,
                lead_id: formData.lead_id || null
            };

            if (selectedActivity) {
                await activitiesAPI.update(selectedActivity.id, dataToSubmit);
            } else {
                await activitiesAPI.create(dataToSubmit);
            }
            setShowModal(false);
            resetForm();
            loadActivities();
        } catch (error) {
            console.error('Failed to save activity:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await activitiesAPI.delete(id);
                loadActivities();
            } catch (error) {
                console.error('Failed to delete activity:', error);
            }
        }
    };

    const handleEdit = (activity) => {
        setSelectedActivity(activity);
        setFormData({
            type: activity.type,
            subject: activity.subject,
            description: activity.description || '',
            due_date: new Date(activity.due_date).toISOString().slice(0, 16),
            contact_id: activity.contact_id || '',
            lead_id: activity.lead_id || '',
            status: activity.status,
            priority: activity.priority
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedActivity(null);
        setFormData({
            type: 'call',
            subject: '',
            description: '',
            due_date: '',
            contact_id: '',
            lead_id: '',
            status: 'pending',
            priority: 'medium'
        });
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'call': return { icon: <FiPhone />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
            case 'meeting': return { icon: <FiCalendar />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
            case 'email': return { icon: <FiMail />, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' };
            case 'note': return { icon: <FiMessageSquare />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            default: return { icon: <FiCheckCircle />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
        }
    };

    const renderTimelineSection = (title, items) => {
        if (items.length === 0) return null;

        return (
            <div className="timeline-section">
                <div className="section-divider">
                    <span>{title}</span>
                </div>
                <div className="timeline-items">
                    {items.map((activity, idx) => {
                        const style = getActivityIcon(activity.type);
                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`timeline-card card ${activity.status === 'completed' ? 'completed' : ''}`}
                            >
                                <div className="timeline-marker">
                                    <div className="marker-icon" style={{ color: style.color, backgroundColor: style.bg }}>
                                        {style.icon}
                                    </div>
                                    <div className="marker-line"></div>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <div className="activity-main">
                                            <h4 className="activity-subject">{activity.subject}</h4>
                                            <div className="activity-meta">
                                                <span className="activity-time">
                                                    <FiClock /> {format(parseISO(activity.due_date), 'h:mm a')}
                                                </span>
                                                <span className={`priority-indicator p-${activity.priority}`}>
                                                    <FiFlag /> {activity.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="activity-actions">
                                            <button className="action-btn" onClick={() => handleEdit(activity)}>
                                                <FiEdit2 />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(activity.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                    {activity.description && (
                                        <p className="activity-desc">{activity.description}</p>
                                    )}
                                    <div className="activity-relations">
                                        {(activity.contact_name || activity.lead_title) && (
                                            <div className="relation-tags">
                                                {activity.contact_name && (
                                                    <span className="relation-tag contact">
                                                        {activity.contact_name}
                                                    </span>
                                                )}
                                                {activity.lead_title && (
                                                    <span className="relation-tag lead">
                                                        {activity.lead_title}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className={`status-pill ${activity.status}`}>
                                            {activity.status}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="activities-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Engagement Feed</h1>
                    <p className="page-subtitle">Timeline of all interactions, tasks, and future engagements.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FiPlus /> Schedule Activity
                    </button>
                </div>
            </div>

            <div className="activities-layout">
                <div className="activities-timeline">
                    <div className="filters-bar card">
                        <div className="search-wrapper">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search in timeline..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="type-filters">
                            {['call', 'meeting', 'email', 'task'].map(type => (
                                <button
                                    key={type}
                                    className={`filter-chip ${typeFilter === type ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                                >
                                    {getActivityIcon(type).icon}
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="timeline-container">
                            {activities.length === 0 ? (
                                <div className="empty-timeline card">
                                    <FiCalendar size={48} style={{ margin: '0 auto 1rem' }} />
                                    <h3>No activities listed</h3>
                                    <p>Your timeline is clear. Start by scheduling an interaction.</p>
                                </div>
                            ) : (
                                <>
                                    {renderTimelineSection('Today', groupedActivities.today)}
                                    {renderTimelineSection('Yesterday', groupedActivities.yesterday)}
                                    {renderTimelineSection('Earlier this Week', groupedActivities.thisWeek)}
                                    {renderTimelineSection('Older Activities', groupedActivities.older)}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="activities-sidebar">
                    <div className="quick-stats-card card">
                        <h4 className="side-title">Productivity Summary</h4>
                        <div className="stat-grid">
                            <div className="stat-item">
                                <span className="stat-label">Total Work</span>
                                <span className="stat-value">{activities.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Completed</span>
                                <span className="stat-value">{activities.filter(a => a.status === 'completed').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedActivity ? 'Edit Engagement' : 'Plan New Engagement'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FiPlus style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-field">
                                        <label>Interaction Type</label>
                                        <select
                                            className="select-alt"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="call">Voice Call</option>
                                            <option value="meeting">In-person Meeting</option>
                                            <option value="email">Electronic Mail</option>
                                            <option value="task">Operational Task</option>
                                            <option value="note">Internal Note</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Current Status</label>
                                        <select
                                            className="select-alt"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="input-field full-width">
                                        <label>Subject / Headline</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field full-width">
                                        <label>Detailed Description</label>
                                        <textarea
                                            className="input-alt"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Scheduled Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            className="input-alt"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Relative Priority</label>
                                        <select
                                            className="select-alt"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Velocity</option>
                                            <option value="urgent">Critical Path</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Related Contact</label>
                                        <select
                                            className="select-alt"
                                            value={formData.contact_id}
                                            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                                        >
                                            <option value="">No Contact Linked</option>
                                            {contacts.map(c => (
                                                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Related Opportunity</label>
                                        <select
                                            className="select-alt"
                                            value={formData.lead_id}
                                            onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                                        >
                                            <option value="">No Lead Linked</option>
                                            {leads.map(l => (
                                                <option key={l.id} value={l.id}>{l.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Dismiss</button>
                                <button type="submit" className="btn btn-primary">{selectedActivity ? 'Update Plan' : 'Confirm Engagement'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

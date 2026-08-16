"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { activitiesAPI } from '@/api/api';
import { 
    FiPhone, FiPhoneCall, FiPhoneForwarded, FiPlus, 
    FiSearch, FiTrash2, FiX, FiClock, FiCheckCircle 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Calls.css';

export default function CallsPage() {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'call', subject: '', description: '', priority: 'medium', due_date: '', status: 'pending'
    });

    const fetchCalls = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch only activities of type 'call'
            const res = await activitiesAPI.getAll({ type: 'call' });
            setCalls(res.data.activities || []);
        } catch (err) {
            console.error('Failed to load calls:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCalls();
    }, [fetchCalls]);

    const filteredCalls = useMemo(() => {
        return calls.filter(call => 
            (call.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (call.contact_first_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [calls, searchQuery]);

    const handleCreateCall = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await activitiesAPI.create(formData);
            setIsModalOpen(false);
            setFormData({ type: 'call', subject: '', description: '', priority: 'medium', due_date: '', status: 'pending' });
            fetchCalls();
        } catch (err) {
            console.error('Failed to log call:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleComplete = async (call) => {
        const newStatus = call.status === 'completed' ? 'pending' : 'completed';
        try {
            setCalls(prev => prev.map(c => c.id === call.id ? { ...c, status: newStatus } : c));
            await activitiesAPI.update(call.id, { ...call, status: newStatus });
        } catch (err) {
            console.error('Failed to update call status:', err);
            fetchCalls();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this call log?')) return;
        try {
            setCalls(prev => prev.filter(c => c.id !== id));
            await activitiesAPI.delete(id);
        } catch (err) {
            console.error('Failed to delete call:', err);
            fetchCalls();
        }
    };

    return (
        <div className="calls-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Call Logs & Dialer</h1>
                    <p className="page-subtitle">Manage upcoming sales calls and log completed outreach</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> Log a Call
                </button>
            </div>

            {/* Search */}
            <div className="filters-section card" style={{ marginBottom: '1.5rem' }}>
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        className="input" 
                        placeholder="Search calls by subject or contact name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Calls Grid */}
            <div className="calls-grid">
                {filteredCalls.map(call => (
                    <div key={call.id} className={`call-card card ${call.status === 'completed' ? 'completed' : ''}`}>
                        <div className="call-card-header">
                            <div className="call-icon-box">
                                {call.status === 'completed' ? <FiPhoneForwarded /> : <FiPhoneCall />}
                            </div>
                            <div className="call-actions">
                                <button 
                                    className={`action-btn toggle-btn ${call.status === 'completed' ? 'done' : ''}`}
                                    onClick={() => handleToggleComplete(call)}
                                    title="Mark as completed"
                                >
                                    <FiCheckCircle size={18} />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(call.id)}>
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="call-card-body">
                            <h3 className="call-subject">{call.subject}</h3>
                            {call.contact_first_name && (
                                <p className="call-contact">
                                    To: <strong>{call.contact_first_name} {call.contact_last_name || ''}</strong>
                                </p>
                            )}
                            <p className="call-desc">{call.description || 'No notes provided.'}</p>
                        </div>

                        <div className="call-card-footer">
                            <span className="call-time">
                                <FiClock size={12} /> 
                                {call.due_date ? new Date(call.due_date).toLocaleDateString() : 'Unscheduled'}
                            </span>
                            <span className={`status-pill ${call.status}`}>
                                {call.status}
                            </span>
                        </div>
                    </div>
                ))}

                {filteredCalls.length === 0 && !loading && (
                    <div className="empty-state-box" style={{ gridColumn: '1 / -1' }}>
                        <FiPhone size={32} />
                        <p>No call logs found. Start dialing and log your first call!</p>
                    </div>
                )}
            </div>

            {/* LOG CALL MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiPhoneCall style={{ color: '#10b981' }} /> Log or Schedule a Call</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateCall} className="auth-form">
                                <div className="input-field">
                                    <label>Call Subject *</label>
                                    <input 
                                        type="text" 
                                        className="input-styled" 
                                        required 
                                        placeholder="e.g. Follow-up on pricing proposal" 
                                        value={formData.subject} 
                                        onChange={e => setFormData({...formData, subject: e.target.value})} 
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="input-field">
                                        <label>Call Status</label>
                                        <select className="input-styled" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option value="pending">Scheduled (Upcoming)</option>
                                            <option value="completed">Completed (Logged)</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Date & Time</label>
                                        <input 
                                            type="datetime-local" 
                                            className="input-styled" 
                                            value={formData.due_date} 
                                            onChange={e => setFormData({...formData, due_date: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label>Call Notes / Outcome</label>
                                    <textarea 
                                        className="input-styled" 
                                        rows="3" 
                                        placeholder="Summarize the conversation..." 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})} 
                                    />
                                </div>
                                <div className="ai-modal-footer" style={{ marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save Call Log'}
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
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FiPlus, FiPhone, FiPhoneCall, FiPhoneIncoming, FiPhoneMissed,
    FiSearch, FiFilter, FiEdit2, FiTrash2, FiClock, FiUser, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../leads/leads.css';

export default function CallsPage() {
    const { token, loading: authLoading } = useAuth();
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        contact_id: '',
        lead_id: '',
        duration_seconds: 300,
        outcome: 'answered',
        notes: ''
    });

    const loadCalls = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('/api/calls', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setCalls(data.calls || []);
            }
        } catch (error) {
            console.error('Failed to load calls:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            loadCalls();
        }
    }, [authLoading, token, loadCalls]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/calls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowModal(false);
                resetForm();
                loadCalls();
            }
        } catch (error) {
            console.error('Failed to save call:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            contact_id: '', lead_id: '', duration_seconds: 300, outcome: 'answered', notes: ''
        });
    };

    const formatDuration = (sec) => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        return `${min}:${s.toString().padStart(2, '0')}`;
    };

    const getOutcomeIcon = (outcome) => {
        switch(outcome) {
            case 'answered': return <FiPhoneIncoming className="text-success" />;
            case 'voicemail': return <FiPhoneCall className="text-info" />;
            case 'busy': return <FiPhone className="text-warning" />;
            default: return <FiPhoneMissed className="text-danger" />;
        }
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Voice Engagement</h1>
                    <p className="page-subtitle">Detailed log of telephonic strategic interactions and conversion outcomes.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => setShowModal(true)}>
                        <FiPhoneCall /> Register Engagement
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="loader">Processing logs...</div></div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Contact Interaction</th>
                                <th>Outcome</th>
                                <th>Operational Duration</th>
                                <th>Strategic Notes</th>
                                <th>Call Timeline</th>
                                <th>Assigned To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calls.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="name-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getOutcomeIcon(item.outcome)}
                                            {item.first_name ? `${item.first_name} ${item.last_name}` : 'Unknown Contact'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-badge-alt ${item.outcome}`}>
                                            {item.outcome}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <FiClock style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                            {formatDuration(item.duration_seconds)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-xs opacity-50" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.notes || 'No meta notes registered.'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {new Date(item.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm font-bold opacity-80">{item.user_name || 'System Auto'}</div>
                                    </td>
                                </tr>
                            ))}
                            {calls.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        No voiced engagements found in your strategic history.
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
                            style={{ maxWidth: '600px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Register Voiced Engagement</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field">
                                            <label>Contact ID</label>
                                            <input
                                                type="number"
                                                className="input-alt"
                                                value={formData.contact_id}
                                                onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Call Outcome</label>
                                            <select
                                                className="select-alt"
                                                value={formData.outcome}
                                                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                                            >
                                                <option value="answered">Answered & Engaging</option>
                                                <option value="voicemail">Voicemail Registered</option>
                                                <option value="busy">Channel Busy</option>
                                                <option value="no_answer">No Strategic Answer</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Engagement Duration (Seconds)</label>
                                            <input
                                                type="number"
                                                className="input-alt"
                                                value={formData.duration_seconds}
                                                onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-field" style={{ marginTop: '1rem' }}>
                                        <label>Strategic Conversation Notes</label>
                                        <textarea
                                            className="input-alt"
                                            style={{ minHeight: '100px', paddingTop: '10px' }}
                                            placeholder="Detail the interaction and next steps..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium">Commit Log</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

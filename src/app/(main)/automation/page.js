'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FiPlus, FiTrash2, FiActivity, FiSettings, FiZap, FiTarget,
    FiMessageCircle, FiEdit2, FiX, FiCheckCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../leads/leads.css';

export default function AutomationPage() {
    const { token, loading: authLoading } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        trigger_event: 'new_lead',
        description: '',
        tasks: [
            { action_type: 'send_email', delay_days: 0, task_subject: 'Welcome Message' },
            { action_type: 'create_task', delay_days: 1, task_subject: 'Follow-up Call' }
        ]
    });

    const loadAutomations = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('/api/automation', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error('Failed to load automations:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            loadAutomations();
        }
    }, [authLoading, token, loadAutomations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/automation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowModal(false);
                setFormData({
                    name: '', trigger_event: 'new_lead', description: '',
                    tasks: [{ action_type: 'send_email', delay_days: 0, task_subject: 'Welcome Message' }]
                });
                loadAutomations();
            }
        } catch (error) {
            console.error('Failed to save automation:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this automation flow?')) {
            try {
                const response = await fetch(`/api/automation/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    loadAutomations();
                }
            } catch (error) {
                console.error('Failed to delete automation:', error);
            }
        }
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales Automation</h1>
                    <p className="page-subtitle">Configure intelligent workflows and marketing sequences based on lead triggers.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => setShowModal(true)}>
                        <FiZap /> Design Workflow
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="loader">Initializing flows...</div></div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Sequence Name</th>
                                <th>Trigger Event</th>
                                <th>Tasks</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="name-text">{item.name}</div>
                                        <div className="position-text">{item.description || 'No description provided'}</div>
                                    </td>
                                    <td>
                                        <div className="status-badge-alt" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                                            <FiZap style={{ marginRight: '5px' }} /> {item.trigger_event.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <FiActivity style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                            {item.task_count} automated actions
                                        </div>
                                    </td>
                                    <td>
                                        <div className="status-badge-alt" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                                            Active
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {templates.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        No automation templates found. Start by defining your first high-performance sequence.
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="modal card"
                            style={{ maxWidth: '600px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Design Strategy</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Workflow Name</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                placeholder="e.g. Inbound Lead Nurturing"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Triggering Event</label>
                                            <select
                                                className="select-alt"
                                                value={formData.trigger_event}
                                                onChange={(e) => setFormData({ ...formData, trigger_event: e.target.value })}
                                            >
                                                <option value="new_lead">When a new lead is created</option>
                                                <option value="status_won">When a deal is closed won</option>
                                                <option value="high_priority">When a lead status is high priority</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: '2rem' }}>
                                        <label className="text-sm font-bold opacity-70 mb-2 block">Planned Sequence Steps</label>
                                        <div style={{ border: '1px dashed var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                                            {formData.tasks.map((task, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{i+1}</div>
                                                    <div className="text-sm">{task.action_type === 'send_email' ? '📧 Email' : '📞 Call'}: {task.task_subject}</div>
                                                </div>
                                            ))}
                                            <p className="text-xs opacity-50 italic">AI will generate detailed task payloads automatically during runtime execution.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium">Activate Strategic Flow</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

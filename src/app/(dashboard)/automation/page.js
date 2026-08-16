"use client";
import { useState, useEffect, useCallback } from 'react';
import { workflowsAPI } from '@/api/api';
import { 
    FiZap, FiPlus, FiTrash2, FiX, FiCheckCircle, 
    FiClock, FiTarget, FiUser, FiBriefcase
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Automation.css';

export default function AutomationPage() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Simple Form State for JSONB mapping
    const [formData, setFormData] = useState({
        name: '',
        module: 'leads',
        trigger_event: 'created',
        action_type: 'send_email',
        action_payload: ''
    });

    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        try {
            const res = await workflowsAPI.getAll();
            setWorkflows(res.data.workflows || []);
        } catch (err) {
            console.error('Failed to fetch workflows:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w));
            await workflowsAPI.toggle(id, !currentStatus);
        } catch (err) {
            console.error('Failed to toggle workflow:', err);
            fetchWorkflows();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this automation rule?')) return;
        try {
            setWorkflows(prev => prev.filter(w => w.id !== id));
            await workflowsAPI.delete(id);
        } catch (err) {
            console.error('Failed to delete workflow:', err);
            fetchWorkflows();
        }
    };

    const handleCreateWorkflow = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Package form data into JSONB structures expected by API
            const payload = {
                name: formData.name,
                module: formData.module,
                trigger_event: formData.trigger_event,
                conditions: {}, 
                actions: { 
                    type: formData.action_type, 
                    value: formData.action_payload 
                }
            };
            
            await workflowsAPI.create(payload);
            setIsModalOpen(false);
            setFormData({ name: '', module: 'leads', trigger_event: 'created', action_type: 'send_email', action_payload: '' });
            fetchWorkflows();
        } catch (err) {
            console.error('Failed to create workflow:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const getModuleIcon = (moduleName) => {
        switch(moduleName) {
            case 'leads': return <FiTarget />;
            case 'deals': return <FiBriefcase />;
            case 'contacts': return <FiUser />;
            default: return <FiZap />;
        }
    };

    return (
        <div className="automation-container" style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Automations</h1>
                    <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>Automate your CRM tasks and trigger instant actions.</p>
                </div>
                {/* FIXED: Replaced Link with onClick Modal trigger */}
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> Create Workflow
                </button>
            </div>

            {/* Workflow List */}
            <div className="workflow-grid" style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {workflows.map(workflow => {
                    const actionsObj = typeof workflow.actions === 'string' ? JSON.parse(workflow.actions) : (workflow.actions || {});
                    
                    return (
                        <div key={workflow.id} className="card template-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                        {getModuleIcon(workflow.module)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{workflow.name}</h3>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                            When {workflow.module} is {workflow.trigger_event}
                                        </span>
                                    </div>
                                </div>
                                <div className={`status-toggle ${workflow.is_active ? 'on' : 'off'}`} onClick={() => handleToggleStatus(workflow.id, workflow.is_active)} style={{ cursor: 'pointer' }}>
                                    <div className="toggle-slider" />
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Action:</strong> {actionsObj.type?.replace('_', ' ').toUpperCase() || 'Custom Action'}
                                <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', opacity: 0.8 }}>"{actionsObj.value || 'Execute system logic'}"</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FiClock /> {new Date(workflow.created_at).toLocaleDateString()}
                                </span>
                                <button className="action-btn delete" onClick={() => handleDelete(workflow.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {workflows.length === 0 && !loading && (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                        <FiZap size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <h3>No Automations Active</h3>
                        <p>Click "Create Workflow" to build your first CRM automation rule.</p>
                    </div>
                )}
            </div>

            {/* CREATE WORKFLOW MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiZap style={{ color: '#f59e0b' }}/> Create Automation Rule</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateWorkflow} className="auth-form">
                                <div className="input-field">
                                    <label>Rule Name *</label>
                                    <input type="text" className="input-styled" required placeholder="e.g. Notify sales on new Hot Lead" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                
                                <div className="form-row">
                                    <div className="input-field">
                                        <label>Target Module</label>
                                        <select className="input-styled" value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})}>
                                            <option value="leads">Leads</option>
                                            <option value="deals">Deals</option>
                                            <option value="contacts">Contacts</option>
                                            <option value="tickets">Support Tickets</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Trigger Event</label>
                                        <select className="input-styled" value={formData.trigger_event} onChange={e => setFormData({...formData, trigger_event: e.target.value})}>
                                            <option value="created">Is Created</option>
                                            <option value="updated">Is Updated</option>
                                            <option value="deleted">Is Deleted</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-field">
                                    <label>Automated Action</label>
                                    <select className="input-styled" value={formData.action_type} onChange={e => setFormData({...formData, action_type: e.target.value})}>
                                        <option value="send_email">Send Email Alert</option>
                                        <option value="create_task">Create Follow-up Task</option>
                                        <option value="slack_notify">Send Slack Notification</option>
                                        <option value="web_hook">Trigger Webhook</option>
                                    </select>
                                </div>

                                <div className="input-field">
                                    <label>Action Payload / Message</label>
                                    <textarea className="input-styled" required placeholder="Describe the action text or webhook URL..." value={formData.action_payload} onChange={e => setFormData({...formData, action_payload: e.target.value})} />
                                </div>

                                <div className="ai-modal-footer" style={{ marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Activate Workflow'}
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
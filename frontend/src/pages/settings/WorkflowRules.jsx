import { useState, useEffect } from 'react';
import { workflowsAPI } from '../../api/api';
import { FiPlus, FiZap, FiTrash2, FiPlay, FiStopCircle, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './WorkflowRules.css';

const WorkflowRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        module: 'leads',
        trigger_event: 'create',
        action_type: 'email'
    });

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        try {
            const response = await workflowsAPI.getAll();
            setRules(response.data.rules);
        } catch (error) {
            console.error('Failed to load rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            const rule = {
                ...formData,
                conditions: [],
                actions: [{ type: formData.action_type }]
            };
            await workflowsAPI.create(rule);
            setShowAddModal(false);
            setFormData({ name: '', module: 'leads', trigger_event: 'create', action_type: 'email' });
            loadRules();
        } catch (error) {
            console.error('Failed to create rule:', error);
        }
    };

    const handleToggle = async (rule) => {
        try {
            await workflowsAPI.toggle(rule.id, !rule.is_active);
            loadRules();
        } catch (error) {
            console.error('Failed to toggle rule:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this workflow rule?')) {
            try {
                await workflowsAPI.delete(id);
                loadRules();
            } catch (error) {
                console.error('Failed to delete rule:', error);
            }
        }
    };

    return (
        <div className="workflows-page">
            <div className="settings-breadcrumb">
                <span>Setup</span> &gt; <span>Automation</span> &gt; <span>Workflow Rules</span>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Workflow Rules</h1>
                    <p className="text-muted">Automate your business processes using trigger-based rules.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <FiPlus /> Create Rule
                </button>
            </div>

            <div className="rules-list card p-0">
                <table className="w-full text-left">
                    <thead className="border-b border-color">
                        <tr>
                            <th className="p-4">Rule Name</th>
                            <th className="p-4">Module</th>
                            <th className="p-4">Trigger</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center">Loading rules...</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-muted">No workflow rules defined.</td></tr>
                        ) : rules.map(rule => (
                            <tr key={rule.id} className="border-b border-color hover:bg-secondary">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`rule-icon ${rule.is_active ? 'active' : ''}`}>
                                            <FiZap />
                                        </div>
                                        <span className="font-medium">{rule.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 capitalize">{rule.module}</td>
                                <td className="p-4">On {rule.trigger_event}</td>
                                <td className="p-4">
                                    <button
                                        className={`status-toggle ${rule.is_active ? 'on' : 'off'}`}
                                        onClick={() => handleToggle(rule)}
                                    >
                                        <div className="toggle-slider"></div>
                                        <span>{rule.is_active ? 'Active' : 'Inactive'}</span>
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(rule.id)} className="text-danger p-2 hover:bg-danger-bg rounded">
                                        <FiTrash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="modal card"
                        style={{ maxWidth: '500px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="text-xl font-bold">New Workflow Rule</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleCreateRule}>
                            <div className="modal-body flex flex-col gap-4">
                                <div className="input-field">
                                    <label>Rule Name</label>
                                    <input
                                        type="text"
                                        className="input-alt"
                                        placeholder="e.g. Notify on High Value Deal"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-field">
                                        <label>Module</label>
                                        <select
                                            className="select-alt"
                                            value={formData.module}
                                            onChange={e => setFormData({ ...formData, module: e.target.value })}
                                        >
                                            <option value="leads">Leads</option>
                                            <option value="deals">Deals</option>
                                            <option value="contacts">Contacts</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Trigger When</label>
                                        <select
                                            className="select-alt"
                                            value={formData.trigger_event}
                                            onChange={e => setFormData({ ...formData, trigger_event: e.target.value })}
                                        >
                                            <option value="create">Record Created</option>
                                            <option value="update">Record Updated</option>
                                            <option value="delete">Record Deleted</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label>Instant Action</label>
                                    <select
                                        className="select-alt"
                                        value={formData.action_type}
                                        onChange={e => setFormData({ ...formData, action_type: e.target.value })}
                                    >
                                        <option value="email">Send Email Notification</option>
                                        <option value="field_update">Update Fields</option>
                                        <option value="webhook">Trigger Webhook</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer flex gap-4 mt-6">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Create Rule</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default WorkflowRules;

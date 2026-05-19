"use client";
import React, { useState, useEffect } from 'react';
import { workflowsAPI } from '@/api/api';
import { FiPlus, FiZap, FiTrash2, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '@/styles/WorkflowRules.css';

export default function WorkflowRules() {
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
            setRules(response.data.rules || []);
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
            <div className="settings-breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <span>Setup</span> &gt; <span>Automation</span> &gt; <span>Workflow Rules</span>
            </div>

            <div className="flex justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Workflow Rules</h1>
                    <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>Automate your business processes using trigger-based rules.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <FiPlus /> Create Rule
                </button>
            </div>

            <div className="rules-list card p-0" style={{ padding: 0 }}>
                <table className="w-full text-left" style={{ width: '100%' }}>
                    <thead className="border-b border-color">
                        <tr>
                            <th style={{ padding: '12px 16px' }}>Rule Name</th>
                            <th style={{ padding: '12px 16px' }}>Module</th>
                            <th style={{ padding: '12px 16px' }}>Trigger</th>
                            <th style={{ padding: '12px 16px' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading rules...</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-muted" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No workflow rules defined.</td></tr>
                        ) : rules.map(rule => (
                            <tr key={rule.id} className="border-b border-color hover:bg-secondary">
                                <td style={{ padding: '12px 16px' }}>
                                    <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className={`rule-icon ${rule.is_active ? 'active' : ''}`} style={{ width: '32px', height: '32px', borderRadius: '50%', background: rule.is_active ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: rule.is_active ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                                            <FiZap />
                                        </div>
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{rule.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: 'var(--text-primary)' }}>{rule.module}</td>
                                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>On {rule.trigger_event}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <button
                                        className={`status-toggle ${rule.is_active ? 'on' : 'off'}`}
                                        onClick={() => handleToggle(rule)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <div className="toggle-slider"></div>
                                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{rule.is_active ? 'Active' : 'Inactive'}</span>
                                    </button>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(rule.id)} className="text-danger" style={{ background: 'transparent', cursor: 'pointer', padding: '6px' }}>
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
                            <div className="modal-body flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                            <div className="modal-footer flex gap-4 mt-6" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Create Rule</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

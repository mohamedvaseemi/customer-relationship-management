"use client";
import React, { useState, useEffect } from 'react';
import { customFieldsAPI } from '@/api/api';
import { FiPlus, FiTrash2, FiSettings, FiCheck, FiX, FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '@/styles/ModulesAndFields.css';

const MODULES = [
    { id: 'leads', name: 'Leads' },
    { id: 'contacts', name: 'Contacts' },
    { id: 'accounts', name: 'Accounts' },
    { id: 'deals', name: 'Deals' }
];

const DATA_TYPES = [
    { id: 'text', name: 'Single Line Text' },
    { id: 'textarea', name: 'Multi-line Text' },
    { id: 'number', name: 'Number' },
    { id: 'date', name: 'Date' },
    { id: 'picklist', name: 'Picklist' }
];

export default function ModulesAndFields() {
    const [selectedModule, setSelectedModule] = useState('leads');
    const [customFields, setCustomFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        field_label: '',
        field_name: '',
        data_type: 'text',
        is_mandatory: false,
        options: ''
    });

    useEffect(() => {
        loadFields();
    }, [selectedModule]);

    const loadFields = async () => {
        setLoading(true);
        try {
            const response = await customFieldsAPI.getByModule(selectedModule);
            setCustomFields(response.data.fields || []);
        } catch (error) {
            console.error('Failed to load fields:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateField = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                module_name: selectedModule,
                field_name: formData.field_label.toLowerCase().replace(/\s+/g, '_'),
                options: formData.data_type === 'picklist' ? formData.options.split(',').map(o => o.trim()) : null
            };
            await customFieldsAPI.create(data);
            setShowAddModal(false);
            setFormData({ field_label: '', field_name: '', data_type: 'text', is_mandatory: false, options: '' });
            loadFields();
        } catch (error) {
            console.error('Failed to create field:', error);
            alert(error.response?.data?.error || 'Failed to create field');
        }
    };

    const handleDeleteField = async (id) => {
        if (window.confirm('Are you sure you want to delete this custom field? Existing data for this field might be lost.')) {
            try {
                await customFieldsAPI.delete(id);
                loadFields();
            } catch (error) {
                console.error('Failed to delete field:', error);
            }
        }
    };

    return (
        <div className="modules-fields-page">
            <div className="settings-breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <span>Setup</span> &gt; <span>Customization</span> &gt; <span>Modules and Fields</span>
            </div>

            <div className="flex justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Modules and Fields</h1>
                    <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>Customize your data structure by adding layout-specific fields.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <FiPlus /> Add Custom Field
                </button>
            </div>

            <div className="modules-layout" style={{ display: 'flex', gap: '24px' }}>
                <div className="modules-sidebar flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                    {MODULES.map(m => (
                        <button
                            key={m.id}
                            className={`module-tab-btn ${selectedModule === m.id ? 'active' : ''}`}
                            onClick={() => setSelectedModule(m.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px' }}
                        >
                            <FiLayers /> {m.name}
                        </button>
                    ))}
                </div>

                <div className="fields-content card" style={{ flex: 1, padding: '24px' }}>
                    <div className="fields-header" style={{ marginBottom: '24px' }}>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{MODULES.find(m => m.id === selectedModule)?.name} Fields</h2>
                        <p className="text-sm text-muted" style={{ color: 'var(--text-secondary)' }}>Manage standard and custom attributes for {selectedModule}.</p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center" style={{ color: 'var(--text-muted)', padding: '32px 0' }}>Loading fields...</div>
                    ) : (
                        <div className="fields-list">
                            {customFields.length === 0 ? (
                                <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px 0', opacity: 0.7 }}>
                                    <FiSettings size={48} style={{ opacity: 0.3 }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No custom fields added yet for this module.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left" style={{ width: '100%' }}>
                                    <thead>
                                        <tr className="border-b border-color">
                                            <th style={{ padding: '12px' }}>Label</th>
                                            <th style={{ padding: '12px' }}>API Name</th>
                                            <th style={{ padding: '12px' }}>Data Type</th>
                                            <th style={{ padding: '12px' }}>Mandatory</th>
                                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customFields.map((field) => (
                                            <tr key={field.id} className="border-b border-color hover:bg-secondary">
                                                <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{field.field_label}</td>
                                                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{field.field_name}</td>
                                                <td style={{ padding: '12px', textTransform: 'capitalize', fontSize: '13px', color: 'var(--text-primary)' }}>{field.data_type}</td>
                                                <td style={{ padding: '12px' }}>
                                                    {field.is_mandatory ? <FiCheck style={{ color: 'var(--success-color)' }} /> : <FiX style={{ color: 'var(--text-muted)' }} />}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <button
                                                        className="text-danger"
                                                        onClick={() => handleDeleteField(field.id)}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                                    >
                                                        <FiTrash2 size={14} /> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal card"
                        style={{ maxWidth: '500px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="text-xl font-bold">Add Custom Field</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleCreateField}>
                            <div className="modal-body flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="input-field">
                                    <label>Field Label</label>
                                    <input
                                        type="text"
                                        className="input-alt"
                                        placeholder="e.g. VAT Number"
                                        value={formData.field_label}
                                        onChange={e => setFormData({ ...formData, field_label: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-field">
                                    <label>Data Type</label>
                                    <select
                                        className="select-alt"
                                        value={formData.data_type}
                                        onChange={e => setFormData({ ...formData, data_type: e.target.value })}
                                    >
                                        {DATA_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                {formData.data_type === 'picklist' && (
                                    <div className="input-field">
                                        <label>Options (Comma separated)</label>
                                        <textarea
                                            className="input-alt"
                                            placeholder="Option 1, Option 2, Option 3"
                                            value={formData.options}
                                            onChange={e => setFormData({ ...formData, options: e.target.value })}
                                            required
                                            rows="3"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id="mandatory"
                                        checked={formData.is_mandatory}
                                        onChange={e => setFormData({ ...formData, is_mandatory: e.target.checked })}
                                    />
                                    <label htmlFor="mandatory" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>Mark as Required</label>
                                </div>
                            </div>
                            <div className="modal-footer flex gap-4 mt-6" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Save Field</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

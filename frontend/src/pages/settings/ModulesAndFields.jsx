import { useState, useEffect } from 'react';
import { customFieldsAPI } from '../../api/api';
import { FiPlus, FiTrash2, FiSettings, FiCheck, FiX, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './ModulesAndFields.css';

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

const ModulesAndFields = () => {
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
            setCustomFields(response.data.fields);
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
            <div className="settings-breadcrumb">
                <span>Setup</span> &gt; <span>Customization</span> &gt; <span>Modules and Fields</span>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Modules and Fields</h1>
                    <p className="text-muted">Customize your data structure by adding layout-specific fields.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <FiPlus /> Add Custom Field
                </button>
            </div>

            <div className="modules-layout">
                <div className="modules-sidebar flex flex-col gap-2">
                    {MODULES.map(m => (
                        <button
                            key={m.id}
                            className={`module-tab-btn ${selectedModule === m.id ? 'active' : ''}`}
                            onClick={() => setSelectedModule(m.id)}
                        >
                            <FiLayers /> {m.name}
                        </button>
                    ))}
                </div>

                <div className="fields-content card">
                    <div className="fields-header">
                        <h2 className="text-lg font-bold">{MODULES.find(m => m.id === selectedModule)?.name} Fields</h2>
                        <p className="text-sm text-muted">Manage standard and custom attributes for {selectedModule}.</p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">Loading fields...</div>
                    ) : (
                        <div className="fields-list">
                            {customFields.length === 0 ? (
                                <div className="empty-state">
                                    <FiSettings size={48} opacity={0.2} />
                                    <p>No custom fields added yet for this module.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-color">
                                            <th className="p-4">Label</th>
                                            <th className="p-4">API Name</th>
                                            <th className="p-4">Data Type</th>
                                            <th className="p-4">Mandatory</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customFields.map((field) => (
                                            <tr key={field.id} className="border-b border-color hover:bg-secondary">
                                                <td className="p-4 font-medium">{field.field_label}</td>
                                                <td className="p-4 text-sm font-mono text-muted">{field.field_name}</td>
                                                <td className="p-4 capitalize text-sm">{field.data_type}</td>
                                                <td className="p-4">
                                                    {field.is_mandatory ? <FiCheck color="var(--success)" /> : <FiX color="var(--text-muted)" />}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        className="text-danger hover:underline flex items-center gap-1 ml-auto"
                                                        onClick={() => handleDeleteField(field.id)}
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
                            <div className="modal-body flex flex-col gap-4">
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
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="mandatory"
                                        checked={formData.is_mandatory}
                                        onChange={e => setFormData({ ...formData, is_mandatory: e.target.checked })}
                                    />
                                    <label htmlFor="mandatory" className="text-sm cursor-pointer">Mark as Required</label>
                                </div>
                            </div>
                            <div className="modal-footer flex gap-4 mt-6">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Save Field</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ModulesAndFields;

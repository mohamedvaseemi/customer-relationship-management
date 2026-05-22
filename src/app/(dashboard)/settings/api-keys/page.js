"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FiArrowLeft, FiPlus, FiTrash2, FiCopy, FiCheck, FiKey, 
    FiLock, FiEye, FiCalendar, FiShield, FiAlertTriangle, FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Settings.css';

export default function ApiKeysSettings() {
    const router = useRouter();
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);

    // Form inputs
    const [name, setName] = useState('');
    const [expiresInDays, setExpiresInDays] = useState('never');
    const [selectedScopes, setSelectedScopes] = useState(['contacts:read', 'leads:read']);

    // Newly created key modal state
    const [newRawKey, setNewRawKey] = useState(null);
    const [copied, setCopied] = useState(false);

    const AVAILABLE_SCOPES = [
        { id: 'contacts:read', label: 'Read Contacts', description: 'Allows retrieving contact list and details.' },
        { id: 'contacts:write', label: 'Write Contacts', description: 'Allows creating, modifying, and deleting contacts.' },
        { id: 'leads:read', label: 'Read Leads', description: 'Allows retrieving leads and timeline details.' },
        { id: 'leads:write', label: 'Write Leads', description: 'Allows creating and managing pipeline leads.' },
        { id: 'deals:read', label: 'Read Deals', description: 'Allows retrieving deals and pipeline stats.' },
        { id: 'deals:write', label: 'Write Deals', description: 'Allows modifying deals.' },
        { id: 'admin', label: 'Full Admin Access', description: 'Full access to developer and account settings.' }
    ];

    const fetchKeys = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/settings/api-keys', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.keys) {
                // Ensure parsing scopes if stored as string JSON
                const parsedKeys = response.data.keys.map(k => ({
                    ...k,
                    scopes: typeof k.scopes === 'string' ? JSON.parse(k.scopes) : (k.scopes || [])
                }));
                setKeys(parsedKeys);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to retrieve API keys.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setCreating(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const expiresDays = expiresInDays === 'never' ? null : parseInt(expiresInDays);
            
            const response = await axios.post('/api/settings/api-keys', {
                name,
                scopes: selectedScopes,
                expires_in_days: expiresDays
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewRawKey(response.data.rawKey);
            setName('');
            setExpiresInDays('never');
            setSelectedScopes(['contacts:read', 'leads:read']);
            
            // Refresh list
            fetchKeys();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create API key.' });
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        setActionLoading(id);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/settings/api-keys/${id}`, {
                is_active: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Optimistically or refetch
            setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus ? 1 : 0 } : k));
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update API key status.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteKey = async (id) => {
        if (!window.confirm('Are you sure you want to delete this API key permanently? This action cannot be undone.')) {
            return;
        }

        setActionLoading(id);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/settings/api-keys/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setKeys(keys.filter(k => k.id !== id));
            setMessage({ type: 'success', text: 'API key deleted successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete API key.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleScopeChange = (scopeId) => {
        if (selectedScopes.includes(scopeId)) {
            setSelectedScopes(selectedScopes.filter(s => s !== scopeId));
        } else {
            setSelectedScopes([...selectedScopes, scopeId]);
        }
    };

    const copyToClipboard = () => {
        if (!newRawKey) return;
        navigator.clipboard.writeText(newRawKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div>
                    <button onClick={() => router.push('/settings')} className="btn-back flex items-center gap-1 text-sm text-muted hover:text-primary mb-2 bg-none border-none cursor-pointer">
                        <FiArrowLeft size={16} /> Back to Setup
                    </button>
                    <h1 className="page-title">API Keys Management</h1>
                    <p className="page-subtitle">Generate and manage secure API keys for authenticating external integrations and tools.</p>
                </div>
            </div>

            {message && (
                <div className={`message-banner ${message.type === 'success' ? 'message-success' : 'message-danger'}`}>
                    <FiAlertCircle size={16} />
                    <span>{message.text}</span>
                </div>
            )}

            <div className="settings-grid" style={{ gridTemplateColumns: '1fr 1.5fr', alignItems: 'start' }}>
                {/* Form column */}
                <div className="settings-card card">
                    <div className="group-header">
                        <div className="group-icon">
                            <FiPlus size={20} />
                        </div>
                        <h3>Create New API Key</h3>
                    </div>

                    <form onSubmit={handleCreateKey} className="settings-form mt-4">
                        <div className="form-group">
                            <label htmlFor="key-name">API Key Name</label>
                            <input
                                id="key-name"
                                type="text"
                                className="input-styled"
                                placeholder="e.g. Website Contact Form Integration"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="key-expiry">Expiration</label>
                            <select
                                id="key-expiry"
                                className="input-styled select-styled"
                                value={expiresInDays}
                                onChange={(e) => setExpiresInDays(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.25rem',
                                    backgroundRepeat: 'no-repeat',
                                    paddingRight: '2rem'
                                }}
                            >
                                <option value="never">Never Expires</option>
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Scopes / Permissions</label>
                            <div className="scopes-list flex flex-col gap-2 mt-2" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                {AVAILABLE_SCOPES.map(scope => (
                                    <label key={scope.id} className="flex items-start gap-2 p-2 rounded hover:bg-hover-bg cursor-pointer text-sm" style={{ border: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedScopes.includes(scope.id)}
                                            onChange={() => handleScopeChange(scope.id)}
                                            className="mt-1"
                                        />
                                        <div>
                                            <span className="font-semibold block text-primary-color">{scope.label}</span>
                                            <span className="text-muted text-xs block">{scope.description}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2"
                            disabled={creating}
                        >
                            <FiKey size={16} />
                            {creating ? 'Creating API Key...' : 'Generate API Key'}
                        </button>
                    </form>
                </div>

                {/* API Keys Table column */}
                <div className="settings-card card" style={{ overflowX: 'auto' }}>
                    <div className="group-header">
                        <div className="group-icon">
                            <FiLock size={20} />
                        </div>
                        <h3>Active API Keys</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-muted">Loading your API keys...</div>
                    ) : keys.length === 0 ? (
                        <div className="p-8 text-center text-muted">
                            <FiKey size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No API keys generated yet.</p>
                            <p className="text-xs mt-1">Create one using the form on the left to start integrating.</p>
                        </div>
                    ) : (
                        <div className="mt-4" style={{ minWidth: '600px' }}>
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                        <th className="py-2 font-medium">Name</th>
                                        <th className="py-2 font-medium">Prefix</th>
                                        <th className="py-2 font-medium">Permissions / Scopes</th>
                                        <th className="py-2 font-medium">Expires</th>
                                        <th className="py-2 font-medium text-center">Status</th>
                                        <th className="py-2 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((k) => (
                                        <tr key={k.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td className="py-3 font-semibold text-primary">{k.name}</td>
                                            <td className="py-3 font-mono text-xs">{k.prefix || 'crm_...' }</td>
                                            <td className="py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {k.scopes && k.scopes.length > 0 ? (
                                                        k.scopes.map(s => (
                                                            <span key={s} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-mono">
                                                                {s}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted text-xs">No scopes</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 text-muted text-xs">
                                                {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="py-3 text-center">
                                                <button
                                                    onClick={() => handleToggleActive(k.id, k.is_active === 1)}
                                                    disabled={actionLoading === k.id}
                                                    className={`border-none rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${k.is_active === 1 ? 'bg-success/15 text-success hover:bg-success/25' : 'bg-danger/15 text-danger hover:bg-danger/25'}`}
                                                    style={{ transition: 'all 0.2s' }}
                                                >
                                                    {k.is_active === 1 ? 'Active' : 'Revoked'}
                                                </button>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteKey(k.id)}
                                                    disabled={actionLoading === k.id}
                                                    className="btn-delete bg-none border-none cursor-pointer text-danger hover:opacity-80 p-1.5 rounded"
                                                    title="Delete Key Permanently"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Modal for showing the newly generated Raw Key */}
            <AnimatePresence>
                {newRawKey && (
                    <motion.div 
                        className="modal-overlay fixed inset-0 flex items-center justify-center p-4 bg-black/60 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="modal-content card max-w-lg w-full p-6 text-center"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}
                        >
                            <div className="flex justify-center text-warning mb-4">
                                <FiAlertTriangle size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">API Key Successfully Generated</h3>
                            <p className="text-sm text-muted mb-4">
                                Please copy your API key and save it in a secure place. For security reasons, <strong>you will not be able to view this key again.</strong>
                            </p>

                            <div 
                                className="raw-key-box flex items-center justify-between p-3 rounded font-mono text-sm mb-6 w-full"
                                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                            >
                                <span className="text-primary truncate mr-2 select-all">{newRawKey}</span>
                                <button 
                                    onClick={copyToClipboard}
                                    className="btn-copy bg-primary text-white border-none rounded p-2 flex items-center justify-center cursor-pointer hover:opacity-90"
                                    style={{ background: copied ? 'var(--success-color)' : 'var(--primary-color)', minWidth: '40px', transition: 'all 0.2s' }}
                                >
                                    {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                                </button>
                            </div>

                            <button 
                                onClick={() => setNewRawKey(null)}
                                className="btn btn-primary w-full"
                            >
                                I have copied the API key
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

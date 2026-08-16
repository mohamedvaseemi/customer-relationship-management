"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FiArrowLeft, FiPlus, FiTrash2, FiCopy, FiCheck, FiKey, 
    FiShield, FiAlertTriangle, FiAlertCircle 
} from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/ApiKeys.css'; // Make sure this matches your CSS filename

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
            setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus ? 1 : 0 } : k));
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update API key status.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteKey = async (id) => {
        if (!window.confirm('Are you sure you want to delete this API key permanently? This action cannot be undone.')) return;

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
        <div className="api-keys-page">
            <div className="api-keys-header-section">
                <button onClick={() => router.push('/settings')} className="btn-back">
                    <FiArrowLeft size={16} /> Back to Setup
                </button>
                <h1 className="api-keys-title">API Keys Management</h1>
                <p className="api-keys-subtitle">Generate and manage secure API keys for authenticating external integrations and tools.</p>
            </div>

            {message && (
                <div className={`api-keys-alert ${message.type === 'success' ? 'success' : 'error'}`}>
                    <FiAlertCircle size={18} />
                    <span>{message.text}</span>
                </div>
            )}

            <div className="api-keys-layout">
                {/* --- Top Card: HORIZONTAL Form --- */}
                <div className="api-card">
                    <div className="api-card-header">
                        <div className="icon-circle"><FiPlus size={20} /></div>
                        <h3>Create New API Key</h3>
                    </div>

                    <form onSubmit={handleCreateKey} className="api-form">
                        <div className="api-form-grid">
                            <div className="input-field">
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

                            <div className="input-field">
                                <label htmlFor="key-expiry">Expiration</label>
                                <select
                                    id="key-expiry"
                                    className="input-styled"
                                    value={expiresInDays}
                                    onChange={(e) => setExpiresInDays(e.target.value)}
                                >
                                    <option value="never">Never Expires</option>
                                    <option value="7">7 Days</option>
                                    <option value="30">30 Days</option>
                                    <option value="90">90 Days</option>
                                    <option value="365">1 Year</option>
                                </select>
                            </div>

                            <div className="input-field scopes-wrapper">
                                <label>Scopes / Permissions</label>
                                <div className="scopes-horizontal-grid">
                                    {AVAILABLE_SCOPES.map(scope => {
                                        const isSelected = selectedScopes.includes(scope.id);
                                        return (
                                            <div 
                                                key={scope.id} 
                                                className={`scope-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleScopeChange(scope.id)}
                                            >
                                                <div className="scope-checkbox">
                                                    <input type="checkbox" checked={isSelected} readOnly />
                                                </div>
                                                <div className="scope-text">
                                                    <h4>{scope.label}</h4>
                                                    <p>{scope.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={creating}>
                                <FiKey size={16} />
                                {creating ? 'Creating API Key...' : 'Generate API Key'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- Bottom Card: FULL WIDTH Table --- */}
                <div className="api-card">
                    <div className="api-card-header">
                        <div className="icon-circle"><FiShield size={20} /></div>
                        <h3>Active API Keys</h3>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading your API keys...</div>
                    ) : keys.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><FiKey size={32} /></div>
                            <h4>No API keys generated yet.</h4>
                            <p>Create one using the form above to start integrating.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="api-table">
                                <thead>
                                    <tr>
                                        <th>Name & Prefix</th>
                                        <th>Permissions / Scopes</th>
                                        <th>Expires</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((k) => (
                                        <tr key={k.id}>
                                            <td>
                                                <div className="key-name">{k.name}</div>
                                                <div className="key-prefix">{k.key_prefix || 'kib_live_...'}</div>
                                            </td>
                                            <td>
                                                <div className="scopes-badges">
                                                    {k.scopes && k.scopes.length > 0 ? (
                                                        k.scopes.map(s => <span key={s} className="scope-badge">{s}</span>)
                                                    ) : (
                                                        <span className="text-muted text-xs">No scopes</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-muted text-sm">
                                                {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    onClick={() => handleToggleActive(k.id, k.is_active === 1)}
                                                    disabled={actionLoading === k.id}
                                                    className={`status-badge ${k.is_active === 1 ? 'active' : 'revoked'}`}
                                                >
                                                    {k.is_active === 1 ? 'Active' : 'Revoked'}
                                                </button>
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => handleDeleteKey(k.id)}
                                                    disabled={actionLoading === k.id}
                                                    className="btn-delete"
                                                    title="Delete Key Permanently"
                                                >
                                                    <FiTrash2 size={18} />
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

            {/* --- Success Modal for Raw Key --- */}
            <AnimatePresence>
                {newRawKey && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="modal-content text-center"
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        >
                            <div className="modal-warning-icon"><FiAlertTriangle size={36} /></div>
                            <h3 className="modal-title">API Key Successfully Generated</h3>
                            <p className="modal-desc">
                                Please copy your API key and save it in a secure place. For security reasons, <strong>you will not be able to view this key again.</strong>
                            </p>

                            <div className="raw-key-box">
                                <span className="raw-key-text">{newRawKey}</span>
                                <button onClick={copyToClipboard} className={`btn-copy ${copied ? 'copied' : ''}`}>
                                    {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                                </button>
                            </div>

                            <button onClick={() => setNewRawKey(null)} className="btn-primary w-full" style={{ marginTop: '1.5rem' }}>
                                I have copied the API key
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
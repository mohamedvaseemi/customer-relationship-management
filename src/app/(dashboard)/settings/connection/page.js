"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiCheckCircle, FiAlertCircle, FiDatabase } from 'react-icons/fi';
import axios from 'axios';
import '@/styles/Settings.css';

export default function ConnectionSettings() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        backend_connected: 0,
        backend_url: '',
        api_key: ''
    });
    const [sampleDataEnabled, setSampleDataEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testStatus, setTestStatus] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const sampleMode = localStorage.getItem('sampleDataEnabled') !== 'false';
            setSampleDataEnabled(sampleMode);
        }

        const fetchConnection = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/settings/connection', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.connection) {
                    setFormData(response.data.connection);
                }
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'Failed to load connection details.' });
            } finally {
                setLoading(false);
            }
        };
        fetchConnection();
    }, []);

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: val
        });
        setMessage(null);
        setTestStatus(null);
    };

    const handleTest = async () => {
        setTesting(true);
        setTestStatus(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/settings/connection', {
                action: 'test',
                backend_url: formData.backend_url,
                api_key: formData.api_key
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTestStatus({ success: true, message: response.data.message || 'Connection succeeded!' });
        } catch (err) {
            setTestStatus({
                success: false,
                message: err.response?.data?.error || err.message || 'Connection failed.'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData
            };
            const response = await axios.post('/api/settings/connection', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (typeof window !== 'undefined') {
                localStorage.setItem('sampleDataEnabled', sampleDataEnabled ? 'true' : 'false');
                window.dispatchEvent(new Event('storage'));
            }

            setMessage({ type: 'success', text: response.data.message || 'Connection settings saved successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save connection settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted">Loading connection settings...</div>;
    }

    return (
        <div className="settings-detail-container">
            <button onClick={() => router.push('/settings')} className="btn-back">
                <FiArrowLeft /> Back to Setup
            </button>

            <div className="settings-card-form">
                <h2 className="form-title">Website Connection</h2>
                <p className="form-subtitle">Connect your CRM workspace to your active website database or toggle sample database mode.</p>

                {message && (
                    <div className={`message-banner ${message.type === 'success' ? 'message-success' : 'message-danger'}`}>
                        {message.type === 'success' && <FiCheckCircle />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="sample-toggle-panel">
                        <div className="sample-toggle-info">
                            <h4>Sample Database Mode</h4>
                            <p>Use simulated client, deals, and pipeline information. Useful for testing UI design.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                id="sampleModeToggle"
                                checked={sampleDataEnabled}
                                onChange={(e) => {
                                    setSampleDataEnabled(e.target.checked);
                                    setMessage(null);
                                }}
                                style={{ marginRight: '8px', cursor: 'pointer' }}
                            />
                            <label htmlFor="sampleModeToggle" style={{ fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}>Enable Sample Data</label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Backend URL</label>
                        <div className="input-wrapper">
                    <div className="input-wrapper">
                        <FiDatabase />
                        <input
                            type="text"
                            name="backend_url"
                            className="input-styled"
                            placeholder="https://your-backend.com/api"
                            value={formData.backend_url || ''}
                            onChange={handleChange}
                        />
                    </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>API Key</label>
                        <div className="input-wrapper">
                    <div className="input-wrapper">
                        <FiDatabase />
                        <input
                            type="password"
                            name="api_key"
                            className="input-styled"
                            placeholder="Enter API Key"
                            value={formData.api_key || ''}
                            onChange={handleChange}
                        />
                    </div>
                        </div>
                    </div>

                    {testStatus && (
                        <div className={`message-banner ${testStatus.success ? 'message-success' : 'message-danger'}`}>
                            {testStatus.success ? <FiCheckCircle /> : <FiAlertCircle />}
                            <span>{testStatus.message}</span>
                        </div>
                    )}

                    <div className="form-row" style={{ marginTop: '1rem' }}>
                        <button
                            type="button"
                            className="btn-test"
                            style={{ flex: 1 }}
                            onClick={handleTest}
                            disabled={testing || !formData.backend_url}
                        >
                            {testing ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: '0' }} disabled={saving}>
                            <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

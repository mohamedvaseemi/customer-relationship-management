"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import '@/styles/Settings.css';

export default function CompanySettings() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        company_name: '',
        industry: 'Technology',
        website: '',
        employee_count: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/settings/company', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.company) {
                    setFormData(response.data.company);
                }
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'Failed to load company details.' });
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/settings/company', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: response.data.message || 'Company details updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update company details.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted">Loading business details...</div>;
    }

    return (
        <div className="settings-detail-container">
            <button onClick={() => router.push('/settings')} className="btn-back">
                <FiArrowLeft /> Back to Setup
            </button>

            <div className="settings-card-form">
                <h2 className="form-title">Company Details</h2>
                <p className="form-subtitle">Manage your business profile and industry taxonomy settings.</p>

                {message && (
                    <div className={`message-banner ${message.type === 'success' ? 'message-success' : 'message-danger'}`}>
                        {message.type === 'success' && <FiCheckCircle />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-group">
                        <label>Company Name *</label>
                        <input
                            type="text"
                            name="company_name"
                            className="input-styled"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Industry</label>
                        <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                        >
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Retail">Retail</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Education">Education</option>
                            <option value="Services">Services</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Website URL</label>
                        <input
                            type="url"
                            name="website"
                            className="input-styled"
                            placeholder="https://example.com"
                            value={formData.website || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Employee Count</label>
                        <select
                            name="employee_count"
                            value={formData.employee_count || '0'}
                            onChange={handleChange}
                        >
                            <option value="0">Not Specified</option>
                            <option value="10">1-10 Employees</option>
                            <option value="50">11-50 Employees</option>
                            <option value="200">51-200 Employees</option>
                            <option value="500">201-500 Employees</option>
                            <option value="1000">501+ Employees</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-submit" disabled={saving}>
                        <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}

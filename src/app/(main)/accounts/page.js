'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiBriefcase,
    FiGlobe, FiMail, FiPhone, FiMapPin, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../leads/leads.css';

export default function AccountsPage() {
    const { token, loading: authLoading } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        website: '',
        email: '',
        phone: '',
        industry: '',
        address: '',
        city: '',
        state: '',
        country: '',
        notes: ''
    });

    const loadCompanies = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (industryFilter) params.append('industry', industryFilter);

            const response = await fetch(`/api/companies?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setCompanies(data.companies || []);
            }
        } catch (error) {
            console.error('Failed to load companies:', error);
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, industryFilter]);

    useEffect(() => {
        if (!authLoading && token) {
            loadCompanies();
        }
    }, [authLoading, token, loadCompanies]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedCompany ? `/api/companies/${selectedCompany.id}` : '/api/companies';
            const method = selectedCompany ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowModal(false);
                resetForm();
                loadCompanies();
            }
        } catch (error) {
            console.error('Failed to save company:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                const response = await fetch(`/api/companies/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    loadCompanies();
                }
            } catch (error) {
                console.error('Failed to delete company:', error);
            }
        }
    };

    const handleEdit = (company) => {
        setSelectedCompany(company);
        setFormData({
            name: company.name || '',
            website: company.website || '',
            email: company.email || '',
            phone: company.phone || '',
            industry: company.industry || '',
            address: company.address || '',
            city: company.city || '',
            state: company.state || '',
            country: company.country || '',
            notes: company.notes || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedCompany(null);
        setFormData({
            name: '', website: '', email: '', phone: '', industry: '',
            address: '', city: '', state: '', country: '', notes: ''
        });
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Accounts</h1>
                    <p className="page-subtitle">Manage organizational relationships and enterprise entities.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => { resetForm(); setShowModal(true); }}>
                        <FiPlus /> New Account
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search accounts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFilter />
                    <select className="input" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
                        <option value="">All Industries</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Services">Services</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loader">Loading accounts...</div>
                </div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Organization</th>
                                <th>Industry</th>
                                <th>Location</th>
                                <th>Contact Info</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company.id}>
                                    <td>
                                        <div className="name-text">{company.name}</div>
                                        {company.website && (
                                            <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="position-text hover:text-primary">
                                                <FiGlobe style={{ display: 'inline', marginRight: '4px' }} /> {company.website}
                                            </a>
                                        )}
                                    </td>
                                    <td>
                                        <div className="status-badge-alt" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                                            {company.industry || 'General'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1 text-sm opacity-80">
                                            <FiMapPin /> {company.city}{company.country ? `, ${company.country}` : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {company.email && <div className="flex items-center gap-1"><FiMail /> {company.email}</div>}
                                            {company.phone && <div className="flex items-center gap-1"><FiPhone /> {company.phone}</div>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => handleEdit(company)}><FiEdit2 /></button>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(company.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {companies.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No account records found. Add your first organization.
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
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">{selectedCompany ? 'Edit Account' : 'New Account'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field">
                                            <label>Organization Name</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Industry</label>
                                            <select
                                                className="select-alt"
                                                value={formData.industry}
                                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            >
                                                <option value="">Select Industry</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Services">Services</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Website URL</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Phone Number</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Work Email</label>
                                            <input
                                                type="email"
                                                className="input-alt"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-field" style={{ marginTop: '1rem' }}>
                                        <label>Corporate Notes</label>
                                        <textarea
                                            className="input-alt"
                                            style={{ minHeight: '80px', paddingTop: '10px' }}
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium">{selectedCompany ? 'Update Account' : 'Create Account'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

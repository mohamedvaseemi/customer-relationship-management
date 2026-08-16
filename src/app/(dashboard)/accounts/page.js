"use client";
import { useState, useEffect, useCallback } from 'react';
import { companiesAPI } from '@/api/api';
import { FiBriefcase, FiPlus, FiSearch, FiGlobe, FiPhone, FiMail, FiTrash2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountsPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', industry: 'Technology', website: '', phone: '', email: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const res = await companiesAPI.getAll();
            setCompanies(res.data.companies || []);
        } catch (err) {
            console.error('Failed to load accounts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await companiesAPI.create(formData);
            setIsModalOpen(false);
            setFormData({ name: '', industry: 'Technology', website: '', phone: '', email: '' });
            fetchCompanies();
        } catch (err) {
            console.error('Failed to create account:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contacts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Accounts & Companies</h1>
                    <p className="page-subtitle">Manage client organizations and business relationships</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> New Account
                </button>
            </div>

            <div className="card table-responsive">
                <table className="contacts-table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Industry</th>
                            <th>Website</th>
                            <th>Email</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(comp => (
                            <tr key={comp.id}>
                                <td>
                                    <div className="name-text">{comp.name}</div>
                                </td>
                                <td>{comp.industry || 'Technology'}</td>
                                <td>
                                    {comp.website ? <a href={comp.website} target="_blank" rel="noreferrer" className="method-item"><FiGlobe /> {comp.website}</a> : 'N/A'}
                                </td>
                                <td>{comp.email || 'N/A'}</td>
                                <td>{comp.phone || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CREATE ACCOUNT MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiBriefcase /> Add New Account</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateCompany} className="auth-form">
                                <div className="input-field">
                                    <label>Company Name *</label>
                                    <input type="text" className="input-styled" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="form-row">
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Industry</label>
                                        <select className="input-styled" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                                            <option value="Technology">Technology</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Retail">Retail</option>
                                        </select>
                                    </div>
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Website</label>
                                        <input type="url" className="input-styled" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="ai-modal-footer" style={{ marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save Account'}
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
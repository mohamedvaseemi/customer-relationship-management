"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { companiesAPI } from '@/api/api';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiMail, FiPhone,
    FiMoreVertical, FiCheckSquare, FiSquare, FiDownload, FiGlobe, FiMapPin, FiBriefcase, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Contacts.css'; // Reusing styles for consistency

export default function Accounts() {
    const router = useRouter();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        website: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        employee_count: '',
        annual_revenue: '',
        notes: ''
    });

    useEffect(() => {
        loadCompanies();
    }, [searchTerm, industryFilter]);

    const loadCompanies = async () => {
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (industryFilter) params.industry = industryFilter;

            const response = await companiesAPI.getAll(params);
            setCompanies(response.data.companies);
        } catch (error) {
            console.error('Failed to load companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === companies.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(companies.map(c => c.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCompany) {
                await companiesAPI.update(selectedCompany.id, formData);
            } else {
                await companiesAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            loadCompanies();
        } catch (error) {
            console.error('Failed to save company:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                await companiesAPI.delete(id);
                loadCompanies();
            } catch (error) {
                console.error('Failed to delete company:', error);
            }
        }
    };

    const handleEdit = (company) => {
        setSelectedCompany(company);
        setFormData({
            name: company.name,
            industry: company.industry || '',
            website: company.website || '',
            phone: company.phone || '',
            email: company.email || '',
            address: company.address || '',
            city: company.city || '',
            state: company.state || '',
            country: company.country || '',
            postal_code: company.postal_code || '',
            employee_count: company.employee_count || '',
            annual_revenue: company.annual_revenue || '',
            notes: company.notes || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedCompany(null);
        setFormData({
            name: '',
            industry: '',
            website: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            state: '',
            country: '',
            postal_code: '',
            employee_count: '',
            annual_revenue: '',
            notes: ''
        });
    };

    return (
        <div className="contacts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Accounts</h1>
                    <p className="page-subtitle">Manage your partner and customer organizations.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <FiDownload /> Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FiPlus /> New Account
                    </button>
                </div>
            </div>

            <div className="contacts-toolbar">
                <div className="filters-container card">
                    <div className="search-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input-alt"
                            placeholder="Search accounts by name or website..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group-alt">
                        <select className="select-alt" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
                            <option value="">All Industries</option>
                            <option value="technology">Technology</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bulk-actions-bar"
                    >
                        <span className="selection-count">{selectedIds.length} items selected</span>
                        <div className="bulk-btns">
                            <button className="btn btn-sm btn-secondary">Bulk Edit</button>
                            <button className="btn btn-sm btn-danger">Delete Selected</button>
                        </div>
                    </motion.div>
                )}
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="table-responsive card">
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th className="checkbox-col">
                                    <button className="checkbox-btn" onClick={toggleSelectAll}>
                                        {selectedIds.length === companies.length && companies.length > 0 ? <FiCheckSquare color="var(--primary-color)" /> : <FiSquare />}
                                    </button>
                                </th>
                                <th>Account Name</th>
                                <th>Industry</th>
                                <th>Website</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {companies.map((company, index) => (
                                    <motion.tr
                                        key={company.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={selectedIds.includes(company.id) ? 'selected-row' : ''}
                                    >
                                        <td>
                                            <button className="checkbox-btn" onClick={() => toggleSelectOne(company.id)}>
                                                {selectedIds.includes(company.id) ? <FiCheckSquare color="var(--primary-color)" /> : <FiSquare />}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <div className="avatar-wrapper">
                                                    <div className="contact-avatar gradient-primary">
                                                        <FiBriefcase />
                                                    </div>
                                                </div>
                                                <div className="contact-meta">
                                                    <div className="contact-name-text">{company.name}</div>
                                                    <div className="contact-subtext">{company.industry || 'General'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="status-badge-alt badge-active">
                                                {company.industry || 'Other'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="method-item">
                                                <FiGlobe className="method-icon" /> {company.website || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="method-item">
                                                <FiPhone className="method-icon" /> {company.phone || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="method-item">
                                                <FiMapPin className="method-icon" /> {company.city || 'N/A'}, {company.country || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="row-actions">
                                                <button className="action-btn" onClick={() => handleEdit(company)} style={{ marginRight: '8px' }} title="Edit">
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button className="action-btn" onClick={() => handleDelete(company.id)} title="Delete">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                                        <label>Account Name</label>
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
                                            <option value="technology">Technology</option>
                                            <option value="finance">Finance</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="education">Education</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Website</label>
                                        <input
                                            type="url"
                                            className="input-alt"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            className="input-alt"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                    <div className="input-field">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Annual Revenue</label>
                                        <input
                                            type="number"
                                            className="input-alt"
                                            value={formData.annual_revenue}
                                            onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Employee Count</label>
                                        <input
                                            type="number"
                                            className="input-alt"
                                            value={formData.employee_count}
                                            onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{selectedCompany ? 'Update Account' : 'Create Account'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { contactsAPI } from '@/api/api';
import { 
    FiUsers, FiPlus, FiSearch, FiTrash2, 
    FiMail, FiPhone, FiX, FiBriefcase, FiUser
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/Contacts.css';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '', company: '', position: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await contactsAPI.getAll({ search: searchQuery || undefined });
            setContacts(res.data.contacts || []);
        } catch (err) {
            console.error('Failed to load contacts:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        try {
            setContacts(prev => prev.filter(c => c.id !== id));
            await contactsAPI.delete(id);
        } catch (err) {
            console.error('Failed to delete contact:', err);
            fetchContacts();
        }
    };

    const handleCreateContact = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await contactsAPI.create(formData);
            setIsModalOpen(false);
            setFormData({ first_name: '', last_name: '', email: '', phone: '', company: '', position: '' });
            fetchContacts();
        } catch (err) {
            console.error('Failed to create contact:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contacts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Contacts Directory</h1>
                    <p className="page-subtitle">Manage individual customer profiles and touchpoints</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> Add Contact
                </button>
            </div>

            <div className="filters-section card" style={{ marginBottom: '1.5rem' }}>
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        className="input" 
                        placeholder="Search by name, email, or organization..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="card table-responsive">
                <table className="contacts-table">
                    <thead>
                        <tr>
                            <th>Contact Name</th>
                            <th>Company & Title</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <div className="contact-cell">
                                        <div className="avatar-mini">
                                            {c.first_name ? c.first_name.charAt(0).toUpperCase() : <FiUser />}
                                        </div>
                                        <div>
                                            <div className="name-text">{c.first_name} {c.last_name || ''}</div>
                                            <div className="position-text">{c.source || 'Direct Contact'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="company-text">{c.company || 'N/A'}</div>
                                    <div className="position-text">{c.position || ''}</div>
                                </td>
                                <td>
                                    {c.email ? <a href={`mailto:${c.email}`} className="method-item"><FiMail /> {c.email}</a> : 'N/A'}
                                </td>
                                <td>
                                    {c.phone ? <span className="method-item"><FiPhone /> {c.phone}</span> : 'N/A'}
                                </td>
                                <td>
                                    <span className={`status-badge-alt badge-${c.status || 'active'}`}>
                                        <span className="dot" /> {c.status || 'active'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <button className="action-btn delete" onClick={() => handleDelete(c.id)}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CREATE CONTACT MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiUser /> Add New Contact</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateContact} className="auth-form">
                                <div className="form-row">
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>First Name *</label>
                                        <input type="text" className="input-styled" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                                    </div>
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Last Name</label>
                                        <input type="text" className="input-styled" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Email</label>
                                        <input type="email" className="input-styled" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Phone</label>
                                        <input type="text" className="input-styled" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Company Name</label>
                                        <input type="text" className="input-styled" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                                    </div>
                                    <div className="input-field" style={{ flex: 1 }}>
                                        <label>Job Position</label>
                                        <input type="text" className="input-styled" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ai-modal-footer" style={{ marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Save Contact'}
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
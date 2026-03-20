import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsAPI } from '../api/api';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiMail, FiPhone,
    FiMoreVertical, FiCheckSquare, FiSquare, FiDownload, FiUpload
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Contacts.css';

const Contacts = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        status: 'active',
        source: 'website'
    });

    useEffect(() => {
        loadContacts();
    }, [searchTerm, sourceFilter, statusFilter]);

    const loadContacts = async () => {
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (sourceFilter) params.source = sourceFilter;
            if (statusFilter) params.status = statusFilter;

            const response = await contactsAPI.getAll(params);
            setContacts(response.data.contacts);
        } catch (error) {
            console.error('Failed to load contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === contacts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(contacts.map(c => c.id));
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
            if (selectedContact) {
                await contactsAPI.update(selectedContact.id, formData);
            } else {
                await contactsAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            loadContacts();
        } catch (error) {
            console.error('Failed to save contact:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await contactsAPI.delete(id);
                loadContacts();
            } catch (error) {
                console.error('Failed to delete contact:', error);
            }
        }
    };

    const handleEdit = (contact) => {
        setSelectedContact(contact);
        setFormData({
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email || '',
            phone: contact.phone || '',
            company: contact.company || '',
            position: contact.position || '',
            status: contact.status,
            source: contact.source
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedContact(null);
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            company: '',
            position: '',
            status: 'active',
            source: 'website'
        });
    };

    return (
        <div className="contacts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Contacts Directory</h1>
                    <p className="page-subtitle">Centralized hub for all customer and partner relationships.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <FiDownload /> Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FiPlus /> New Contact
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
                            placeholder="Search by name, email or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group-alt">
                        <select className="select-alt" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                            <option value="">All Sources</option>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="social_media">Social Media</option>
                            <option value="cold_call">Cold Call</option>
                            <option value="event">Event</option>
                        </select>
                        <select className="select-alt" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Blocked</option>
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
                                        {selectedIds.length === contacts.length && contacts.length > 0 ? <FiCheckSquare color="var(--primary-color)" /> : <FiSquare />}
                                    </button>
                                </th>
                                <th>Contact Persona</th>
                                <th>Contact Method</th>
                                <th>Organization</th>
                                <th>Lead Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {contacts.map((contact, index) => (
                                    <motion.tr
                                        key={contact.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={selectedIds.includes(contact.id) ? 'selected-row' : ''}
                                    >
                                        <td>
                                            <button className="checkbox-btn" onClick={() => toggleSelectOne(contact.id)}>
                                                {selectedIds.includes(contact.id) ? <FiCheckSquare color="var(--primary-color)" /> : <FiSquare />}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <div className="avatar-wrapper">
                                                    <div className="contact-avatar gradient-primary">
                                                        {contact.first_name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="contact-meta">
                                                    <div className="contact-name-text">{contact.first_name} {contact.last_name}</div>
                                                    <div className="contact-subtext">{contact.position || 'No Title'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-method">
                                                <div className="method-item">
                                                    <FiMail className="method-icon" /> {contact.email || '—'}
                                                </div>
                                                <div className="method-item">
                                                    <FiPhone className="method-icon" /> {contact.phone || '—'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="company-text">{contact.company || 'Private Individual'}</div>
                                        </td>
                                        <td>
                                            <div className={`status-badge-alt badge-${contact.status}`}>
                                                <span className="dot"></span>
                                                {contact.status}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="row-actions">
                                                <button className="action-btn" onClick={() => navigate(`/contacts/${contact.id}`)}>
                                                    <FiMoreVertical />
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

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedContact ? 'Edit Identity' : 'Create New Identity'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-field">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            className="input-alt"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            className="input-alt"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Organization</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Position / Role</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Status</label>
                                        <select
                                            className="select-alt"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active Engagement</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="blocked">Nurturing Needed</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Acquisition Source</label>
                                        <select
                                            className="select-alt"
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        >
                                            <option value="website">Organic Website</option>
                                            <option value="referral">Internal Referral</option>
                                            <option value="social_media">Social Ecosystem</option>
                                            <option value="cold_call">Direct Outreach</option>
                                            <option value="event">Industry Event</option>
                                            <option value="other">Other Channel</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Dismiss</button>
                                <button type="submit" className="btn btn-primary">{selectedContact ? 'Confirm Changes' : 'Execute Creation'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Contacts;

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FiPlus, FiFileText, FiDownload, FiTrash2, FiSearch, FiFilter,
    FiFolder, FiShare2, FiEye, FiCheckCircle, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../leads/leads.css';

export default function DocumentsPage() {
    const { token, loading: authLoading } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'general',
        lead_id: '',
        deal_id: '',
        file_path: 'local://static/docs/draft.pdf',
        file_type: 'application/pdf',
        file_size: 154200
    });

    const loadDocuments = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('/api/documents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            loadDocuments();
        }
    }, [authLoading, token, loadDocuments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowModal(false);
                resetForm();
                loadDocuments();
            }
        } catch (error) {
            console.error('Failed to save document:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this document from the library?')) {
            try {
                const response = await fetch(`/api/documents/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    loadDocuments();
                }
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', category: 'general', lead_id: '', deal_id: '',
            file_path: 'local://static/docs/draft.pdf', file_type: 'application/pdf', file_size: 154200
        });
    };

    const getFileIcon = (type) => {
        if (type.includes('pdf')) return <FiFileText className="text-danger" />;
        if (type.includes('word') || type.includes('docx')) return <FiFileText className="text-primary" />;
        return <FiFileText />;
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Document Intelligence</h1>
                    <p className="page-subtitle">Centralized vault for sales collaterals, contracts, and strategic assets.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => setShowModal(true)}>
                        <FiPlus /> Strategic Asset
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search document names..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFolder />
                    <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="contract">Contracts</option>
                        <option value="proposal">Proposals</option>
                        <option value="marketing">Marketing Collaterals</option>
                        <option value="invoice">Invoices</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="loader">Indexing library...</div></div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Strategic Asset</th>
                                <th>Category</th>
                                <th>Linked Lead</th>
                                <th>Capacity</th>
                                <th>Added By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="name-text" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {getFileIcon(item.file_type)}
                                            {item.name}
                                        </div>
                                        <div className="position-text">{item.file_type.split('/')[1]?.toUpperCase() || 'FILE'} Document</div>
                                    </td>
                                    <td>
                                        <div className="status-badge-alt" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                                            {item.category}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm font-bold opacity-80">{item.lead_name || 'System Level'}</div>
                                    </td>
                                    <td>
                                        <div className="text-xs opacity-50">{(item.file_size / 1024).toFixed(1)} KB</div>
                                    </td>
                                    <td>
                                        <div className="text-sm">{item.created_by_name || 'System'}</div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon"><FiDownload /></button>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {documents.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        No indexed documents found. Your strategic vault is empty.
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
                            style={{ maxWidth: '600px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Index Strategic Asset</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                            <label>Document Name</label>
                                            <input
                                                type="text"
                                                className="input-alt"
                                                placeholder="e.g. Master Service Agreement 2026"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label>Document Category</label>
                                            <select
                                                className="select-alt"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option value="general">General</option>
                                                <option value="contract">Contract</option>
                                                <option value="proposal">Proposal</option>
                                                <option value="marketing">Marketing</option>
                                                <option value="invoice">Invoice</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Lead Linkage ID (Optional)</label>
                                            <input
                                                type="number"
                                                className="input-alt"
                                                value={formData.lead_id}
                                                onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '2rem', border: '2px dashed var(--border-color)', padding: '2rem', textAlign: 'center', borderRadius: '12px' }}>
                                        <FiFileText size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                        <p className="text-sm opacity-50">Upload or drop strategic binary file here.</p>
                                        <p className="text-xs opacity-30 mt-1">Maximum capacity: 25MB (PDF, DOCX, XLSX)</p>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium">Index Asset</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

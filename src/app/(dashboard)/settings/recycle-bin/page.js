"use client";
import React, { useState, useEffect } from 'react';
import { contactsAPI } from '@/api/api';
import { FiRefreshCw, FiTrash2, FiClock, FiUser, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import '@/styles/RecycleBin.css';

export default function RecycleBin() {
    const [deletedContacts, setDeletedContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDeleted();
    }, []);

    const loadDeleted = async () => {
        try {
            const response = await contactsAPI.getDeleted();
            setDeletedContacts(response.data.contacts || []);
        } catch (error) {
            console.error('Failed to load recycle bin:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await contactsAPI.restore(id);
            loadDeleted();
        } catch (error) {
            console.error('Restore failed:', error);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (window.confirm('Are you sure? This action cannot be undone.')) {
            try {
                await contactsAPI.delete(id, true);
                loadDeleted();
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
    };

    return (
        <div className="recycle-bin-page">
            <div className="settings-breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <span>Setup</span> &gt; <span>Data Administration</span> &gt; <span>Recycle Bin</span>
            </div>

            <div className="flex justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Recycle Bin</h1>
                    <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>Restore deleted records within 30 days of deletion.</p>
                </div>
                <div className="bg-info-bg text-info p-3 rounded-lg flex items-center gap-2 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--primary-color)' }}>
                    <FiInfo /> Records here will be permanently deleted after 30 days.
                </div>
            </div>

            <div className="card p-0 overflow-hidden" style={{ padding: 0 }}>
                <table className="w-full text-left" style={{ width: '100%' }}>
                    <thead>
                        <tr className="bg-secondary border-b border-color">
                            <th style={{ padding: '12px 16px' }}>Record Name</th>
                            <th style={{ padding: '12px 16px' }}>Module</th>
                            <th style={{ padding: '12px 16px' }}>Deleted On</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Scanning bin...</td></tr>
                        ) : deletedContacts.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-muted" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Recycle bin is empty.</td></tr>
                        ) : deletedContacts.map(contact => (
                            <tr key={contact.id} className="border-b border-color hover:bg-secondary">
                                <td style={{ padding: '12px 16px' }}>
                                    <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="avatar-mini" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                            <FiUser />
                                        </div>
                                        <div>
                                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{contact.first_name} {contact.last_name}</div>
                                            <div className="text-xs text-muted" style={{ color: 'var(--text-secondary)' }}>{contact.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}><span className="status-badge-alt badge-active">Contacts</span></td>
                                <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                                    <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}>
                                        <FiClock size={12} /> {format(new Date(contact.updated_at || contact.created_at || Date.now()), 'MMM d, yyyy h:mm a')}
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <div className="flex justify-end gap-2" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button
                                            className="btn-icon"
                                            title="Restore"
                                            onClick={() => handleRestore(contact.id)}
                                            style={{ color: 'var(--success-color)', background: 'transparent', cursor: 'pointer' }}
                                        >
                                            <FiRefreshCw />
                                        </button>
                                        <button
                                            className="btn-icon text-danger"
                                            title="Delete Permanently"
                                            onClick={() => handlePermanentDelete(contact.id)}
                                            style={{ color: 'var(--danger-color)', background: 'transparent', cursor: 'pointer' }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

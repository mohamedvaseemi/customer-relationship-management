import { useState, useEffect } from 'react';
import { contactsAPI } from '../../api/api';
import { FiRefreshCw, FiTrash2, FiClock, FiUser, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import './RecycleBin.css';

const RecycleBin = () => {
    const [deletedContacts, setDeletedContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDeleted();
    }, []);

    const loadDeleted = async () => {
        try {
            const response = await contactsAPI.getDeleted();
            setDeletedContacts(response.data.contacts);
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
            <div className="settings-breadcrumb">
                <span>Setup</span> &gt; <span>Data Administration</span> &gt; <span>Recycle Bin</span>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Recycle Bin</h1>
                    <p className="text-muted">Restore deleted records within 30 days of deletion.</p>
                </div>
                <div className="bg-info-bg text-info p-3 rounded-lg flex items-center gap-2 text-sm">
                    <FiInfo /> Records here will be permanently deleted after 30 days.
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary border-b border-color">
                            <th className="p-4">Record Name</th>
                            <th className="p-4">Module</th>
                            <th className="p-4">Deleted On</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center">Scanning bin...</td></tr>
                        ) : deletedContacts.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-muted">Recycle bin is empty.</td></tr>
                        ) : deletedContacts.map(contact => (
                            <tr key={contact.id} className="border-b border-color hover:bg-secondary">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar-mini">
                                            <FiUser />
                                        </div>
                                        <div>
                                            <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                                            <div className="text-xs text-muted">{contact.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4"><span className="badge-outline">Contacts</span></td>
                                <td className="p-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <FiClock size={12} /> {format(new Date(contact.updated_at), 'MMM d, yyyy h:mm a')}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="btn-icon text-success"
                                            title="Restore"
                                            onClick={() => handleRestore(contact.id)}
                                        >
                                            <FiRefreshCw />
                                        </button>
                                        <button
                                            className="btn-icon text-danger"
                                            title="Delete Permanently"
                                            onClick={() => handlePermanentDelete(contact.id)}
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
};

export default RecycleBin;

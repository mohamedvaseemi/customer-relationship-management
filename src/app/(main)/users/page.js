'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { FiUsers, FiEdit2, FiTrash2, FiSearch, FiShield, FiPlus, FiX, FiPhone, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../contacts/contacts.css';

const DEPARTMENTS = ['Sales', 'Marketing', 'Engineering', 'Support', 'Finance', 'HR', 'Operations', 'Executive'];

export default function UsersPage() {
    const { user: currentUser, token, loading: authLoading } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [formData, setFormData] = useState({
        name: '', email: '', role: 'user', password: '',
        phone: '', job_title: '', department: ''
    });

    const loadUsers = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setUsers(data.users || []);
            else toast.error(data.error || 'Failed to load users');
        } catch {
            toast.error('Network error loading users');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) loadUsers();
    }, [authLoading, token, loadUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
            const method = selectedUser ? 'PUT' : 'POST';
            const payload = { ...formData };
            if (selectedUser && !payload.password) delete payload.password;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                setShowModal(false);
                resetForm();
                loadUsers();
                toast.success(selectedUser ? 'User updated successfully!' : 'New user created!');
            } else {
                toast.error(data.error || 'Failed to save user');
            }
        } catch {
            toast.error('Network error saving user');
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const response = await fetch(`/api/users/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`${deleteTarget.name} removed.`);
                loadUsers();
            } else {
                toast.error(data.error || 'Failed to delete user');
            }
        } catch {
            toast.error('Network error deleting user');
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'user',
            password: '',
            phone: user.phone || '',
            job_title: user.job_title || '',
            department: user.department || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedUser(null);
        setFormData({ name: '', email: '', role: 'user', password: '', phone: '', job_title: '', department: '' });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.job_title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading) return <div className="loading-container"><div className="spinner"></div></div>;

    if (currentUser?.role !== 'admin') {
        return (
            <div className="contacts-page" style={{ textAlign: 'center', paddingTop: '6rem' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: 'var(--danger)' }}>
                    <FiShield />
                </div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.5rem' }}>Access Restricted</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Administrator privileges required to access User Management.</p>
                <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="contacts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Team Management</h1>
                    <p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''} in your workspace</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <FiPlus /> Invite Member
                    </button>
                </div>
            </div>

            <div className="contacts-toolbar">
                <div className="filters-container">
                    <div className="search-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input-alt"
                            placeholder="Search by name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : (
                <div className="table-responsive card">
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Contact</th>
                                <th>Work Info</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <td>
                                            <div className="contact-cell">
                                                <div className="avatar-wrapper">
                                                    <div
                                                        className="contact-avatar"
                                                        style={{ background: user.avatar_color || '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'var(--font-heading)' }}
                                                    >
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="contact-name-text">{user.name}</div>
                                                    <div className="contact-subtext">{user.bio ? user.bio.substring(0, 40) + '...' : 'No bio'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                            {user.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.phone}</div>}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.job_title || '—'}</div>
                                            {user.department && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.department}</div>}
                                        </td>
                                        <td>
                                            <div className="status-badge-alt" style={{
                                                backgroundColor: user.role === 'admin' ? 'rgba(139, 92, 246, 0.12)' : user.role === 'manager' ? 'rgba(248, 196, 54, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                                                color: user.role === 'admin' ? '#8b5cf6' : user.role === 'manager' ? '#b45309' : '#6366f1',
                                                textTransform: 'capitalize'
                                            }}>
                                                {user.role}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="text-right">
                                            <div className="row-actions">
                                                <button className="action-btn" onClick={() => handleEdit(user)} title="Edit user">
                                                    <FiEdit2 />
                                                </button>
                                                {user.id !== currentUser.id && (
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => setDeleteTarget(user)}
                                                        style={{ color: 'var(--danger)' }}
                                                        title="Remove user"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                            No team members match your search.
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.93 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.93 }}
                            className="modal card"
                            style={{ maxWidth: '580px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">{selectedUser ? 'Edit Team Member' : 'Invite New Member'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-grid">
                                        <div className="input-field">
                                            <label>Full Name</label>
                                            <input type="text" className="input-alt" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" />
                                        </div>
                                        <div className="input-field">
                                            <label>Email Address</label>
                                            <input type="email" className="input-alt" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required placeholder="john@company.com" />
                                        </div>
                                        <div className="input-field">
                                            <label>Phone Number</label>
                                            <input type="tel" className="input-alt" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                                        </div>
                                        <div className="input-field">
                                            <label>Role</label>
                                            <select className="select-alt" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                                <option value="user">User</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label>Job Title</label>
                                            <input type="text" className="input-alt" value={formData.job_title} onChange={e => setFormData({ ...formData, job_title: e.target.value })} placeholder="e.g. Sales Executive" />
                                        </div>
                                        <div className="input-field">
                                            <label>Department</label>
                                            <select className="select-alt" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                                <option value="">Select department</option>
                                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-field" style={{ gridColumn: '1 / -1' }}>
                                            <label>{selectedUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                                            <input type="password" className="input-alt" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!selectedUser} placeholder="Min 8 characters" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{selectedUser ? 'Save Changes' : 'Send Invite'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Remove Team Member?"
                message={`Are you sure you want to remove ${deleteTarget?.name} from ModernCRM? This action cannot be undone.`}
                confirmText="Remove Member"
            />
        </div>
    );
}

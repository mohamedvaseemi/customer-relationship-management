"use client";
import { useState, useEffect } from 'react';
import { usersAPI } from '@/api/api';
import { FiUsers, FiEdit2, FiTrash2, FiSearch, FiShield, FiPlus } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import '@/styles/Contacts.css';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        password: ''
    });

    useEffect(() => {
        if (currentUser && currentUser.role === 'admin') {
            loadUsers();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const loadUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedUser) {
                await usersAPI.update(selectedUser.id, formData);
            } else {
                await usersAPI.create(formData);
            }
            loadUsers();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save user:', error);
            alert(error.response?.data?.error || 'Failed to save user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersAPI.delete(id);
                loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert(error.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'user',
            password: ''
        });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                <FiShield size={48} className="text-muted" style={{ margin: '0 auto' }} />
                <h1 style={{ marginTop: '1rem' }}>Access Denied</h1>
                <p className="text-secondary">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="contacts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage system users and their roles</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Add User
                </button>
            </div>

            <div className="filters-section card">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="contact-cell">
                                        <div className="avatar-wrapper">
                                            <div className="contact-avatar gradient-primary">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <span className="name-text">{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge-alt role-badge badge-${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEdit(user)}
                                            disabled={user.id === currentUser.id}
                                            style={{ marginRight: '8px' }}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            className="btn-icon text-danger"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={user.id === currentUser.id}
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedUser ? 'Edit User' : 'Add New User'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-field">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="input-alt"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Role</label>
                                        <select
                                            className="select-alt"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="user">User</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>New Password (leave blank to keep current)</label>
                                        <input
                                            type="password"
                                            className="input-alt"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

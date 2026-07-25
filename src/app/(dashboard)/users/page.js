"use client";
import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '@/api/api';
import {
    FiUsers, FiEdit2, FiTrash2, FiSearch, FiShield, FiPlus,
    FiX, FiCheckCircle, FiAlertTriangle, FiUser, FiMail,
    FiLock, FiTag, FiSave, FiCalendar, FiFilter
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import '@/styles/Contacts.css';

const ROLE_COLORS = {
    admin:   { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
    manager: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    user:    { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
};

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    /* ── inline panel (add + edit) ── */
    const [panelOpen, setPanelOpen]       = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // null = add mode
    const [formData, setFormData] = useState({ name: '', email: '', role: 'user', password: '' });
    const [saving, setSaving]     = useState(false);

    /* ── feedback toasts ── */
    const [feedbacks, setFeedbacks] = useState([]);
    const pushFeedback = (msg, type = 'success') => {
        const id = Date.now();
        setFeedbacks(f => [...f, { id, msg, type }]);
        setTimeout(() => setFeedbacks(f => f.filter(x => x.id !== id)), 4000);
    };

    const loadUsers = useCallback(async () => {
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
            pushFeedback('Could not load users.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser?.role === 'admin') loadUsers();
        else setLoading(false);
    }, [currentUser, loadUsers]);

    /* ── open panel ── */
    const openAdd = () => {
        setSelectedUser(null);
        setFormData({ name: '', email: '', role: 'user', password: '' });
        setPanelOpen(true);
    };
    const openEdit = (u) => {
        setSelectedUser(u);
        setFormData({ name: u.name, email: u.email, role: u.role, password: '' });
        setPanelOpen(true);
    };
    const closePanel = () => { setPanelOpen(false); setSelectedUser(null); };

    /* ── save ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedUser) {
                await usersAPI.update(selectedUser.id, formData);
                pushFeedback(`${formData.name}'s profile updated successfully.`);
            } else {
                await usersAPI.create(formData);
                pushFeedback(`User "${formData.name}" created successfully.`);
            }
            await loadUsers();
            closePanel();
        } catch (error) {
            pushFeedback(error.response?.data?.error || 'Failed to save user.', 'error');
        } finally {
            setSaving(false);
        }
    };

    /* ── delete ── */
    const handleDelete = async (u) => {
        if (!window.confirm(`Remove "${u.name}" from the system?`)) return;
        try {
            await usersAPI.delete(u.id);
            await loadUsers();
            pushFeedback(`"${u.name}" was removed.`);
        } catch (error) {
            pushFeedback(error.response?.data?.error || 'Failed to delete user.', 'error');
        }
    };

    /* ── filter ── */
    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole   = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    /* ── guards ── */
    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    if (!currentUser || currentUser.role !== 'admin') return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '20px',
                background: 'rgba(250,92,124,0.1)', color: '#fa5c7c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '36px'
            }}><FiShield /></div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>Access Denied</h1>
            <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view this page.</p>
        </div>
    );

    const isAddMode = !selectedUser;

    return (
        <div style={{ position: 'relative' }}>
            {/* ── Toast Feedback Stack ── */}
            <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
                {feedbacks.map(fb => (
                    <div key={fb.id} style={{
                        padding: '13px 18px', borderRadius: '13px', display: 'flex',
                        alignItems: 'center', gap: '10px', minWidth: '280px', pointerEvents: 'all',
                        background: fb.type === 'error' ? 'rgba(250,92,124,0.15)' : 'rgba(10,207,151,0.15)',
                        border: `1px solid ${fb.type === 'error' ? 'rgba(250,92,124,0.4)' : 'rgba(10,207,151,0.4)'}`,
                        backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        animation: 'slideInRight 0.3s ease'
                    }}>
                        {fb.type === 'error'
                            ? <FiAlertTriangle size={16} color="#fa5c7c" />
                            : <FiCheckCircle   size={16} color="#0acf97" />}
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{fb.msg}</span>
                    </div>
                ))}
            </div>

            {/* ── Two-column layout when panel is open ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: panelOpen ? '1fr 380px' : '1fr',
                gap: '24px',
                transition: 'grid-template-columns 0.35s ease',
                alignItems: 'start'
            }}>

                {/* ═══════════════ LEFT — User List ═══════════════ */}
                <div>
                    {/* Page Header */}
                    <div className="page-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '13px',
                                background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 6px 18px rgba(109,40,217,0.35)'
                            }}>
                                <FiUsers size={22} color="white" />
                            </div>
                            <div>
                                <h1 className="page-title">User Management</h1>
                                <p className="page-subtitle">{users.length} total system user{users.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={openAdd} id="add-user-btn">
                            <FiPlus size={16} /> Add User
                        </button>
                    </div>

                    {/* Filters */}
                    <div style={{
                        display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
                        padding: '14px 18px', background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)', borderRadius: '14px'
                    }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                className="input-alt"
                                style={{ paddingLeft: '36px', borderRadius: '10px' }}
                                placeholder="Search users by name or email…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <FiFilter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <select
                                className="select-alt"
                                style={{ paddingLeft: '36px', borderRadius: '10px', minWidth: '140px' }}
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>

                    {/* User Cards Grid */}
                    {filtered.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '60px 20px',
                            background: 'var(--bg-secondary)', borderRadius: '16px',
                            border: '2px dashed var(--border-color)'
                        }}>
                            <FiUsers size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <h3 style={{ marginBottom: '6px' }}>No users found</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {searchTerm || filterRole !== 'all' ? 'Try adjusting your filters.' : 'Add your first user to get started.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: panelOpen ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '14px',
                            transition: 'all 0.3s'
                        }}>
                            {filtered.map(u => {
                                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.user;
                                const isEditing = selectedUser?.id === u.id;
                                return (
                                    <div
                                        key={u.id}
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            border: `1px solid ${isEditing ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            borderRadius: '14px', padding: '18px',
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                            transition: 'all 0.25s',
                                            boxShadow: isEditing ? '0 0 0 3px rgba(109,40,217,0.15)' : 'none',
                                            cursor: 'default'
                                        }}
                                        onMouseEnter={e => { if (!isEditing) e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                                        onMouseLeave={e => { if (!isEditing) e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                                            background: 'var(--primary-gradient)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px', fontWeight: 800
                                        }}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {u.name}
                                                </span>
                                                {u.id === currentUser.id && (
                                                    <span style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '99px', background: 'rgba(10,207,151,0.12)', color: '#0acf97', fontWeight: 700 }}>
                                                        You
                                                    </span>
                                                )}
                                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: rc.bg, color: rc.color, fontWeight: 700, textTransform: 'capitalize', marginLeft: 'auto' }}>
                                                    {u.role}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiMail size={11} /> {u.email}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiCalendar size={10} /> Joined {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                            <button
                                                onClick={() => isEditing ? closePanel() : openEdit(u)}
                                                disabled={u.id === currentUser.id}
                                                title={isEditing ? 'Close editor' : 'Edit user'}
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: u.id === currentUser.id ? 'not-allowed' : 'pointer',
                                                    background: isEditing ? 'rgba(109,40,217,0.12)' : 'var(--bg-tertiary)',
                                                    color: isEditing ? 'var(--primary-color)' : 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                                    opacity: u.id === currentUser.id ? 0.4 : 1
                                                }}
                                            >
                                                {isEditing ? <FiX size={14} /> : <FiEdit2 size={14} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u)}
                                                disabled={u.id === currentUser.id}
                                                title="Delete user"
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: u.id === currentUser.id ? 'not-allowed' : 'pointer',
                                                    background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                                    opacity: u.id === currentUser.id ? 0.4 : 1
                                                }}
                                                onMouseEnter={e => { if (u.id !== currentUser.id) { e.currentTarget.style.background = 'rgba(250,92,124,0.1)'; e.currentTarget.style.color = '#fa5c7c'; }}}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ═══════════════ RIGHT — Add / Edit Panel ═══════════════ */}
                {panelOpen && (
                    <div style={{
                        position: 'sticky', top: '80px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '18px', overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
                        animation: 'slideInRight 0.3s ease'
                    }}>
                        {/* panel top stripe */}
                        <div style={{ height: '4px', background: isAddMode ? 'linear-gradient(90deg,#6d28d9,#8b5cf6,#a78bfa)' : 'linear-gradient(90deg,#059669,#0acf97,#34d399)' }} />

                        {/* panel header */}
                        <div style={{
                            padding: '18px 20px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)',
                            background: isAddMode ? 'rgba(109,40,217,0.04)' : 'rgba(10,207,151,0.04)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: isAddMode ? 'linear-gradient(135deg,#6d28d9,#8b5cf6)' : 'linear-gradient(135deg,#059669,#0acf97)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {isAddMode ? <FiPlus size={16} color="white" /> : <FiEdit2 size={14} color="white" />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 700 }}>
                                        {isAddMode ? 'Add New User' : `Edit ${selectedUser?.name?.split(' ')[0]}`}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        {isAddMode ? 'Fill in the details below' : 'Update user profile & permissions'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={closePanel}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '7px', border: 'none',
                                    background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            ><FiX size={14} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                            {/* Name */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="input-alt"
                                        style={{ paddingLeft: '36px', borderRadius: '10px', fontSize: '14px' }}
                                        value={formData.name}
                                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                        placeholder="John Smith"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="email"
                                        className="input-alt"
                                        style={{ paddingLeft: '36px', borderRadius: '10px', fontSize: '14px' }}
                                        value={formData.email}
                                        onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                                        placeholder="john@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role picker */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
                                    Role
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {['user', 'manager', 'admin'].map(role => {
                                        const rc = ROLE_COLORS[role];
                                        const active = formData.role === role;
                                        return (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setFormData(f => ({ ...f, role }))}
                                                style={{
                                                    padding: '9px 6px', borderRadius: '9px', cursor: 'pointer',
                                                    border: `2px solid ${active ? rc.color : 'var(--border-color)'}`,
                                                    background: active ? `${rc.color}12` : 'var(--bg-primary)',
                                                    color: active ? rc.color : 'var(--text-secondary)',
                                                    fontSize: '12px', fontWeight: 700, textTransform: 'capitalize',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {role}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
                                    {isAddMode ? 'Password' : 'New Password'}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="password"
                                        className="input-alt"
                                        style={{ paddingLeft: '36px', borderRadius: '10px', fontSize: '14px' }}
                                        value={formData.password}
                                        onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                                        placeholder={isAddMode ? 'Minimum 6 characters' : 'Leave blank to keep current'}
                                        required={isAddMode}
                                    />
                                </div>
                                {!isAddMode && (
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                                        Leave blank to keep the current password unchanged.
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={closePanel}>
                                    <FiX size={14} /> Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                                    <FiSave size={14} /> {saving ? 'Saving…' : (isAddMode ? 'Create User' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { opacity:0; transform:translateX(20px); }
                    to   { opacity:1; transform:translateX(0); }
                }
            `}</style>
        </div>
    );
}

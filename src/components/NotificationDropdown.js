"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiBell, FiCheck, FiTrash2, FiInfo, FiTarget, FiZap, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Handle outside click without event collision
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            const token = Cookies.get('token');
            await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            fetchNotifications();
        }
    };

    const markAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            const token = Cookies.get('token');
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            fetchNotifications();
        }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            const token = Cookies.get('token');
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            fetchNotifications();
        }
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'lead': return <FiTarget className="notif-type-icon text-indigo" />;
            case 'deal': return <FiZap className="notif-type-icon text-green" />;
            default: return <FiInfo className="notif-type-icon text-blue" />;
        }
    };

    return (
        <div className="notif-dropdown-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
                type="button"
                className={`icon-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                title="Notifications"
                aria-label="View notifications"
                style={{ position: 'relative' }}
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="notif-dropdown-menu"
                    >
                        <div className="notif-header">
                            <div className="notif-title-row">
                                <h4>Notifications</h4>
                                {unreadCount > 0 && <span className="notif-counter-tag">{unreadCount} new</span>}
                            </div>
                            {unreadCount > 0 && (
                                <button className="mark-all-btn" onClick={markAllAsRead}>
                                    <FiCheck /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="notif-list-body">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        <div className="notif-icon-col">
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                        <div className="notif-content-col">
                                            <div className="notif-item-title">{notif.title}</div>
                                            <div className="notif-item-desc">{notif.message}</div>
                                            <span className="notif-item-time">
                                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <button 
                                            className="notif-delete-btn" 
                                            onClick={(e) => deleteNotification(notif.id, e)}
                                            title="Delete"
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="notif-empty">
                                    <FiCheckCircle size={32} />
                                    <p>You're all caught up!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
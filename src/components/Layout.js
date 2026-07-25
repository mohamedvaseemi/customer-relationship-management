"use client";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    FiHome, FiUsers, FiTrendingUp, FiCalendar, FiLogOut, FiMenu, FiX,
    FiSun, FiMoon, FiSearch, FiBell, FiSettings, FiGrid, FiBarChart2,
    FiArrowRight, FiTarget, FiBriefcase, FiDollarSign, FiPhone, FiSend, FiFileText,
    FiZap, FiHeadphones, FiMessageSquare, FiActivity
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ThemeSelector from './ThemeSelector';
import ChatWidget from './ChatWidget';
import FloatingCustomizer from './FloatingCustomizer';
import Cookies from 'js-cookie';
import '@/styles/Layout.css';
import '@/styles/FloatingCustomizer.css';

const getInitialSidebar = () => {
    if (typeof window !== 'undefined') {
        return window.innerWidth >= 1024;
    }
    return true;
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebar);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, sampleDataEnabled, toggleSampleData } = useAuth();
    const { theme, setCustomizerOpen } = useTheme();

    // Close sidebar on navigation on smaller screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            }
        };
        // Only close on route change for small screens
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [pathname]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Live Search Effect
    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearching(true);
            try {
                const token = Cookies.get('token');
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.results) {
                    setSearchResults(data.results);
                }
            } catch (err) {
                // Silently handle
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.is_read).length);
            }
        } catch (err) {
            // Silently handle
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 20000);
            return () => clearInterval(interval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleMarkAllRead = async (e) => {
        if (e) e.stopPropagation();
        try {
            const token = Cookies.get('token');
            await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'read_all' })
            });
            fetchNotifications();
        } catch (err) {
            // Silently handle
        }
    };

    const handleMarkRead = async (id) => {
        try {
            const token = Cookies.get('token');
            await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });
            fetchNotifications();
        } catch (err) {
            // Silently handle
        }
    };

    const menuGroups = [
        {
            title: 'Intelligence',
            items: [
                { path: '/dashboard', icon: FiGrid, label: 'Overview' },
                { path: '/reports', icon: FiBarChart2, label: 'Analytics' },
            ]
        },
        {
            title: 'Sales & Marketing',
            items: [
                { path: '/leads', icon: FiTarget, label: 'Leads' },
                { path: '/deals', icon: FiDollarSign, label: 'Deals' },
                { path: '/contacts', icon: FiUsers, label: 'Contacts' },
                { path: '/accounts', icon: FiBriefcase, label: 'Accounts' },
            ]
        },
        {
            title: 'Operations',
            items: [
                { path: '/activities', icon: FiCalendar, label: 'Activities' },
                { path: '/automation', icon: FiZap, label: 'Automation' },
                { path: '/calls', icon: FiPhone, label: 'Calls' },
                { path: '/campaigns', icon: FiSend, label: 'Campaigns' },
                { path: '/documents', icon: FiFileText, label: 'Documents' },
            ]
        },
        {
            title: 'Support & Teams',
            items: [
                { path: '/tickets', icon: FiHeadphones, label: 'Service Desk' },
                { path: '/chat', icon: FiMessageSquare, label: 'Team Chat' },
            ]
        }
    ];

    const adminItems = [];
    if (user?.role === 'admin') {
        adminItems.push({ path: '/users', icon: FiUsers, label: 'User Management' });
        adminItems.push({ path: '/monitoring', icon: FiActivity, label: 'App Monitoring' });
    }
    adminItems.push({ path: '/settings', icon: FiSettings, label: 'System Settings' });

    menuGroups.push({
        title: 'Administration',
        items: adminItems
    });

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            setNotificationsOpen(false);
            setUserDropdownOpen(false);
            setThemeOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Refresh layout when sample data toggle changes (storage event)
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'sampleDataEnabled') {
                // Refresh data without full page reload
                if (router.refresh) {
                    router.refresh();
                } else {
                    router.replace(router.asPath);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [router]);

    return (
        <div className={`layout ${theme}`}>
            {/* Command Palette Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay search-overlay"
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            className="command-palette card"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="search-bar-large">
                                <FiSearch />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search anything... (Leads, Contacts, Tasks)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <kbd>ESC</kbd>
                            </div>
                            <div className="search-results">
                                {searchQuery ? (
                                    searchResults.length > 0 ? (
                                        searchResults.map((res, i) => (
                                            <div
                                                key={i}
                                                className="search-result-item"
                                                onClick={() => {
                                                    router.push(res.path);
                                                    setSearchOpen(false);
                                                }}
                                            >
                                                <div className={`res-icon ${res.type}`}>
                                                    {res.type === 'lead' && <FiTarget />}
                                                    {res.type === 'contact' && <FiUsers />}
                                                    {res.type === 'activity' && <FiCalendar />}
                                                    {res.type === 'page' && <FiGrid />}
                                                    {res.type === 'company' && <FiBriefcase />}
                                                    {res.type === 'deal' && <FiDollarSign />}
                                                </div>
                                                <div className="res-info">
                                                    <div className="res-title">{res.title}</div>
                                                    <div className="res-sub">{res.sub}</div>
                                                </div>
                                                <FiArrowRight size={16} className="res-arrow" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-results">
                                            {searching ? 'Searching...' : `No results for "${searchQuery}"`}
                                        </div>
                                    )
                                ) : (
                                    <div className="search-hint">Type to start searching across Kibon...</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Backdrop Overlay for Mobile/Tablet */}
            <AnimatePresence>
                {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="sidebar-overlay"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo" onClick={() => router.push('/dashboard')}>
                        <div className="logo-icon">
                            <img src="/favicon.gif" alt="Kibon" style={{width: 32, height: 32, borderRadius: 6}} />
                        </div>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="logo-text"
                                >
                                    Kibon
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} className="nav-group">
                            {sidebarOpen && <div className="nav-group-title">{group.title}</div>}
                            {group.items.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                                    title={!sidebarOpen ? item.label : ''}
                                >
                                    <item.icon className="nav-icon" />
                                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <FiLogOut className="nav-icon" />
                        {sidebarOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-wrapper">
                <header className="header glass">
                    <div className="header-left">
                        <button className="icon-btn sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>

                        <div
                            className="header-search"
                            onClick={() => setSearchOpen(true)}
                        >
                            <FiSearch className="search-icon" />
                            <span className="search-placeholder">Search anything...</span>
                            <kbd className="search-kbd">⌘K</kbd>
                        </div>
                    </div>

                    <div className="header-right">
                        {/* Sample Data Toggle */}
                        <button
                            onClick={toggleSampleData}
                            className={`sample-data-toggle ${sampleDataEnabled ? 'active' : 'inactive'}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: sampleDataEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                                color: sampleDataEnabled ? '#10b981' : '#94a3b8',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                marginRight: '8px'
                            }}
                            title="Toggle sample dataset for demonstration"
                            aria-label={`Sample data is currently ${sampleDataEnabled ? 'on' : 'off'}. Click to toggle.`}
                            aria-pressed={sampleDataEnabled}
                        >
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: sampleDataEnabled ? '#10b981' : '#94a3b8',
                                boxShadow: sampleDataEnabled ? '0 0 8px #10b981' : 'none',
                                transition: 'all 0.2s ease'
                            }} />
                            <span>Sample Data: <b>{sampleDataEnabled ? 'ON' : 'OFF'}</b></span>
                        </button>

                        <button className="icon-btn" onClick={() => setCustomizerOpen(true)} title="Switch Theme" aria-label="Open appearance and theme customizer">
                            {theme?.includes('dark') || theme === 'midnight' ? <FiMoon size={20} /> : <FiSun size={20} />}
                        </button>

                        <div className="dropdown-container">
                            <button className="icon-btn relative" onClick={(e) => { e.stopPropagation(); setNotificationsOpen(!notificationsOpen); }} aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`} aria-expanded={notificationsOpen}>
                                <FiBell size={20} />
                                {unreadCount > 0 && <span className="notification-dot"></span>}
                            </button>

                            <AnimatePresence>
                                {notificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="dropdown-menu notifications-dropdown card"
                                    >
                                        <div className="dropdown-header">
                                            <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                                            {unreadCount > 0 && (
                                                <button onClick={handleMarkAllRead} className="text-primary text-xs" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="dropdown-content">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                                                        onClick={() => handleMarkRead(n.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className={`notification-icon ${n.type === 'warning' ? 'bg-danger' : 'bg-primary'}`}>
                                                            {n.title ? n.title.charAt(0).toUpperCase() : 'N'}
                                                        </div>
                                                        <div className="notification-info">
                                                            <p><b>{n.title}</b></p>
                                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{n.message}</p>
                                                            <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-muted">No notifications</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="divider" />

                        <div className="dropdown-container">
                            <div className="user-profile-trigger" onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen); }}>
                                <div className="user-avatar gradient-primary">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info-text hide-mobile">
                                    <div className="user-name">{user?.name}</div>
                                    <div className="user-role">{user?.role}</div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {userDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="dropdown-menu user-dropdown card"
                                    >
                                        <div className="dropdown-item" onClick={(e) => {
                                            e.stopPropagation();
                                            setUserDropdownOpen(false);
                                            router.push('/settings');
                                        }}>
                                            <FiSettings className="dropdown-icon" /> Settings
                                        </div>
                                        <div className="dropdown-divider" />
                                        <div className="dropdown-item logout-text" onClick={(e) => {
                                            e.stopPropagation();
                                            setUserDropdownOpen(false);
                                            handleLogout();
                                        }}>
                                            <FiLogOut className="dropdown-icon" /> Sign Out
                                        </div>

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
                <ChatWidget />
                <FloatingCustomizer />
            </div>
        </div>
    );
};

export default Layout;

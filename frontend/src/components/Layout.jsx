import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    FiHome, FiUsers, FiTrendingUp, FiCalendar, FiLogOut, FiMenu, FiX,
    FiSun, FiMoon, FiSearch, FiBell, FiSettings, FiGrid, FiBarChart2,
    FiArrowRight, FiTarget, FiBriefcase, FiDollarSign, FiPhone, FiSend, FiFileText,
    FiZap, FiHeadphones, FiMessageSquare
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from './ThemeSelector';
import ChatWidget from './ChatWidget';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme } = useTheme();

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

    const mockSearchResults = [
        { type: 'lead', title: 'Enterprise License Deal', sub: 'TechFlow Inc.', path: '/leads' },
        { type: 'contact', title: 'Sarah Jenkins', sub: 'sarah@techflow.com', path: '/contacts' },
        { type: 'activity', title: 'Follow-up Call', sub: 'Due in 2 hours', path: '/activities' },
        { type: 'page', title: 'Sales Dashboard', sub: 'Main overview', path: '/dashboard' },
        { type: 'account', title: 'Global Tech Solutions', sub: 'Enterprise Account', path: '/accounts' },
        { type: 'deal', title: 'Cloud Infrastructure Migration', sub: 'Negotiation Stage', path: '/deals' }
    ].filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    if (user?.role === 'admin') {
        menuGroups.push({
            title: 'Administration',
            items: [
                { path: '/users', icon: FiUsers, label: 'User Management' },
                { path: '/settings', icon: FiSettings, label: 'System Settings' },
            ]
        });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                                    mockSearchResults.length > 0 ? (
                                        mockSearchResults.map((res, i) => (
                                            <div
                                                key={i}
                                                className="search-result-item"
                                                onClick={() => {
                                                    navigate(res.path);
                                                    setSearchOpen(false);
                                                }}
                                            >
                                                <div className={`res-icon ${res.type}`}>
                                                    {res.type === 'lead' && <FiTarget />}
                                                    {res.type === 'contact' && <FiUsers />}
                                                    {res.type === 'activity' && <FiCalendar />}
                                                    {res.type === 'page' && <FiGrid />}
                                                </div>
                                                <div className="res-info">
                                                    <div className="res-title">{res.title}</div>
                                                    <div className="res-sub">{res.sub}</div>
                                                </div>
                                                <FiArrowRight size={16} className="res-arrow" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-results">No results for "{searchQuery}"</div>
                                    )
                                ) : (
                                    <div className="search-hint">Type to start searching across IntWhizz CRM...</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo" onClick={() => navigate('/dashboard')}>
                        <div className="logo-icon gradient-primary">
                            <FiGrid size={20} />
                        </div>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="logo-text"
                                >
                                    IntWhizz CRM
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
                                    to={item.path}
                                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                    title={!sidebarOpen ? item.label : ''}
                                >
                                    <item.icon className="nav-icon" />
                                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                    {location.pathname === item.path && <motion.div layoutId="activeNav" className="active-indicator" />}
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
                        <button className="icon-btn sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
                        <div className="dropdown-container">
                            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setThemeOpen(!themeOpen); }} title="Switch Theme">
                                {theme?.includes('dark') || theme === 'midnight' ? <FiMoon size={20} /> : <FiSun size={20} />}
                            </button>

                            <AnimatePresence>
                                {themeOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="dropdown-menu theme-dropdown card"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ThemeSelector onClose={() => setThemeOpen(false)} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="dropdown-container">
                            <button className="icon-btn relative" onClick={(e) => { e.stopPropagation(); setNotificationsOpen(!notificationsOpen); }}>
                                <FiBell size={20} />
                                <span className="notification-dot"></span>
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
                                            <span>Notifications</span>
                                            <button className="text-primary text-xs">Mark all read</button>
                                        </div>
                                        <div className="dropdown-content">
                                            <div className="notification-item unread">
                                                <div className="notification-icon bg-primary">L</div>
                                                <div className="notification-info">
                                                    <p><b>New Lead:</b> John Doe from ABC Corp</p>
                                                    <span>2 minutes ago</span>
                                                </div>
                                            </div>
                                            <div className="notification-item">
                                                <div className="notification-icon bg-success">T</div>
                                                <div className="notification-info">
                                                    <p><b>Task Completed:</b> Follow up with Sarah</p>
                                                    <span>1 hour ago</span>
                                                </div>
                                            </div>
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
                                        <div className="dropdown-item" onClick={() => navigate('/profile')}>
                                            <FiUsers className="dropdown-icon" /> My Profile
                                        </div>
                                        <div className="dropdown-item" onClick={() => navigate('/settings')}>
                                            <FiSettings className="dropdown-icon" /> Settings
                                        </div>
                                        <div className="dropdown-divider" />
                                        <div className="dropdown-item logout-text" onClick={handleLogout}>
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
                            key={location.pathname}
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
            </div>
        </div>
    );
};

export default Layout;

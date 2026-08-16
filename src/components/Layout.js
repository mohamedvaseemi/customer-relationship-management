"use client";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    FiHome, FiUsers, FiTrendingUp, FiCalendar, FiLogOut, FiMenu, FiX,
    FiSun, FiMoon, FiSearch, FiBell, FiSettings, FiGrid, FiBarChart2,
    FiArrowRight, FiTarget, FiBriefcase, FiDollarSign, FiPhone, FiSend, FiFileText,
    FiZap, FiHeadphones, FiMessageSquare, FiActivity, FiCode, FiCreditCard, FiKey, FiAlertTriangle
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ThemeSelector from './ThemeSelector';
import ChatWidget from './ChatWidget';
import FloatingCustomizer from './FloatingCustomizer';
import NotificationDropdown from './NotificationDropdown';
import Cookies from 'js-cookie';
import '@/styles/Layout.css';
import '@/styles/FloatingCustomizer.css';

const getInitialSidebar = () => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebar);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, sampleDataEnabled, toggleSampleData } = useAuth();
    const { theme, setCustomizerOpen } = useTheme();

    useEffect(() => {
        const handleResize = () => { if (window.innerWidth < 1024) setSidebarOpen(false); };
        if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [pathname]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
            if (e.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!searchQuery) return setSearchResults([]);
        const delay = setTimeout(async () => {
            setSearching(true);
            try {
                const token = Cookies.get('token');
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                if (data.results) setSearchResults(data.results);
            } catch (err) {} finally { setSearching(false); }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery]);

    const menuGroups = [
        { title: 'Intelligence', items: [{ path: '/dashboard', icon: FiGrid, label: 'Overview' }, { path: '/reports', icon: FiBarChart2, label: 'Analytics' }] },
        { title: 'Sales & Marketing', items: [{ path: '/leads', icon: FiTarget, label: 'Leads' }, { path: '/deals', icon: FiDollarSign, label: 'Deals' }, { path: '/contacts', icon: FiUsers, label: 'Contacts' }, { path: '/accounts', icon: FiBriefcase, label: 'Accounts' }] },
        { title: 'Operations', items: [{ path: '/activities', icon: FiCalendar, label: 'Activities' }, { path: '/automation', icon: FiZap, label: 'Automation' }, { path: '/calls', icon: FiPhone, label: 'Calls' }, { path: '/campaigns', icon: FiSend, label: 'Campaigns' }, { path: '/documents', icon: FiFileText, label: 'Documents' }] },
        { title: 'Support & Teams', items: [{ path: '/tickets', icon: FiHeadphones, label: 'Service Desk' }, { path: '/chat', icon: FiMessageSquare, label: 'Team Chat' }] }
    ];

    const adminItems = [];
    if (user?.role === 'admin') {
        adminItems.push({ path: '/users', icon: FiUsers, label: 'User Management' });
        adminItems.push({ path: '/monitoring', icon: FiActivity, label: 'App Monitoring' });
    }
    // New Standalone Pages
    adminItems.push({ path: '/api-keys', icon: FiKey, label: 'API Keys' });
    adminItems.push({ path: '/developer', icon: FiCode, label: 'Developer API' });
    adminItems.push({ path: '/billing', icon: FiCreditCard, label: 'Billing & Plans' });
    adminItems.push({ path: '/settings', icon: FiSettings, label: 'System Settings' });

    menuGroups.push({ title: 'Administration', items: adminItems });

    const handleLogout = () => { logout(); router.push('/login'); };

    useEffect(() => {
        const handleClickOutside = () => setUserDropdownOpen(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'sampleDataEnabled') { router.refresh ? router.refresh() : router.replace(router.asPath); }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [router]);

    return (
        <div className={`layout ${theme}`}>
            {/* Search Overlay Code Omitted for Brevity - Same as before */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay search-overlay" onClick={() => setSearchOpen(false)}>
                        <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} className="command-palette card" onClick={e => e.stopPropagation()}>
                            <div className="search-bar-large">
                                <FiSearch />
                                <input autoFocus type="text" placeholder="Search anything..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                <kbd>ESC</kbd>
                            </div>
                            <div className="search-results">
                                {searchQuery ? (
                                    searchResults.length > 0 ? searchResults.map((res, i) => (
                                        <div key={i} className="search-result-item" onClick={() => { router.push(res.path); setSearchOpen(false); }}>
                                            <div className={`res-icon ${res.type}`}><FiArrowRight /></div>
                                            <div className="res-info">
                                                <div className="res-title">{res.title}</div>
                                                <div className="res-sub">{res.sub}</div>
                                            </div>
                                        </div>
                                    )) : <div className="no-results">No results</div>
                                ) : <div className="search-hint">Type to search...</div>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
                )}
            </AnimatePresence>

            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo" onClick={() => router.push('/dashboard')}>
                        <div className="logo-icon"><img src="/favicon.gif" alt="Kibon" style={{width: 32, height: 32, borderRadius: 6}} /></div>
                        <AnimatePresence>{sidebarOpen && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="logo-text">Kibon</motion.span>}</AnimatePresence>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} className="nav-group">
                            {sidebarOpen && <div className="nav-group-title">{group.title}</div>}
                            {group.items.map(item => (
                                <Link key={item.path} href={item.path} className={`nav-item ${pathname === item.path ? 'active' : ''}`} title={!sidebarOpen ? item.label : ''}>
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

            <div className="main-wrapper">
                <header className="header glass">
                    <div className="header-left">
                        <button className="icon-btn sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}><FiMenu size={20} /></button>
                        <div className="header-search" onClick={() => setSearchOpen(true)}>
                            <FiSearch className="search-icon" />
                            <span className="search-placeholder">Search anything...</span>
                            <kbd className="search-kbd">⌘K</kbd>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="icon-btn" onClick={() => setCustomizerOpen(true)} title="Switch Theme">
                            {theme?.includes('dark') || theme === 'midnight' ? <FiMoon size={20} /> : <FiSun size={20} />}
                        </button>
                        <NotificationDropdown />
                        <div className="divider" />
                        <div className="dropdown-container">
                            <div className="user-profile-trigger" onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen); }}>
                                <div className="user-avatar gradient-primary">{user?.name?.charAt(0).toUpperCase()}</div>
                                <div className="user-info-text hide-mobile">
                                    <div className="user-name">{user?.name}</div>
                                    <div className="user-role">{user?.role}</div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {userDropdownOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="dropdown-menu user-dropdown card">
                                        <div className="dropdown-item" onClick={() => { setUserDropdownOpen(false); router.push('/settings'); }}><FiSettings className="dropdown-icon" /> Settings</div>
                                        <div className="dropdown-divider" />
                                        <div className="dropdown-item logout-text" onClick={() => { setUserDropdownOpen(false); handleLogout(); }}><FiLogOut className="dropdown-icon" /> Sign Out</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="main-content" style={{ padding: 0 }}>
                    {/* THE SANDBOX BANNER */}
                    <AnimatePresence>
                        {sampleDataEnabled && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="sandbox-banner"
                            >
                                <div className="banner-content">
                                    <FiAlertTriangle size={18} />
                                    <span><strong>Sandbox Mode Active:</strong> You are currently viewing simulated data. Changes made here will not affect your real workspace.</span>
                                </div>
                                <button className="exit-sandbox-btn" onClick={toggleSampleData}>Exit Sandbox</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div style={{ padding: '2rem' }}>
                        <AnimatePresence mode="wait">
                            <motion.div key={pathname} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
                <ChatWidget />
                <FloatingCustomizer />
            </div>
        </div>
    );
};

export default Layout;
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    FiGrid, FiUsers, FiTarget, FiBriefcase, 
    FiCheckSquare, FiMessageSquare, FiSettings, 
    FiLogOut, FiMoon, FiSun, FiPlay 
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const menuItems = [
    { name: 'Dashboard', icon: FiGrid, path: '/dashboard' },
    { name: 'Contacts', icon: FiUsers, path: '/contacts' },
    { name: 'Leads', icon: FiTarget, path: '/leads' },
    { name: 'Deals', icon: FiBriefcase, path: '/deals' },
    { name: 'Users', icon: FiUsers, path: '/users' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
];

export default function Sidebar({ onShowDemo, showDemoButton }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <FiGrid size={24} />
                    <span>ModernCRM</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                            <motion.div 
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-pill"
                                        className="active-pill"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
                {showDemoButton && (
                    <div style={{ marginTop: '1rem', padding: '0 1rem' }}>
                        <button className="demo-btn" onClick={onShowDemo}>
                            <FiPlay />
                            <span>Demo Walkthrough</span>
                        </button>
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                
                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                </div>

                <button className="logout-btn" onClick={logout}>
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

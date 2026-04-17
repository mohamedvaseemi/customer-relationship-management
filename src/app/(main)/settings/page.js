'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    FiUser, FiLayers, FiZap, FiDatabase, FiShield, FiGlobe,
    FiSearch, FiChevronRight, FiGrid, FiSettings
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Settings.css';

const SETTINGS_GROUPS = [
    {
        id: 'general',
        title: 'General',
        icon: FiGlobe,
        items: [
            { id: 'personal', label: 'Personal Settings', path: '/settings/personal' },
            { id: 'users', label: 'Users & Control', path: '/users' },
            { id: 'company', label: 'Company Details', path: '/settings/company' }
        ]
    },
    {
        id: 'billing',
        title: 'Billing & Intelligence',
        icon: FiZap,
        items: [
            { id: 'plans', label: 'Subscription Plans', path: '/pricing' },
            { id: 'billing', label: 'Billing History', path: '/billing' },
            { id: 'usage', label: 'Strategic Usage', path: '/dashboard' }
        ]
    },
    {
        id: 'customization',
        title: 'Customization',
        icon: FiLayers,
        items: [
            { id: 'modules', label: 'Modules and Fields', path: '/settings/modules' },
            { id: 'appearance', label: 'Appearance & Themes', path: '/settings/appearance' },
            { id: 'home', label: 'Customize Home page', path: '/settings/home' }
        ]
    },
    {
        id: 'automation',
        title: 'Automation',
        icon: FiZap,
        items: [
            { id: 'workflows', label: 'Workflow Rules', path: '/settings/workflows' },
            { id: 'actions', label: 'Actions', path: '/settings/actions' }
        ]
    },
    {
        id: 'data-admin',
        title: 'Data Administration',
        icon: FiDatabase,
        items: [
            { id: 'import', label: 'Import Data', path: '/settings/import' },
            { id: 'export', label: 'Export Data', path: '/settings/export' },
            { id: 'recycle', label: 'Recycle Bin', path: '/settings/recycle-bin' }
        ]
    }
];

const SettingsPage = () => {
    const router = useRouter();

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div>
                    <h1 className="page-title">Setup</h1>
                    <p className="page-subtitle">Configure your workspace and automate your business processes.</p>
                </div>
                <div className="settings-search">
                    <FiSearch />
                    <input type="text" placeholder="Search for settings (e.g. Users, Workflows)" />
                </div>
            </div>

            <div className="settings-grid">
                {SETTINGS_GROUPS.map((group, idx) => (
                    <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="settings-card card shadow-soft"
                    >
                        <div className="group-header">
                            <div className="group-icon gradient-primary">
                                <group.icon size={18} />
                            </div>
                            <h3>{group.title}</h3>
                        </div>
                        <div className="group-items">
                            {group.items.map(item => (
                                <div
                                    key={item.id}
                                    className="settings-item"
                                    onClick={() => router.push(item.path)}
                                >
                                    <span>{item.label}</span>
                                    <FiChevronRight size={14} className="item-arrow" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SettingsPage;

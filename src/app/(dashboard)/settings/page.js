"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import {
    FiUser, FiLayers, FiZap, FiDatabase, FiShield, FiGlobe,
    FiCode, FiSearch, FiChevronRight
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import '@/styles/Settings.css';

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
        id: 'customization',
        title: 'Customization',
        icon: FiLayers,
        items: [
            { id: 'modules', label: 'Modules and Fields', path: '/settings/modules' },
            { id: 'appearance', label: 'Appearance & Themes', path: '/settings/appearance' },
            { id: 'home', label: 'Customize Home page', path: '/settings/home' },
            { id: 'templates', label: 'Templates', path: '/settings/templates' }
        ]
    },
    {
        id: 'automation',
        title: 'Automation',
        icon: FiZap,
        items: [
            { id: 'workflows', label: 'Workflow Rules', path: '/automation' },
            { id: 'actions', label: 'Actions', path: '/settings/actions' }
        ]
    },
    {
        id: 'data-admin',
        title: 'Data Administration',
        icon: FiDatabase,
        items: [
            { id: 'import', label: 'Import', path: '/settings/import' },
            { id: 'export', label: 'Export', path: '/settings/export' },
            { id: 'recycle', label: 'Recycle Bin', path: '/settings/recycle-bin' }
        ]
    },
    {
        id: 'security',
        title: 'Security Control',
        icon: FiShield,
        items: [
            { id: 'profiles', label: 'Profiles', path: '/settings/profiles' },
            { id: 'roles', label: 'Roles and Sharing', path: '/settings/roles' }
        ]
    },
    {
        id: 'developer',
        title: 'Developer Hub',
        icon: FiCode,
        items: [
            { id: 'api', label: 'APIs and SDKs', path: '/settings/api' },
            { id: 'hooks', label: 'Webhooks', path: '/settings/webhooks' }
        ]
    }
];

export default function Settings() {
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

            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {SETTINGS_GROUPS.map((group, idx) => (
                    <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="settings-card card"
                    >
                        <div className="group-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div className="group-icon" style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--primary-color)' }}>
                                <group.icon size={20} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{group.title}</h3>
                        </div>
                        <div className="group-items">
                            {group.items.map(item => (
                                <div
                                    key={item.id}
                                    className="settings-item"
                                    onClick={() => router.push(item.path)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                                >
                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <FiChevronRight size={14} className="item-arrow" style={{ color: 'var(--text-muted)' }} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

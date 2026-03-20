'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiUsers, FiTrendingUp, FiActivity, FiDollarSign, FiArrowUp, FiArrowDown, FiAward, FiAlertCircle, FiPlus, FiRefreshCcw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

export default function DashboardPage() {
    const { user, token, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (user && token) {
            loadDashboard();
        }
    }, [user, token, loadDashboard]);

    const revenueData = useMemo(() => {
        if (!stats?.trends?.revenue || !Array.isArray(stats.trends.revenue)) return [];
        return stats.trends.revenue.map(item => ({
            name: item?.month || 'Unknown',
            revenue: parseFloat(item?.total || 0)
        }));
    }, [stats]);

    const CHART_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    if (authLoading || loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8 text-center" style={{ padding: '4rem' }}>
                <FiAlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', opacity: 0.5 }} />
                <h3>Intelligence System Offline</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Unable to reconcile your business data at this moment.</p>
                <button className="btn btn-primary" onClick={loadDashboard}>
                    <FiRefreshCcw /> Attempt Reconnection
                </button>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Active Leads',
            value: stats?.leadsSummary?.stats?.total_leads || 0,
            icon: FiUsers,
            color: '#6366f1',
            change: '+14.2%',
            trend: 'up'
        },
        {
            title: 'Pipeline Deals',
            value: stats?.leadsSummary?.stats?.total_deals || 0,
            icon: FiAward,
            color: '#8b5cf6',
            change: '+5.7%',
            trend: 'up'
        },
        {
            title: 'Gross Revenue',
            value: `$${(stats?.leadsSummary?.stats?.total_value || 0).toLocaleString()}`,
            icon: FiDollarSign,
            color: '#10b981',
            change: '+21.4%',
            trend: 'up'
        },
        {
            title: 'Conversion',
            value: stats?.leadsSummary?.stats?.total_leads > 0 
                ? `${((stats?.leadsSummary?.stats?.total_deals / stats?.leadsSummary?.stats?.total_leads) * 100).toFixed(1)}%` 
                : '0%',
            icon: FiTrendingUp,
            color: '#3b82f6',
            change: '+2.1%',
            trend: 'up'
        }
    ];

    return (
        <div className="dashboard">
            <header className="dashboard-header-alt fade-in-up">
                <div className="header-welcome-title">
                    <h1>Command Center</h1>
                    <p>Intelligence overview for {user?.name}</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="view-selector">
                        <select className="select-naked">
                            <option>Main Workspace</option>
                            <option>Regional Sales</option>
                            <option>Global Markets</option>
                        </select>
                    </div>
                    <button className="btn btn-primary shadow-glow">
                        <FiPlus /> New Opportunity
                    </button>
                </div>
            </header>

            <section className="dashboard-welcome card-premium fade-in-up">
                <div className="welcome-content">
                    <div className="welcome-text">
                        <h2>Optimize your workflow.</h2>
                        <p>ModernCRM AI has identified critical leads that haven't been contacted in 48 hours. Strategic action could increase this month's gross revenue.</p>
                    </div>
                    <div className="welcome-actions">
                        <button className="btn btn-glass" onClick={() => loadDashboard()}>
                            <FiActivity /> Analyze Analytics
                        </button>
                    </div>
                </div>
            </section>

            <section className="stats-grid">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="stat-card-premium fade-in-up"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8 }}
                    >
                        <div className="stat-icon-container" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                            <stat.icon />
                        </div>
                        <div className="stat-main">
                            <span className="stat-label">{stat.title}</span>
                            <div className="stat-value-group">
                                <h1 className="stat-value">{stat.value}</h1>
                                <span className={`stat-trend ${stat.trend}`}>
                                    {stat.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            <div className="charts-grid">
                <div className="dashboard-widget-glass fade-in-up">
                    <div className="widget-header-premium">
                        <h3>Intelligence: Revenue Forecast</h3>
                        <div className="actions">
                            <select className="select-naked" style={{ fontSize: '0.8rem' }}>
                                <option>Last 6 Months</option>
                                <option>Year to Date</option>
                            </select>
                        </div>
                    </div>
                    <div className="widget-content-premium">
                        <div className="chart-container-large">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="dashboard-widget-glass fade-in-up">
                    <div className="widget-header-premium">
                        <h3>Critical Engagements</h3>
                        <Link href="/activities" className="btn btn-ghost" style={{ padding: '0.5rem', fontWeight: 700 }}>Open Pipeline</Link>
                    </div>
                    <div className="widget-content-premium">
                        <div className="premium-list">
                            {stats?.upcomingMeetings?.length > 0 ? (
                                stats.upcomingMeetings.map((meeting, i) => (
                                    <div key={i} className="list-item-premium">
                                        <div className="list-icon-box">
                                            <FiActivity style={{ color: CHART_COLORS[i % CHART_COLORS.length] }} />
                                        </div>
                                        <div className="list-details">
                                            <div className="list-title">{meeting.subject}</div>
                                            <div className="list-subtitle">Active scheduled for {meeting.due_date ? new Date(meeting.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center" style={{ padding: '3rem 0', opacity: 0.5 }}>
                                    <p>No critical engagements detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

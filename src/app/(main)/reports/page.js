'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FiBarChart2, FiPieChart, FiTrendingUp, FiTarget,
    FiDownload, FiRefreshCcw, FiUsers, FiDollarSign
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import '../dashboard/Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function ReportsPage() {
    const { token, loading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAnalytics = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('/api/reports/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            loadAnalytics();
        }
    }, [authLoading, token, loadAnalytics]);

    const sourceData = useMemo(() => {
        if (!analytics?.sources) return [];
        return analytics.sources.map((s, i) => ({
            name: s.source || 'Organic',
            value: parseInt(s.count) || 0,
            color: COLORS[i % COLORS.length]
        }));
    }, [analytics]);

    const funnelData = useMemo(() => {
        if (!analytics?.funnel) return [];
        const f = analytics.funnel;
        return [
            { name: 'Total Leads', count: parseInt(f.total_leads) || 0, fill: '#6366f1' },
            { name: 'Qualified', count: parseInt(f.qualified) || 0, fill: '#8b5cf6' },
            { name: 'Closed Won', count: parseInt(f.won) || 0, fill: '#10b981' }
        ];
    }, [analytics]);

    const revenueData = useMemo(() => {
        if (!analytics?.revenueTrend) return [];
        return analytics.revenueTrend.map(r => ({
            name: r.month,
            revenue: parseFloat(r.total) || 0
        }));
    }, [analytics]);

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="dashboard">
            <header className="page-header fade-in-up">
                <div>
                    <h1 className="page-title">Analytics Intelligence</h1>
                    <p className="page-subtitle">Strategic overview of your platform's conversion performance and revenue scaling.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => loadAnalytics()}>
                        <FiRefreshCcw /> Sync Intelligence
                    </button>
                    <button className="btn btn-primary">
                        <FiDownload /> Export Insight
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : !analytics ? (
                <div className="text-center" style={{ padding: '5rem' }}>
                    <h3>Insufficient Intelligence Data</h3>
                    <p className="text-muted">Start processing your first leads to generate analytical insights.</p>
                </div>
            ) : (
                <div className="charts-grid-alt" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                    
                    {/* Revenue Forecast */}
                    <motion.div className="dashboard-widget-glass card fade-in-up" style={{ padding: '2rem' }}>
                        <h3>Revenue Trajectory (m/m)</h3>
                        <div style={{ height: '300px', marginTop: '2rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '0.8rem' }} />
                                    <YAxis axisLine={false} tickLine={false} style={{ fontSize: '0.8rem' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Funnel Efficiency */}
                    <motion.div className="dashboard-widget-glass card fade-in-up" style={{ padding: '2rem' }}>
                        <h3>Conversion Funnel Efficiency</h3>
                        <div style={{ height: '300px', marginTop: '2rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} style={{ fontSize: '0.8rem', fontWeight: 600 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                                        {funnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Source Attribution */}
                    <motion.div className="dashboard-widget-glass card fade-in-up" style={{ padding: '2rem' }}>
                        <h3>Strategic Source Attribution</h3>
                        <div style={{ height: '300px', marginTop: '2rem', display: 'flex' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* User Performance */}
                    <motion.div className="dashboard-widget-glass card fade-in-up" style={{ padding: '2rem' }}>
                        <h3>Performance by Strategic Owner</h3>
                        <div className="engagement-list" style={{ marginTop: '1.5rem' }}>
                            {analytics.performance.map((u, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: COLORS[i % COLORS.length], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{u.name.charAt(0)}</div>
                                        <div>
                                            <div className="font-bold">{u.name}</div>
                                            <div className="text-xs opacity-50">{u.closed_deals} deals closed</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="font-bold" style={{ color: 'var(--success)' }}>${parseFloat(u.revenue).toLocaleString()}</div>
                                        <div className="text-xs opacity-50">Revenue Contribution</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            )}
        </div>
    );
}

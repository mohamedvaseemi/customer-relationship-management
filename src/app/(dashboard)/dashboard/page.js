"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI, leadsAPI } from '@/api/api';
import { FiUsers, FiTrendingUp, FiActivity, FiDollarSign, FiArrowUp, FiArrowDown, FiAward, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import '@/styles/Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [dashboardResponse, leadsResponse] = await Promise.all([
                dashboardAPI.getStats(),
                leadsAPI.getStats()
            ]);

            const dashboardData = dashboardResponse.data || {};
            const leadsData = leadsResponse.data || { stats: {} };

            setStats({
                ...dashboardData,
                leadsSummary: leadsData
            });
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const leadTrendData = useMemo(() => {
        if (!stats?.trends?.leads || !Array.isArray(stats.trends.leads)) return [];
        return stats.trends.leads.map(item => ({
            name: item?.month || 'Unknown',
            leads: parseInt(item?.count || 0)
        }));
    }, [stats]);

    const revenueData = useMemo(() => {
        if (!stats?.trends?.revenue || !Array.isArray(stats.trends.revenue)) return [];
        return stats.trends.revenue.map(item => ({
            name: item?.month || 'Unknown',
            revenue: parseFloat(item?.total || 0)
        }));
    }, [stats]);

    const leadsByStatusData = useMemo(() => {
        if (!stats?.leadsByStatus || !Array.isArray(stats.leadsByStatus)) return [];
        return stats.leadsByStatus.map(item => {
            const statusLabel = item?.status || 'Other';
            return {
                name: statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1),
                value: parseInt(item?.count || 0)
            };
        });
    }, [stats]);

    const CHART_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8 text-center" style={{ color: 'var(--text-primary)' }}>
                <h3>System Offline</h3>
                <p>Unable to connect to business analytics. Please check your connection.</p>
                <button className="btn btn-primary mt-4" onClick={loadDashboard}>Retry</button>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Active Leads',
            value: stats?.leadsSummary?.stats?.total_leads || 0,
            icon: FiTrendingUp,
            color: '#6366f1',
            change: '+12%',
            trend: 'up'
        },
        {
            title: 'Deals in Pipeline',
            value: stats?.leadsSummary?.stats?.total_deals || 0,
            icon: FiAward,
            color: '#8b5cf6',
            change: '+8%',
            trend: 'up'
        },
        {
            title: 'Pipeline Value',
            value: `$${(stats?.leadsSummary?.stats?.total_value || 0).toLocaleString()}`,
            icon: FiDollarSign,
            color: '#10b981',
            change: '+23%',
            trend: 'up'
        },
        {
            title: 'Support Tickets',
            value: stats?.stats?.tickets?.open_tickets || 0,
            icon: FiAlertCircle,
            color: '#f59e0b',
            change: '-5%',
            trend: 'down'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="dashboard"
        >
            <div className="dashboard-header-alt">
                <div className="view-selector">
                    <select className="select-naked">
                        <option>My Dashboard</option>
                        <option>Sales Overview</option>
                        <option>Managerial Insights</option>
                    </select>
                </div>
            </div>

            <div className="dashboard-welcome card gradient-primary">
                <div className="welcome-content">
                    <div className="welcome-text">
                        <h2>Welcome back, {user?.name}!</h2>
                        <p>Here's what's happening with your sales today.</p>
                    </div>
                </div>
                <div className="welcome-actions">
                    <button className="btn btn-white" onClick={() => loadDashboard()}>
                        <FiActivity /> Refresh Data
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* My Open Tasks */}
                <div className="dashboard-widget card">
                    <div className="widget-header">
                        <h3>My Open Tasks</h3>
                        <Link href="/activities?type=task" className="text-xs">View All</Link>
                    </div>
                    <div className="widget-content">
                        {stats?.openTasks?.length > 0 ? (
                            <table className="mini-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Due Date</th>
                                        <th>Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.openTasks.map(task => (
                                        <tr key={task.id}>
                                            <td className="font-medium text-sm">{task.subject}</td>
                                            <td className="text-xs">{new Date(task.due_date).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`priority-badge ${task.priority}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-widget">All caught up! No open tasks.</div>
                        )}
                    </div>
                </div>

                {/* My Meetings */}
                <div className="dashboard-widget card">
                    <div className="widget-header">
                        <h3>My Meetings</h3>
                        <Link href="/activities?type=meeting" className="text-xs">View All</Link>
                    </div>
                    <div className="widget-content">
                        {stats?.upcomingMeetings?.length > 0 ? (
                            <div className="meetings-list">
                                {stats.upcomingMeetings.map(meeting => (
                                    <div key={meeting.id} className="meeting-item-alt">
                                        <div className="meeting-date-box">
                                            <span className="month">{new Date(meeting.due_date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="day">{new Date(meeting.due_date).getDate()}</span>
                                        </div>
                                        <div className="meeting-info">
                                            <div className="meeting-title">{meeting.subject}</div>
                                            <div className="meeting-time">
                                                {new Date(meeting.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-widget">No upcoming meetings.</div>
                        )}
                    </div>
                </div>

                {/* Key Insights Stats Mini Grid */}
                <div className="dashboard-widget card stats-widget">
                    <div className="widget-header">
                        <h3>Key Metrics</h3>
                    </div>
                    <div className="stats-mini-grid">
                        {statCards.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="stat-mini-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    <stat.icon size={18} />
                                </div>
                                <div className="stat-info-box">
                                    <div className="stat-mini-label">{stat.title}</div>
                                    <div className="stat-mini-value">{stat.value}</div>
                                    <div className={`stat-mini-trend ${stat.trend}`}>
                                        {stat.trend === 'up' ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
                                        {stat.change}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="dashboard-widget card">
                    <div className="widget-header">
                        <h3>Recent Activities</h3>
                        <Link href="/activities" className="text-xs">View All</Link>
                    </div>
                    <div className="activities-list-minimal">
                        {stats?.recentActivities?.slice(0, 5).map(activity => (
                            <div key={activity.id} className="activity-row">
                                <span className={`activity-dot ${activity.type || 'task'}`}></span>
                                <div className="activity-text">
                                    <span className="activity-sub">{activity.subject}</span>
                                    <span className="activity-time">{new Date(activity.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-card card">
                    <div className="card-header">
                        <h3 className="card-title">Monthly Leads Trend</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={leadTrendData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card card">
                    <div className="card-header">
                        <h3 className="card-title">Revenue Pipeline</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card card">
                    <div className="card-header">
                        <h3 className="card-title">Leads by Status</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={leadsByStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {leadsByStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

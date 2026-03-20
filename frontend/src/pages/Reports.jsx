
import { motion } from 'framer-motion';
import {
    FiBarChart2, FiPieChart, FiTrendingUp, FiActivity,
    FiDownload, FiCalendar, FiUsers, FiDollarSign
} from 'react-icons/fi';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Reports.css';

/* ── Mock data (replace with real API calls) ── */
const revenueData = [
    { month: 'Aug', revenue: 32000, target: 40000 },
    { month: 'Sep', revenue: 47000, target: 42000 },
    { month: 'Oct', revenue: 38000, target: 44000 },
    { month: 'Nov', revenue: 56000, target: 45000 },
    { month: 'Dec', revenue: 49000, target: 46000 },
    { month: 'Jan', revenue: 62000, target: 48000 },
];

const pipelineData = [
    { name: 'New', value: 35, color: '#6366f1' },
    { name: 'Contacted', value: 25, color: '#8b5cf6' },
    { name: 'Qualified', value: 18, color: '#10b981' },
    { name: 'Proposal', value: 14, color: '#f59e0b' },
    { name: 'Closed Won', value: 8, color: '#3b82f6' },
];

const conversionData = [
    { week: 'W1', rate: 14 },
    { week: 'W2', rate: 21 },
    { week: 'W3', rate: 18 },
    { week: 'W4', rate: 29 },
    { week: 'W5', rate: 24 },
    { week: 'W6', rate: 33 },
];

const kpiCards = [
    { label: 'Sales Velocity', value: '2.4 days', icon: FiTrendingUp, color: 'primary', sub: 'Avg. time to close' },
    { label: 'Lead Quality', value: '84%', icon: FiActivity, color: 'success', sub: 'Qualified rate' },
    { label: 'Team Contacts', value: '1,240', icon: FiUsers, color: 'purple', sub: 'This quarter' },
    { label: 'Projected Rev.', value: '$62K', icon: FiDollarSign, color: 'warning', sub: 'Next 30 days' },
];

const tooltipStyle = {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
};

const Reports = () => {
    return (
        <div className="reports-page">

            {/* ── Header ── */}
            <div className="reports-header">
                <div>
                    <h1 className="page-title">Intelligence & Reports</h1>
                    <p className="page-subtitle">Advanced analytics and data aggregation from your pipeline.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <FiCalendar /> Last 6 Months
                    </button>
                    <button className="btn btn-primary">
                        <FiDownload /> Export Report
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="kpi-grid">
                {kpiCards.map((kpi, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="kpi-card card"
                    >
                        <div className="kpi-card-top">
                            <div className={`kpi-icon gradient-${kpi.color}`}>
                                <kpi.icon size={20} />
                            </div>
                        </div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className="kpi-label">{kpi.label}</div>
                        <div className="kpi-sub">{kpi.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* ── Main Charts Row ── */}
            <div className="charts-row">
                {/* Revenue Area Chart */}
                <div className="chart-panel card">
                    <div className="chart-panel-header">
                        <h3 className="card-title">Revenue vs. Target</h3>
                        <span className="chart-legend-hint">
                            <span className="dot dot-primary" /> Revenue &nbsp;
                            <span className="dot dot-muted" /> Target
                        </span>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${v.toLocaleString()}`, '']} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
                                <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} fill="url(#tgtGrad)" strokeDasharray="5 4" name="Target" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pipeline Pie Chart */}
                <div className="chart-panel card">
                    <div className="chart-panel-header">
                        <h3 className="card-title">Lead Pipeline</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pipelineData} cx="50%" cy="45%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                                    {pipelineData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, '']} />
                                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={val => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{val}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="charts-row-bottom">
                {/* Weekly Conversion Bar Chart */}
                <div className="chart-panel card">
                    <div className="chart-panel-header">
                        <h3 className="card-title">Weekly Conversion Rate (%)</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={conversionData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} unit="%" />
                                <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Conversion']} />
                                <Bar dataKey="rate" fill="#10b981" radius={[5, 5, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Placeholder CTA */}
                <div className="chart-panel card report-cta">
                    <div className="report-cta-inner">
                        <div className="report-cta-icon">
                            <FiBarChart2 size={36} />
                        </div>
                        <h3>Full Report Pack</h3>
                        <p>Generate a detailed PDF/CSV report covering revenue, lead funnel, support SLAs, and team performance.</p>
                        <button className="btn btn-primary mt-4">
                            <FiDownload /> Download CSV Summary
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Reports;

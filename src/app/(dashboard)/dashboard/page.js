"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI, leadsAPI } from '@/api/api';
import { 
    FiUsers, FiTrendingUp, FiActivity, FiDollarSign, FiArrowUp, 
    FiArrowDown, FiAward, FiAlertCircle, FiCpu, FiMail, 
    FiCopy, FiCheck, FiX, FiDatabase, FiClock, FiZap 
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import '@/styles/Dashboard.css';

const SAMPLE_LEADS = [
    {
        id: 'lead-1',
        name: 'Sarah Jenkins',
        company: 'TechFlow Inc.',
        value: 45000,
        score: 94,
        status: 'Hot Lead',
        reasons: [
            'High contact velocity (3 touchpoints in last 48 hours)',
            'Decision-maker actively engaged in product trial',
            'Urgent pipeline deadline identified for Q3 launch'
        ],
        emails: {
            professional: `Subject: Partnership Proposal: Enhancing TechFlow Inc.'s Sales Efficiency

Dear Sarah,

I hope this email finds you well.

Following up on your recent engagement with our product trial, I wanted to formally reach out and discuss how we can partner with TechFlow Inc. to streamline your sales workflows. Based on your active exploration of the platform, we see a tremendous opportunity to accelerate your Q3 launch.

Given the $45,000 estimated pipeline value we discussed, our custom enterprise deployment would offer a highly optimized path forward.

Could we schedule a brief 10-minute call this week to review our enterprise pricing and trial feedback?

Sincerely,
[Agent Name]`,
            friendly: `Subject: Quick question about TechFlow Inc.'s sales goals! 😊

Hi Sarah,

Hope you're having a wonderful week!

I've been tracking TechFlow Inc.'s recent trial activity and I am absolutely thrilled by how your team is adopting the platform. Things are moving fast, and I'd love to help you get the absolute most out of it for your upcoming Q3 launch.

With a potential pipeline of $45,000, we can tailor a custom workspace specifically for your team to maximize efficiency.

Do you have a few minutes for a quick, casual chat this week? I'd love to share some tips!

Best,
[Agent Name]`,
            urgent: `Subject: Action Required: Securing Priority Launch Window for TechFlow Inc.

Dear Sarah,

I am writing because our Q3 priority onboarding cohort is closing this Friday, and we want to ensure TechFlow Inc. secures its spot. 

Given your active trial usage and the high contact velocity over the past 48 hours, we have pre-approved your workspace for immediate deployment. With an estimated deal size of $45,000, timing is critical to hit your target launch window.

We have held a timeslot for you tomorrow at 2:00 PM. Please let me know if that works or if another time is better so we can lock this in.

Best regards,
[Agent Name]`,
            assertive: `Subject: Accelerating TechFlow Inc.'s CRM Infrastructure

Hello Sarah,

It's clear that TechFlow Inc. is poised for significant growth, but executing this successfully requires the right CRM foundation. 

Based on your team's active trial engagement and the upcoming deadline, our platform is the ideal partner to drive that execution. With a pipeline value of $45,000, the ROI on integrating our full suite immediately is clear.

I propose a call tomorrow to review the enterprise configuration and get your onboarding started. Let's make this happen.

Regards,
[Agent Name]`
        }
    },
    {
        id: 'lead-2',
        name: 'David Chen',
        company: 'Apex Corporation',
        value: 120000,
        score: 88,
        status: 'Strong Match',
        reasons: [
            'IT Budget approved and allocated for custom CRM migration',
            'Negotiating legal and SLA terms with procurement team',
            'High historical deal matches (similar size & sector)'
        ],
        emails: {
            professional: `Subject: Strategic Partnership: CRM Migration for Apex Corporation

Dear David,

I hope you are well.

As we progress through the legal and SLA term negotiations, I wanted to check if there are any outstanding technical queries from the procurement or IT teams. We are excited about the prospect of migrating Apex Corporation to our enterprise platform.

With an approved IT budget and a $120,000 deal value, we are fully committed to dedicating senior engineering resources to ensure a seamless migration.

Let me know if we need a sync session with your legal team this week to finalize the contract.

Sincerely,
[Agent Name]`,
            friendly: `Subject: Exciting steps ahead for Apex Corporation! 🚀

Hi David,

Hope your week is off to a great start!

I'm incredibly excited about our upcoming CRM migration for Apex Corporation. Our team is already drawing up the blueprint to ensure a seamless transition for your sales organization.

We know how important these SLA and legal terms are, and we're on standby to make this as smooth as possible for you and your procurement team.

Let's catch up quickly this week if there's anything else you need from our end!

Best,
[Agent Name]`,
            urgent: `Subject: Final Review: Procurement Approval for Apex Corporation CRM

Dear David,

We are close to finalizing our resource allocation plan for next month's enterprise CRM migrations. To ensure Apex Corporation's dedicated migration window is secured, we need to finalize the SLA and contract review.

Given the $120,000 budget allocation, securing this timeline will prevent any disruption to your sales operations.

Could you let me know if procurement will be able to return the signed SLA by Thursday close of business?

Best regards,
[Agent Name]`,
            assertive: `Subject: Finalizing CRM Contract & Migration Strategy for Apex Corporation

Hello David,

We have aligned all necessary technical and migration resources for Apex Corporation's $120,000 CRM deployment. The next step is completing the procurement and legal review.

Our legal counsel has returned the revised SLA terms. Let's schedule a call tomorrow morning to address any remaining details and finalize the agreement so we can initiate the migration process.

Regards,
[Agent Name]`
        }
    },
    {
        id: 'lead-3',
        name: 'Elena Rostova',
        company: 'Nova Solutions',
        value: 15000,
        score: 45,
        status: 'Early Discovery',
        reasons: [
            'Early stage discovery calls completed, client defining scope',
            'Currently out-of-office; auto-responder active until next week',
            'Active competitor evaluation underway for sales stack'
        ],
        emails: {
            professional: `Subject: Scope Definition & Competitor Evaluation - Nova Solutions

Dear Elena,

I hope you are having a productive week.

I received your out-of-office message and look forward to reconnecting once you return. In the meantime, I have prepared a comprehensive comparison guide highlighting how our CRM outperforms competitors in user adoption and custom integrations.

When you are back, I would love to schedule a session to help you define the scope of Nova Solutions' CRM requirements.

Sincerely,
[Agent Name]`,
            friendly: `Subject: Safe travels & a quick CRM comparison for Nova Solutions! ✈️

Hi Elena,

Hope you're having a restful time away!

I saw your out-of-office reply and wanted to drop a quick note for when you get back. Since I know you're currently evaluating different options for your sales stack, I put together a friendly comparison sheet that shows why teams love us.

Whenever you're ready next week, let's catch up and build out a custom scope for Nova Solutions!

Warmly,
[Agent Name]`,
            urgent: `Subject: Action Required: Rescheduling Nova Solutions Discovery Session

Dear Elena,

Welcome back. I wanted to bump our discovery sync to the top of your inbox as you return to the office. 

With competitor evaluations actively moving forward, we want to make sure Nova Solutions has all the facts regarding our platform's capabilities before you finalize your roadmap. We can customize a package that perfectly fits your scoped requirements.

Let's schedule a 10-minute chat this Tuesday to align.

Best regards,
[Agent Name]`,
            assertive: `Subject: Defining CRM Requirements for Nova Solutions

Hello Elena,

I hope your time away was restful. Now that you are back, it is important we finalize the scope of your CRM evaluation. 

While you are assessing competitors, our platform's superior integration capabilities make it the strongest long-term fit for Nova Solutions' goals. Let's schedule a meeting this week to review your exact criteria and demonstrate our solution's advantages.

Regards,
[Agent Name]`
        }
    }
];

export default function Dashboard() {
    const { user, sampleDataEnabled } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [leadList, setLeadList] = useState([]);

    // AI Sales Copilot State
    const [selectedLeadId, setSelectedLeadId] = useState('lead-1');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [selectedTone, setSelectedTone] = useState('professional');
    const [copied, setCopied] = useState(false);

    const activeLead = useMemo(() => {
        const sourceLeads = sampleDataEnabled ? SAMPLE_LEADS : leadList;
        return sourceLeads.find(l => l.id === selectedLeadId) || sourceLeads[0];
    }, [selectedLeadId, sampleDataEnabled, leadList]);

    const generatedEmail = useMemo(() => {
        if (!activeLead) return '';
        const rawEmail = activeLead.emails?.[selectedTone] || '';
        return rawEmail.replaceAll('[Agent Name]', user?.name || 'CRM Advisor');
    }, [activeLead, selectedTone, user]);

    useEffect(() => {
        loadDashboard();
        if (!sampleDataEnabled) {
            // Fetch real leads when sample data is disabled
            const fetchLeads = async () => {
                try {
                    const response = await leadsAPI.getAll();
                    // Assuming response data has a 'leads' array
                    setLeadList(response.data.leads || []);
                } catch (err) {
                    console.error('Failed to load leads:', err);
                }
            };
            fetchLeads();
        }
    }, [sampleDataEnabled]);

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

            {/* AI Sales Copilot & Insights Hub */}
            {sampleDataEnabled && (
                <div className="copilot-section">
                    {/* Left Column: AI Sales Copilot */}
                    <div className="dashboard-widget card copilot-card">
                        <div className="copilot-header">
                            <div className="copilot-title-area">
                                <span className="copilot-badge">AI Sales Copilot</span>
                                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Interactive Lead Scoring</h3>
                            </div>
                            <div className="copilot-info-bar">
                                <FiCpu size={14} />
                                <span>Neural Predictor Online</span>
                            </div>
                        </div>

                        <div className="copilot-grid">
                            <div className="lead-selector-panel">
                                <label htmlFor="lead-select">Select Target Lead</label>
                                <select 
                                    id="lead-select" 
                                    className="custom-lead-select"
                                    value={selectedLeadId}
                                    onChange={(e) => setSelectedLeadId(e.target.value)}
                                >
                                    {(sampleDataEnabled ? SAMPLE_LEADS : leadList).map(lead => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.name} ({lead.company})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {activeLead && (
                                <div className="lead-analysis-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4>{activeLead.name || ''}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>{activeLead.company || ''}</span>
                                    </div>
                                    <div className="probability-indicator">
                                        <div className="prob-circle-outer">
                                            <svg width="60" height="60" viewBox="0 0 60 60">
                                                <circle cx="30" cy="30" r="26" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                                <circle
                                                    cx="30"
                                                    cy="30"
                                                    r="26"
                                                    fill="transparent"
                                                    stroke={activeLead.score >= 80 ? '#10b981' : '#f59e0b'}
                                                    strokeWidth="4"
                                                    strokeDasharray={2 * Math.PI * 26}
                                                    strokeDashoffset={2 * Math.PI * 26 * (1 - (activeLead.score || 0) / 100)}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 30 30)"
                                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                                />
                                            </svg>
                                            <span className="prob-value-text" style={{ color: activeLead.score >= 80 ? '#10b981' : '#f59e0b' }}>
                                                {activeLead.score}%
                                            </span>
                                        </div>
                                        <div className="prob-explanation">
                                            <span className="prob-label">Conversion Probability</span>
                                            <span className="prob-status" style={{ color: activeLead.score >= 80 ? '#10b981' : '#f59e0b' }}>
                                                {activeLead.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                                        Estimated Value: <strong>${activeLead.value?.toLocaleString() || 0}</strong>
                                    </div>
                                </div>
                            )}


                            <div className="ai-action-panel">
                                <div className="copilot-reasoning">
                                    <div className="copilot-reasoning-title">Predictive Conversion Signals</div>
                                    <ul className="copilot-reasoning-list">
                                        {activeLead?.reasons?.map((reason, idx) => (
                                            <li key={idx}>{reason}</li>
                                        ))}
                                    </ul>
                                </div>

                                <button 
                                    className="ai-copilot-btn"
                                    onClick={() => {
                                        setIsEmailModalOpen(true);
                                        setCopied(false);
                                    }}
                                >
                                    <FiMail size={18} />
                                    Generate Outreach Pitch
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: CRM Health Score */}
                    <div className="dashboard-widget card health-score-widget">
                        <h3 style={{ margin: 0, marginBottom: '1.25rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                            CRM Health Index
                        </h3>
                        <div className="health-ring-container">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="60" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle 
                                    cx="70" 
                                    cy="70" 
                                    r="60" 
                                    fill="transparent" 
                                    stroke="#10b981" 
                                    strokeWidth="8" 
                                    strokeDasharray={2 * Math.PI * 60}
                                    strokeDashoffset={2 * Math.PI * 60 * (1 - 0.92)}
                                    strokeLinecap="round"
                                    transform="rotate(-90 70 70)"
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                />
                            </svg>
                            <div className="health-ring-value">
                                <span className="health-num">92%</span>
                                <span className="health-label">Optimal</span>
                            </div>
                        </div>

                        <div className="health-metrics-summary">
                            <div className="health-metric-row">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FiDatabase size={13} style={{ color: '#10b981' }} />
                                    Database Connectivity
                                </span>
                                <span style={{ color: '#10b981' }}>Connected</span>
                            </div>
                            <div className="health-metric-row">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FiClock size={13} style={{ color: '#f59e0b' }} />
                                    Stale Leads (No Activity)
                                </span>
                                <span style={{ color: '#f59e0b' }}>0 Leads</span>
                            </div>
                            <div className="health-metric-row">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FiZap size={13} style={{ color: '#818cf8' }} />
                                    Lead Deal Velocity
                                </span>
                                <span style={{ color: '#818cf8' }}>High (14 Days)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            {/* AI Outreach Pitch Generator Modal */}
            {isEmailModalOpen && (
                <div className="ai-modal-overlay" onClick={() => setIsEmailModalOpen(false)}>
                    <div className="ai-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h3>
                                <FiCpu style={{ color: '#818cf8' }} />
                                AI Outreach Pitch Generator
                            </h3>
                            <button className="ai-modal-close" onClick={() => setIsEmailModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        
                        <div className="ai-modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Adjust Assistant Tone
                                </label>
                                <div className="tone-selector">
                                    {['professional', 'friendly', 'urgent', 'assertive'].map((tone) => (
                                        <button 
                                            key={tone}
                                            className={`tone-btn ${selectedTone === tone ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedTone(tone);
                                                setCopied(false);
                                            }}
                                        >
                                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Generated Email Pitch for {activeLead.name}
                                </label>
                                <div className="email-preview-box">
                                    {generatedEmail}
                                </div>
                            </div>
                        </div>

                        <div className="ai-modal-footer">
                            <button 
                                className="btn btn-outline" 
                                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}
                                onClick={() => setIsEmailModalOpen(false)}
                            >
                                Close
                            </button>
                            <button 
                                className="btn btn-primary" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px', justifyContent: 'center' }}
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedEmail);
                                    setCopied(true);
                                }}
                            >
                                {copied ? <FiCheck style={{ color: '#10b981' }} /> : <FiCopy />}
                                {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

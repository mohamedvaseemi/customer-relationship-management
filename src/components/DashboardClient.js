"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI, leadsAPI, dealsAPI } from '@/api/api';
import { 
    FiTrendingUp, FiActivity, FiDollarSign, 
    FiAward, FiAlertCircle, FiCpu, FiMail, 
    FiCopy, FiCheck, FiX, FiDatabase, FiClock, FiZap, 
    FiArrowUp, FiArrowDown, FiRefreshCw, FiChevronRight, FiCheckCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import '@/styles/Dashboard.css';

// Recharts components dynamically imported for peak performance
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });

const SAMPLE_LEADS = [
    { id: 'lead-1', name: 'Sarah Jenkins', company: 'TechFlow Inc.', value: 45000, score: 94, status: 'Hot Lead', reasons: ['High contact velocity', 'Decision maker in trial'] },
    { id: 'lead-2', name: 'David Chen', company: 'Apex Corporation', value: 120000, score: 88, status: 'Strong Match', reasons: ['Approved IT Budget', 'SLA terms negotiating'] },
    { id: 'lead-3', name: 'Elena Rostova', company: 'Nova Solutions', value: 15000, score: 45, status: 'Early Discovery', reasons: ['Discovery calls done', 'Competitor evaluation'] }
];

const SAMPLE_DEALS = [
    { id: 'deal-1', name: 'Cloud CRM Migration', company: 'Apex Corp', amount: 120000, stage: 'negotiation', probability: 85 },
    { id: 'deal-2', name: 'Enterprise Deployment', company: 'TechFlow Inc', amount: 45000, stage: 'proposal', probability: 70 },
    { id: 'deal-3', name: 'SaaS License Renewal', company: 'Global Logistics', amount: 30000, stage: 'qualification', probability: 50 },
    { id: 'deal-4', name: 'Custom AI Integration', company: 'Nova Solutions', amount: 15000, stage: 'prospecting', probability: 30 }
];

const DEAL_STAGES = [
    { key: 'prospecting', label: 'Prospecting', color: '#6366f1' },
    { key: 'qualification', label: 'Qualification', color: '#8b5cf6' },
    { key: 'proposal', label: 'Proposal', color: '#ec4899' },
    { key: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
    { key: 'won', label: 'Closed Won', color: '#10b981' }
];

export default function DashboardClient() {
    const { user, sampleDataEnabled } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [leadList, setLeadList] = useState([]);
    const [dealList, setDealList] = useState([]);
    
    // AI Sales Copilot State
    const [selectedLeadId, setSelectedLeadId] = useState('lead-1');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [selectedTone, setSelectedTone] = useState('professional');
    const [copied, setCopied] = useState(false);
    const [aiPitch, setAiPitch] = useState('');
    const [generatingPitch, setGeneratingPitch] = useState(false);

    const sourceLeads = useMemo(() => sampleDataEnabled ? SAMPLE_LEADS : leadList, [sampleDataEnabled, leadList]);
    const sourceDeals = useMemo(() => sampleDataEnabled ? SAMPLE_DEALS : dealList, [sampleDataEnabled, dealList]);

    const activeLead = useMemo(() => {
        if (!sourceLeads || sourceLeads.length === 0) return null;
        return sourceLeads.find(l => String(l.id) === String(selectedLeadId)) || sourceLeads[0];
    }, [selectedLeadId, sourceLeads]);

    const activeLeadMeta = useMemo(() => {
        if (!activeLead) return null;
        return {
            id: activeLead.id,
            name: activeLead.name || `${activeLead.first_name || ''} ${activeLead.last_name || ''}`.trim() || activeLead.title,
            company: activeLead.company || 'Target Organization',
            value: activeLead.value || 0,
            score: activeLead.score || activeLead.probability || 50,
            status: activeLead.status || 'new',
            reasons: activeLead.reasons || [
                `Pipeline Value: $${(activeLead.value || 0).toLocaleString()}`,
                `Status: ${(activeLead.status || 'new').toUpperCase()}`,
                `AI Conversion Rating: ${activeLead.probability || 50}%`
            ]
        };
    }, [activeLead]);

    // Calculate Deals Breakdown by Stage
    const dealStageBreakdown = useMemo(() => {
        const total = sourceDeals.length || 1;
        return DEAL_STAGES.map(stage => {
            const count = sourceDeals.filter(d => d.stage === stage.key).length;
            const totalValue = sourceDeals.filter(d => d.stage === stage.key).reduce((sum, d) => sum + Number(d.amount || 0), 0);
            return {
                ...stage,
                count,
                totalValue,
                percentage: Math.round((count / total) * 100)
            };
        });
    }, [sourceDeals]);

    const fetchAiPitch = useCallback(async (leadId, tone) => {
        setGeneratingPitch(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ lead_id: leadId, tone, action_type: 'generate_pitch' })
            });
            const data = await res.json();
            setAiPitch(data.pitch || 'Failed to generate AI pitch. Please try again.');
        } catch (err) {
            setAiPitch('Error generating AI pitch from intelligence engine.');
        } finally {
            setGeneratingPitch(false);
        }
    }, []);

    useEffect(() => {
        if (isEmailModalOpen && activeLeadMeta) {
            fetchAiPitch(activeLeadMeta.id, selectedTone);
        }
    }, [isEmailModalOpen, activeLeadMeta, selectedTone, fetchAiPitch]);

    const loadDashboard = useCallback(async () => {
        try {
            const [dashboardResponse, leadsResponse] = await Promise.all([
                dashboardAPI.getStats(),
                leadsAPI.getStats()
            ]);
            setStats({
                ...(dashboardResponse.data || {}),
                leadsSummary: leadsResponse.data || { stats: {} }
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
        if (!sampleDataEnabled) {
            leadsAPI.getAll().then(res => setLeadList(res.data.leads || [])).catch(() => {});
            dealsAPI.getAll().then(res => setDealList(res.data.deals || [])).catch(() => {});
        }
    }, [sampleDataEnabled, loadDashboard]);

    const leadTrendData = useMemo(() => {
        if (sampleDataEnabled) {
            return [
                { name: 'Jan', leads: 30 }, { name: 'Feb', leads: 45 },
                { name: 'Mar', leads: 60 }, { name: 'Apr', leads: 80 },
                { name: 'May', leads: 110 }, { name: 'Jun', leads: 145 }
            ];
        }
        return (stats?.trends?.leads || []).map(item => ({
            name: item?.month || 'Mon',
            leads: parseInt(item?.count || 0)
        }));
    }, [stats, sampleDataEnabled]);

    const leadsByStatusData = useMemo(() => {
        if (sampleDataEnabled) {
            return [
                { name: 'New', value: 40 }, { name: 'Contacted', value: 30 },
                { name: 'Qualified', value: 20 }, { name: 'Won', value: 10 }
            ];
        }
        return (stats?.leadsByStatus || []).map(item => ({
            name: (item?.status || 'Other').toUpperCase(),
            value: parseInt(item?.count || 0)
        }));
    }, [stats, sampleDataEnabled]);

    const CHART_COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    if (loading) {
        return (
            <div className="dashboard-bento-layout">
                <div className="skeleton-loader" style={{ height: '80px' }} />
                <div className="skeleton-loader" style={{ height: '300px' }} />
            </div>
        );
    }

    const statCards = [
        { title: 'Active Leads', value: sampleDataEnabled ? '145' : (stats?.leadsSummary?.stats?.total_leads || 0), icon: FiTrendingUp, color: '#4f46e5', badge: '+14% MoM' },
        { title: 'Deals in Pipeline', value: sampleDataEnabled ? '32' : (sourceDeals.length || 0), icon: FiAward, color: '#8b5cf6', badge: '+8% MoM' },
        { title: 'Pipeline Value', value: `$${sampleDataEnabled ? '210,000' : (stats?.leadsSummary?.stats?.total_value || 0).toLocaleString()}`, icon: FiDollarSign, color: '#10b981', badge: 'Target 92%' },
        { title: 'Open Tickets', value: sampleDataEnabled ? '3' : (stats?.stats?.tickets?.open_tickets || 0), icon: FiAlertCircle, color: '#f59e0b', badge: 'Optimal' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-bento-layout">
            
            {/* Top Toolbar */}
            <div className="dashboard-top-bar">
                <div>
                    <h1 className="bento-title">Sales & Pipeline Command Center</h1>
                    <p className="bento-subtitle">Real-time revenue monitoring & AI intelligence workspace</p>
                </div>
                <div className="top-bar-actions">
                    <button className="bento-btn btn-secondary" onClick={loadDashboard}>
                        <FiRefreshCw /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Metric KPI Row */}
            <div className="bento-grid-4">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bento-card bento-metric-card">
                        <div className="metric-header">
                            <span className="metric-title">{card.title}</span>
                            <div className="metric-icon-box" style={{ background: `${card.color}15`, color: card.color }}>
                                <card.icon size={20} />
                            </div>
                        </div>
                        <div className="metric-body">
                            <span className="metric-value">{card.value}</span>
                            <span className="metric-badge">{card.badge}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* DEALS PIPELINE VELOCITY & STAGE BREAKDOWN */}
            <div className="bento-grid-2">
                {/* Pipeline Stage Funnel */}
                <div className="bento-card pipeline-stage-card">
                    <div className="card-header-flex">
                        <div>
                            <h3 className="card-heading">Deals Pipeline Velocity</h3>
                            <span className="card-subheading">Deal distribution by stage</span>
                        </div>
                        <Link href="/deals" className="bento-link-btn">
                            Manage Deals <FiChevronRight />
                        </Link>
                    </div>

                    <div className="deal-stages-container">
                        {dealStageBreakdown.map((stage) => (
                            <div key={stage.key} className="deal-stage-row">
                                <div className="stage-info">
                                    <span className="stage-name" style={{ color: stage.color }}>
                                        <span className="stage-dot" style={{ backgroundColor: stage.color }} />
                                        {stage.label}
                                    </span>
                                    <div className="stage-meta">
                                        <span className="stage-count">{stage.count} Deals</span>
                                        <span className="stage-val">${stage.totalValue.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="stage-progress-bg">
                                    <div 
                                        className="stage-progress-fill" 
                                        style={{ width: `${Math.max(stage.percentage, 8)}%`, backgroundColor: stage.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* High Value Deals Feed */}
                <div className="bento-card high-value-deals-card">
                    <div className="card-header-flex">
                        <div>
                            <h3 className="card-heading">Top High-Value Deals</h3>
                            <span className="card-subheading">Highest probability revenue</span>
                        </div>
                        <Link href="/deals" className="bento-link-btn">
                            View All <FiChevronRight />
                        </Link>
                    </div>

                    <div className="deals-mini-list">
                        {sourceDeals.slice(0, 4).map(deal => (
                            <div key={deal.id} className="deal-mini-item">
                                <div className="deal-item-info">
                                    <span className="deal-item-name">{deal.name}</span>
                                    <span className="deal-item-company">{deal.company || deal.company_name || 'Organization'}</span>
                                </div>
                                <div className="deal-item-right">
                                    <span className="deal-item-amount">${Number(deal.amount || 0).toLocaleString()}</span>
                                    <span className={`deal-stage-badge ${deal.stage}`}>
                                        {deal.stage || 'prospecting'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI SALES COPILOT & CRM HEALTH */}
            <div className="bento-grid-copilot">
                {/* AI Studio Assistant */}
                <div className="bento-card copilot-studio-card">
                    <div className="copilot-studio-header">
                        <div className="copilot-brand">
                            <div className="ai-badge-pulse"><FiCpu /> AI SALES COPILOT</div>
                            <h2>Predictive Scoring & Instant Outreach</h2>
                        </div>
                        <div className="ai-status-pill">
                            <span className="dot-online"></span> Custom Model
                        </div>
                    </div>

                    {sourceLeads && sourceLeads.length > 0 ? (
                        <div className="copilot-studio-content">
                            {/* Lead Selector */}
                            <div className="studio-selector">
                                <label>Target Lead</label>
                                <select 
                                    className="bento-select"
                                    value={selectedLeadId}
                                    onChange={(e) => setSelectedLeadId(e.target.value)}
                                >
                                    {sourceLeads.map(lead => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.title} ({lead.company || 'Org'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {activeLeadMeta && (
                                <div className="studio-lead-card">
                                    <div className="studio-lead-info">
                                        <h3>{activeLeadMeta.name}</h3>
                                        <p>{activeLeadMeta.company}</p>
                                    </div>
                                    <div className="score-meter">
                                        <span className="score-number">{activeLeadMeta.score}%</span>
                                        <span className="score-label">Conversion Likelihood</span>
                                    </div>
                                </div>
                            )}

                            <div className="studio-signals">
                                <span className="signals-title">Conversion Signals</span>
                                <ul className="signals-list">
                                    {activeLeadMeta?.reasons?.map((reason, i) => (
                                        <li key={i}><FiZap style={{ color: '#818cf8', flexShrink: 0 }} /> {reason}</li>
                                    ))}
                                </ul>
                            </div>

                            <button className="bento-btn btn-primary w-full" onClick={() => setIsEmailModalOpen(true)}>
                                <FiMail /> Generate Outreach Pitch
                            </button>
                        </div>
                    ) : (
                        <div className="empty-state-box">
                            <FiDatabase size={32} />
                            <p>No active leads in pipeline. Toggle Sample Data to ON to preview AI Copilot.</p>
                        </div>
                    )}
                </div>

                {/* System Health Index */}
                <div className="bento-card health-card">
                    <h3 className="card-heading">CRM Health Index</h3>
                    <div className="health-gauge">
                        <span className="health-score-big">92%</span>
                        <span className="health-status-text">OPTIMAL HEALTH</span>
                    </div>
                    <div className="health-checklist">
                        <div className="check-item">
                            <span><FiDatabase /> Database Sync</span>
                            <span className="text-success">Connected</span>
                        </div>
                        <div className="check-item">
                            <span><FiClock /> Stale Leads</span>
                            <span>{stats?.staleLeadsCount || 0} Leads</span>
                        </div>
                        <div className="check-item">
                            <span><FiZap /> Pipeline Velocity</span>
                            <span className="text-primary">High</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recharts Analytics Section */}
            <div className="bento-grid-charts">
                <div className="bento-card chart-card">
                    <h3 className="card-heading">Acquisition Growth Trend</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={leadTrendData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                                <Area type="monotone" dataKey="leads" stroke="#4f46e5" strokeWidth={3} fill="url(#areaGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card chart-card">
                    <h3 className="card-heading">Status Distribution</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={leadsByStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                                    {leadsByStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Pitch Modal */}
            <AnimatePresence>
                {isEmailModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsEmailModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiCpu /> AI Outreach Generator (Llama 3.1)</h3>
                                <button className="ai-modal-close" onClick={() => setIsEmailModalOpen(false)}><FiX /></button>
                            </div>
                            <div className="ai-modal-body">
                                <div className="tone-selector">
                                    {['professional', 'friendly', 'urgent', 'assertive'].map((tone) => (
                                        <button key={tone} className={`tone-btn ${selectedTone === tone ? 'active' : ''}`} onClick={() => setSelectedTone(tone)}>
                                            {tone.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <div className="email-preview-box">
                                    {generatingPitch ? <p>Generating AI pitch...</p> : aiPitch}
                                </div>
                            </div>
                            <div className="ai-modal-footer">
                                <button className="bento-btn btn-secondary" onClick={() => { navigator.clipboard.writeText(aiPitch); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                                    {copied ? <FiCheck /> : <FiCopy />} Copy Pitch
                                </button>
                                <button className="bento-btn btn-primary" onClick={() => setIsEmailModalOpen(false)}>Done</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
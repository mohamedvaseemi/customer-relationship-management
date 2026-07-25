"use client";
import { useState, useEffect, useCallback } from 'react';
import {
    FiActivity, FiServer, FiGlobe, FiPlus, FiTrash2,
    FiRefreshCw, FiCheckCircle, FiClock, FiShield,
    FiAlertTriangle, FiTrendingUp, FiZap, FiWifi,
    FiX, FiExternalLink, FiBarChart2, FiCpu, FiRadio
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

/* ─────────────── helpers ─────────────── */
const scoreColor = (score) => {
    if (score >= 90) return '#0acf97';
    if (score >= 50) return '#ffbc00';
    return '#fa5c7c';
};
const scoreLabel = (score) => {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
};
const msColor = (ms) => {
    const n = parseInt(ms);
    if (n < 100) return '#0acf97';
    if (n < 300) return '#ffbc00';
    return '#fa5c7c';
};

/* ─────────────── radial score ring ─────────────── */
function ScoreRing({ score, size = 72, stroke = 6 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = scoreColor(score);
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="var(--border-color)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
                fill={color} fontSize="15" fontWeight="700"
                style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
                {score}
            </text>
        </svg>
    );
}

/* ─────────────── response bar ─────────────── */
function ResponseBar({ label, time }) {
    const ms = parseInt(time);
    const pct = Math.min((ms / 500) * 100, 100);
    const color = msColor(time);
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
                <span style={{ color, fontWeight: '700' }}>{time}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                    width: `${pct}%`, height: '100%', background: color,
                    borderRadius: '99px', transition: 'width 1s ease',
                    boxShadow: `0 0 8px ${color}50`
                }} />
            </div>
        </div>
    );
}

/* ─────────────── stat chip ─────────────── */
function StatChip({ icon: Icon, label, value, color }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '12px',
            background: `${color}12`, border: `1px solid ${color}25`
        }}>
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${color}20`, color, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={16} />
            </div>
            <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
            </div>
        </div>
    );
}

/* ─────────────── main page ─────────────── */
export default function AppMonitoring() {
    const { user: currentUser } = useAuth();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'frontend', url: '' });

    const loadApps = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/monitoring', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.apps) setApps(data.apps);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser?.role === 'admin') loadApps();
        else setLoading(false);
    }, [currentUser, loadApps]);

    const showFeedback = (msg, type = 'success') => {
        setFeedback({ msg, type });
        setTimeout(() => setFeedback(null), 3500);
    };

    const handleAddApp = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/monitoring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error();
            setShowPanel(false);
            setFormData({ name: '', type: 'frontend', url: '' });
            await loadApps(true);
            showFeedback(`"${formData.name}" added to monitoring successfully.`);
        } catch {
            showFeedback('Failed to add app. Please check the URL and try again.', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        setDeletingId(id);
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/monitoring?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadApps(true);
            showFeedback(`"${name}" removed from monitoring.`);
        } catch {
            showFeedback('Failed to remove app.', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    /* ── derived summary stats ── */
    const frontendApps = apps.filter(a => a.type === 'frontend');
    const backendApps  = apps.filter(a => a.type === 'backend');
    const avgPerf = frontendApps.length
        ? Math.round(frontendApps.reduce((s, a) => s + (a.lighthouse?.performance || 0), 0) / frontendApps.length)
        : 0;
    const avgSeo = frontendApps.length
        ? Math.round(frontendApps.reduce((s, a) => s + (a.lighthouse?.seo || 0), 0) / frontendApps.length)
        : 0;
    const goodApps = frontendApps.filter(a => (a.lighthouse?.performance || 0) >= 90).length;

    /* ── guards ── */
    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    if (!currentUser || currentUser.role !== 'admin') return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '20px',
                background: 'rgba(250,92,124,0.1)', color: '#fa5c7c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '36px'
            }}><FiShield /></div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>Access Denied</h1>
            <p style={{ color: 'var(--text-secondary)' }}>App Monitoring is available for administrators only.</p>
        </div>
    );

    const lhKeys = { performance: 'Performance', accessibility: 'Accessibility', bestPractices: 'Best Practices', seo: 'SEO' };

    return (
        <div style={{ padding: '0 0 40px' }}>

            {/* ── Toast Feedback ── */}
            {feedback && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
                    padding: '14px 20px', borderRadius: '14px', display: 'flex',
                    alignItems: 'center', gap: '10px', minWidth: '300px',
                    background: feedback.type === 'error' ? 'rgba(250,92,124,0.15)' : 'rgba(10,207,151,0.15)',
                    border: `1px solid ${feedback.type === 'error' ? 'rgba(250,92,124,0.4)' : 'rgba(10,207,151,0.4)'}`,
                    backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    animation: 'slideInRight 0.3s ease'
                }}>
                    {feedback.type === 'error'
                        ? <FiAlertTriangle size={18} color="#fa5c7c" />
                        : <FiCheckCircle size={18} color="#0acf97" />}
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{feedback.msg}</span>
                    <button onClick={() => setFeedback(null)} style={{
                        marginLeft: 'auto', background: 'none', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer'
                    }}><FiX size={14} /></button>
                </div>
            )}

            {/* ── Page Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(109,40,217,0.35)'
                    }}>
                        <FiActivity size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>App Monitoring</h1>
                        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Lighthouse scores &amp; API response times across all project apps
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => loadApps(true)}
                        disabled={refreshing}
                        className="btn btn-secondary"
                        style={{ gap: '6px' }}
                    >
                        <FiRefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowPanel(true)}>
                        <FiPlus size={16} /> Add App
                    </button>
                </div>
            </div>

            {/* ── Summary Strip ── */}
            {apps.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                    <StatChip icon={FiGlobe}    label="Frontend Apps"   value={frontendApps.length} color="#8b5cf6" />
                    <StatChip icon={FiServer}   label="Backend APIs"    value={backendApps.length}  color="#0acf97" />
                    <StatChip icon={FiTrendingUp} label="Avg Performance" value={`${avgPerf}`}      color="#39afd1" />
                    <StatChip icon={FiBarChart2} label="Avg SEO Score"  value={`${avgSeo}`}         color="#ffbc00" />
                    <StatChip icon={FiZap}      label="Healthy (≥90)"   value={goodApps}            color="#0acf97" />
                </div>
            )}

            {/* ── App Grid ── */}
            {apps.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '80px 20px',
                    background: 'var(--bg-secondary)', borderRadius: '20px',
                    border: '2px dashed var(--border-color)'
                }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(139,92,246,0.1)', color: 'var(--primary-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', fontSize: '32px'
                    }}><FiRadio /></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Apps Monitored Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                        Add your frontend and backend apps to start tracking Lighthouse scores and API response times.
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowPanel(true)}>
                        <FiPlus /> Add Your First App
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                    {apps.map((app) => (
                        <div key={app.id} style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '18px',
                            overflow: 'hidden',
                            transition: 'box-shadow 0.3s, transform 0.3s',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* card top accent */}
                            <div style={{
                                height: '4px',
                                background: app.type === 'frontend'
                                    ? 'linear-gradient(90deg,#6d28d9,#8b5cf6,#a78bfa)'
                                    : 'linear-gradient(90deg,#059669,#0acf97,#34d399)'
                            }} />

                            <div style={{ padding: '22px 22px 18px' }}>
                                {/* header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                                            background: app.type === 'frontend' ? 'rgba(109,40,217,0.1)' : 'rgba(10,207,151,0.1)',
                                            color: app.type === 'frontend' ? '#8b5cf6' : '#0acf97',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
                                        }}>
                                            {app.type === 'frontend' ? <FiGlobe /> : <FiServer />}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {app.name}
                                                </h3>
                                                <span style={{
                                                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                                                    padding: '2px 8px', borderRadius: '99px',
                                                    background: app.type === 'frontend' ? 'rgba(139,92,246,0.12)' : 'rgba(10,207,151,0.12)',
                                                    color: app.type === 'frontend' ? '#8b5cf6' : '#0acf97'
                                                }}>
                                                    {app.type}
                                                </span>
                                            </div>
                                            <a href={app.url} target="_blank" rel="noreferrer" style={{
                                                fontSize: '12px', color: 'var(--text-muted)',
                                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px'
                                            }}>
                                                <FiExternalLink size={11} />
                                                {app.url}
                                            </a>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(app.id, app.name)}
                                        disabled={deletingId === app.id}
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                                            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                                            color: 'var(--text-muted)', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s', marginLeft: '8px'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(250,92,124,0.1)';
                                            e.currentTarget.style.color = '#fa5c7c';
                                            e.currentTarget.style.borderColor = 'rgba(250,92,124,0.3)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                                            e.currentTarget.style.color = 'var(--text-muted)';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                        }}
                                        title="Remove app"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>

                                {/* ── Frontend: Lighthouse ── */}
                                {app.type === 'frontend' && app.lighthouse && (() => {
                                    const scores = app.lighthouse;
                                    const overallScore = scores.performance;
                                    return (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FiZap size={13} /> Lighthouse Report
                                                </span>
                                                <span style={{
                                                    fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700,
                                                    background: `${scoreColor(overallScore)}18`,
                                                    color: scoreColor(overallScore), border: `1px solid ${scoreColor(overallScore)}40`
                                                }}>
                                                    {scoreLabel(overallScore)}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-around', marginBottom: '16px' }}>
                                                {Object.entries(lhKeys).map(([key, label]) => (
                                                    <div key={key} style={{ textAlign: 'center' }}>
                                                        <ScoreRing score={scores[key] || 0} size={68} stroke={5} />
                                                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 600 }}>
                                                            {label}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* aggregate bar */}
                                            <div style={{ background: 'var(--bg-primary)', borderRadius: '10px', padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Overall Health</span>
                                                    <span style={{ fontWeight: 700, color: scoreColor(overallScore) }}>{overallScore}%</span>
                                                </div>
                                                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%', width: `${overallScore}%`,
                                                        background: `linear-gradient(90deg, ${scoreColor(overallScore)}, ${scoreColor(overallScore)}99)`,
                                                        borderRadius: '99px', transition: 'width 1s ease'
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* ── Backend: Response Times ── */}
                                {app.type === 'backend' && app.responseTimes && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FiCpu size={13} /> API Response Times
                                            </span>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '4px 10px', borderRadius: '99px',
                                                background: 'rgba(10,207,151,0.1)', border: '1px solid rgba(10,207,151,0.3)'
                                            }}>
                                                <FiWifi size={11} color="#0acf97" />
                                                <span style={{ fontSize: '11px', color: '#0acf97', fontWeight: 700 }}>
                                                    Avg {app.avgResponseTime}
                                                </span>
                                            </div>
                                        </div>
                                        {Object.entries(app.responseTimes).map(([ep, t]) => (
                                            <ResponseBar key={ep} label={ep} time={t} />
                                        ))}
                                    </div>
                                )}

                                {/* footer */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '11px', color: 'var(--text-muted)',
                                    paddingTop: '14px', marginTop: '14px',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <FiCheckCircle size={12} color="#0acf97" />
                                    Last checked: {new Date(app.lastChecked).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Add App Slide-in Panel ── */}
            {showPanel && (
                <div
                    onClick={() => setShowPanel(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 999,
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: '520px',
                            background: 'var(--bg-secondary)', borderRadius: '20px',
                            overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
                            border: '1px solid var(--border-color)',
                            animation: 'fadeInScale 0.25s ease'
                        }}
                    >
                        {/* panel header */}
                        <div style={{
                            padding: '20px 24px', display: 'flex',
                            alignItems: 'center', justifyContent: 'space-between',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'linear-gradient(135deg, rgba(109,40,217,0.08), rgba(139,92,246,0.04))'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <FiPlus size={18} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Add Application</h2>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        Monitor frontend Lighthouse scores or backend API times
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPanel(false)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                    background: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            ><FiX size={16} /></button>
                        </div>

                        <form onSubmit={handleAddApp} style={{ padding: '24px' }}>
                            {/* type picker */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                                    App Type
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {[
                                        { val: 'frontend', icon: FiGlobe, label: 'Frontend', desc: 'Lighthouse audit', color: '#8b5cf6' },
                                        { val: 'backend',  icon: FiServer, label: 'Backend', desc: 'API response times', color: '#0acf97' }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setFormData(f => ({ ...f, type: opt.val }))}
                                            style={{
                                                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                                border: `2px solid ${formData.type === opt.val ? opt.color : 'var(--border-color)'}`,
                                                background: formData.type === opt.val ? `${opt.color}10` : 'var(--bg-primary)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
                                                transition: 'all 0.2s', textAlign: 'left'
                                            }}
                                        >
                                            <opt.icon size={18} color={formData.type === opt.val ? opt.color : 'var(--text-muted)'} />
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: formData.type === opt.val ? opt.color : 'var(--text-primary)' }}>
                                                {opt.label}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* name */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                                    App Name
                                </label>
                                <input
                                    type="text"
                                    className="input-alt"
                                    style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '10px' }}
                                    value={formData.name}
                                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g., Marketing Website"
                                    required
                                />
                            </div>

                            {/* url */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                                    {formData.type === 'frontend' ? 'Frontend URL' : 'Backend Base URL'}
                                </label>
                                <input
                                    type="url"
                                    className="input-alt"
                                    style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '10px', fontFamily: 'monospace' }}
                                    value={formData.url}
                                    onChange={e => setFormData(f => ({ ...f, url: e.target.value }))}
                                    placeholder={formData.type === 'frontend' ? 'https://yoursite.com' : 'https://api.yoursite.com'}
                                    required
                                />
                            </div>

                            {/* info tip */}
                            <div style={{
                                padding: '12px 14px', borderRadius: '10px', marginBottom: '20px',
                                background: 'rgba(57,175,209,0.08)', border: '1px solid rgba(57,175,209,0.2)',
                                display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)'
                            }}>
                                <FiActivity size={14} color="#39afd1" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <span>
                                    {formData.type === 'frontend'
                                        ? 'Lighthouse scores for Performance, Accessibility, Best Practices and SEO will be simulated and refreshed on demand.'
                                        : 'Response times will be measured for common API endpoints under the base URL provided.'}
                                </span>
                            </div>

                            {/* actions */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPanel(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <FiPlus size={15} /> Add to Monitoring
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight {
                    from { opacity:0; transform:translateX(20px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes fadeInScale {
                    from { opacity:0; transform:scale(0.96); }
                    to   { opacity:1; transform:scale(1); }
                }
                @keyframes spin {
                    to { transform:rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

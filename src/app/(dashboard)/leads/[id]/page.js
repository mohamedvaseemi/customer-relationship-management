"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowLeft, FiMail, FiPhone, FiCalendar, FiEdit, FiTrash2,
    FiClock, FiStar, FiZap, FiCheckCircle, FiActivity
} from 'react-icons/fi';
import { leadsAPI, intelligenceAPI, automationAPI } from '@/api/api';
import { motion } from 'framer-motion';
import '@/styles/LeadDetails.css';

export default function LeadDetails({ params }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [lead, setLead] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [automations, setAutomations] = useState([]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [leadRes, timelineRes, autoRes] = await Promise.all([
                leadsAPI.getById(id),
                intelligenceAPI.getTimeline(id),
                automationAPI.getTemplates()
            ]);
            setLead(leadRes.data.lead);
            setTimeline(timelineRes.data.timeline || []);
            setAutomations(autoRes.data.templates || []);
        } catch (error) {
            console.error('Error fetching lead details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerAutomation = async (templateId) => {
        try {
            await automationAPI.triggerAutomation({ lead_id: id, template_id: templateId });
            alert('Automation sequence started!');
            fetchData(); // Refresh timeline
        } catch (error) {
            console.error('Error triggering automation:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await leadsAPI.delete(id);
                router.push('/leads');
            } catch (error) {
                console.error('Failed to delete lead:', error);
            }
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-primary)' }}>Analysing Lead Data...</div>;
    if (!lead) return <div className="p-8 text-center text-danger">Lead Not Found</div>;

    return (
        <div className="lead-detail-page">
            <button className="btn btn-secondary mb-6" onClick={() => router.push('/leads')}>
                <FiArrowLeft /> Back to Leads
            </button>

            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{lead.title}</h1>
                    <div className="flex gap-4 text-muted">
                        <span className="flex items-center gap-1"><FiMail /> {lead.email || 'No Email'}</span>
                        <span className="flex items-center gap-1"><FiPhone /> {lead.phone || 'No Phone'}</span>
                        <span className="flex items-center gap-1"><FiStar /> {lead.company || 'Private Individual'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-danger btn-icon" onClick={handleDelete} title="Delete"><FiTrash2 /></button>
                </div>
            </header>

            <div className="quick-actions-bar">
                {automations.map(auto => (
                    <button key={auto.id} className="btn btn-primary" onClick={() => handleTriggerAutomation(auto.id)}>
                        <FiZap /> Run {auto.name}
                    </button>
                ))}
                {automations.length === 0 && (
                    <button className="btn btn-primary" onClick={() => handleTriggerAutomation(1)}>
                        <FiZap /> Run Warm-up Sequence
                    </button>
                )}
                <button className="btn btn-secondary">
                    <FiCalendar /> Schedule Call
                </button>
                <button className="btn btn-secondary">
                    <FiMail /> Send Proposal
                </button>
            </div>

            <div className="details-grid">
                <div className="timeline-section">
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Activity Timeline</h2>
                    <div className="card timeline-card">
                        {timeline.length > 0 ? timeline.map(item => (
                            <div key={item.id} className="timeline-item">
                                <div className="timeline-icon">
                                    <FiClock size={14} />
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-action">{item.action}</span>
                                        <span className="timeline-time">
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="timeline-body">
                                        {item.old_value && <s>{item.old_value}</s>}
                                        {item.new_value && <span> → {item.new_value}</span>}
                                        {!item.old_value && !item.new_value && <span>Activity logged by {item.user_name}</span>}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-muted">
                                <FiActivity size={48} className="mx-auto mb-4 opacity-10" />
                                <p>No major events yet. Start interacting to build a timeline.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="info-section">
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Lead Overview</h2>
                    <div className="card mb-6">
                        <div className="info-grid mb-6">
                            <div className="info-item">
                                <label>Current Stage</label>
                                <div className={`badge-alt stage-badge badge-${lead.status}`}>
                                    {lead.status?.toUpperCase() || 'NEW'}
                                </div>
                            </div>
                            <div className="info-item">
                                <label>Priority</label>
                                <div className={`badge-alt priority-badge badge-${lead.priority}`}>
                                    {lead.priority?.toUpperCase() || 'MEDIUM'}
                                </div>
                            </div>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Pipeline Value</label>
                                <p className="text-xl font-bold text-primary">${Number(lead.value || 0).toLocaleString()}</p>
                            </div>
                            <div className="info-item">
                                <label>Conversion Probability</label>
                                <p>{lead.probability || 0}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold mb-4">Contact Details</h3>
                        <div className="flex flex-col gap-4">
                            <div className="info-item">
                                <label>Full Name</label>
                                <p>{lead.first_name || lead.title} {lead.last_name || ''}</p>
                            </div>
                            <div className="info-item">
                                <label>Account</label>
                                <p>{lead.company || 'Private Individual'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

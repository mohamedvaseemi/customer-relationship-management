import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiMail, FiPhone, FiCalendar, FiEdit, FiTrash2,
    FiClock, FiStar, FiZap, FiCheckCircle, FiActivity
} from 'react-icons/fi';
import { leadsAPI, intelligenceAPI, automationAPI } from '../api/api';
import { motion } from 'framer-motion';
import './LeadDetails.css';

const LeadDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [automations, setAutomations] = useState([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [leadRes, timelineRes, autoRes] = await Promise.all([
                leadsAPI.getById(id),
                intelligenceAPI.getTimeline(id),
                automationAPI.getTemplates()
            ]);
            setLead(leadRes.data.lead);
            setTimeline(timelineRes.data.timeline);
            setAutomations(autoRes.data.templates);
        } catch (error) {
            console.error('Error fetching lead details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerAutomation = async (templateId) => {
        try {
            await automationAPI.trigger({ lead_id: id, template_id: templateId });
            alert('Automation sequence started!');
            fetchData(); // Refresh timeline
        } catch (error) {
            console.error('Error triggering automation:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Analysing Lead Data...</div>;
    if (!lead) return <div className="p-8 text-center text-danger">Lead Not Found</div>;

    return (
        <div className="lead-detail-page">
            <button className="btn btn-secondary mb-6" onClick={() => navigate('/leads')}>
                <FiArrowLeft /> Back to Leads
            </button>

            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{lead.title}</h1>
                    <div className="flex gap-4 text-muted">
                        <span className="flex items-center gap-1"><FiMail /> {lead.email}</span>
                        <span className="flex items-center gap-1"><FiPhone /> {lead.phone || 'No Phone'}</span>
                        <span className="flex items-center gap-1"><FiStar /> {lead.company}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary"><FiEdit /> Edit</button>
                    <button className="btn btn-danger btn-icon" title="Delete"><FiTrash2 /></button>
                </div>
            </header>

            <div className="quick-actions-bar">
                <button className="btn btn-primary" onClick={() => handleTriggerAutomation(1)}>
                    <FiZap /> Run Warm-up Sequence
                </button>
                <button className="btn btn-secondary">
                    <FiCalendar /> Schedule Call
                </button>
                <button className="btn btn-secondary">
                    <FiMail /> Send Proposal
                </button>
            </div>

            <div className="details-grid">
                <div className="timeline-section">
                    <h2 className="text-xl font-bold mb-6">Activity Timeline</h2>
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
                                        {!item.old_value && !item.new_value && <span>Status updated by {item.user_name}</span>}
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
                    <h2 className="text-xl font-bold mb-6">Lead Overview</h2>
                    <div className="card mb-6">
                        <div className="info-grid mb-6">
                            <div className="info-item">
                                <label>Current Status</label>
                                <div className={`badge badge-${lead.status === 'won' ? 'success' : 'primary'}`}>
                                    {lead.status?.toUpperCase() || 'NEW'}
                                </div>
                            </div>
                            <div className="info-item">
                                <label>Priority</label>
                                <div className={`badge badge-${lead.priority === 'high' ? 'danger' : 'secondary'}`}>
                                    {lead.priority?.toUpperCase() || 'MEDIUM'}
                                </div>
                            </div>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Pipeline Value</label>
                                <p className="text-xl font-bold text-primary">${Number(lead.value).toLocaleString()}</p>
                            </div>
                            <div className="info-item">
                                <label>Conversion Probability</label>
                                <p>{lead.probability}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold mb-4">Contact Details</h3>
                        <div className="flex flex-col gap-4">
                            <div className="info-item">
                                <label>Full Name</label>
                                <p>{lead.first_name} {lead.last_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Account</label>
                                <p>{lead.company}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetails;

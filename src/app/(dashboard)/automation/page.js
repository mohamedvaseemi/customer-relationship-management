"use client";
import { useState, useEffect } from 'react';
import { FiPlus, FiZap, FiSettings, FiActivity, FiClock, FiMail } from 'react-icons/fi';
import { automationAPI } from '@/api/api';
import { motion } from 'framer-motion';
import '@/styles/Automation.css';

export default function Automation() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await automationAPI.getTemplates();
            setTemplates(response.data.templates || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            // Mock data if API fails/is empty
            setTemplates([
                { id: 1, name: 'New Lead Warm-up', trigger_event: 'new_lead', description: 'Sequence of tasks to welcome a new lead.' },
                { id: 2, name: 'Post-Sale Follow-up', trigger_event: 'status_won', description: 'Ensure customer satisfaction after a win.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="automation-container">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Workflow Automation</h1>
                    <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>Set up automated sequences to handle your busy work.</p>
                </div>
                <button className="btn btn-primary"><FiPlus /> Create Workflow</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {templates.map(template => (
                    <motion.div
                        key={template.id}
                        whileHover={{ y: -5 }}
                        className="card template-card flex flex-col justify-between"
                        style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="p-3 bg-primary-subtle rounded-lg text-primary" style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--primary-color)' }}>
                                    <FiZap size={20} />
                                </div>
                                <div className="badge-alt trigger-badge">{template.trigger_event}</div>
                            </div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{template.name}</h3>
                            <p className="text-sm text-muted mb-4" style={{ color: 'var(--text-secondary)' }}>{template.description}</p>
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="text-xs font-semibold text-primary">3 STEPS</span>
                            <div className="flex gap-2">
                                <button className="action-btn" style={{ padding: '4px' }}><FiSettings size={16} /></button>
                                <button className="action-btn" style={{ padding: '4px' }}><FiActivity size={16} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12" style={{ marginTop: '40px' }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Workflow Playground</h2>
                <div className="card bg-tertiary" style={{ background: 'var(--bg-tertiary)', padding: '20px' }}>
                    <div className="task-sequence" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                        <div className="task-step" style={{ minWidth: '200px', flex: 1 }}>
                            <div className="step-badge">1</div>
                            <h4 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiMail className="text-info" /> Welcome Email</h4>
                            <p className="text-xs text-muted" style={{ color: 'var(--text-secondary)' }}>Sent immediately when trigger fires.</p>
                        </div>
                        <div className="task-step" style={{ minWidth: '200px', flex: 1 }}>
                            <div className="step-badge">2</div>
                            <h4 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiClock className="text-warning" /> 2-Day Delay</h4>
                            <p className="text-xs text-muted" style={{ color: 'var(--text-secondary)' }}>Waiting period before next action.</p>
                        </div>
                        <div className="task-step" style={{ minWidth: '200px', flex: 1 }}>
                            <div className="step-badge">3</div>
                            <h4 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiActivity className="text-success" /> Follow-up Task</h4>
                            <p className="text-xs text-muted" style={{ color: 'var(--text-secondary)' }}>Creates a task for: 'Call lead to check interest'</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiZap, FiSettings, FiActivity, FiClock, FiMail, FiCheckCircle } from 'react-icons/fi';
import { automationAPI } from '@/api/api';
import { motion } from 'framer-motion';
import '@/styles/Automation.css';

export default function Automation() {
    const router = useRouter();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // New state for dynamic playground
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

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

    // New function to fetch tasks when a template is clicked
    const handleSelectTemplate = async (template) => {
        setSelectedTemplate(template);
        setLoadingTasks(true);
        setTasks([]); // Clear previous tasks while loading
        
        try {
            const response = await automationAPI.getTemplateTasks(template.id);
            setTasks(response.data.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Fallback mock tasks based on your database schema
            setTasks([
                { id: 101, step_order: 1, action_type: 'email', task_subject: 'Welcome Email', delay_days: 0 },
                { id: 102, step_order: 2, action_type: 'delay', task_subject: 'Wait period', delay_days: 2 },
                { id: 103, step_order: 3, action_type: 'create_task', task_subject: 'Call lead to check interest', delay_days: 0 }
            ]);
        } finally {
            setLoadingTasks(false);
        }
    };

    // Helper to render the right icon based on the action_type from your DB
    const getTaskIcon = (actionType) => {
        switch (actionType) {
            case 'email': return <FiMail className="text-info" />;
            case 'delay': return <FiClock className="text-warning" />;
            case 'create_task': return <FiActivity className="text-success" />;
            default: return <FiCheckCircle className="text-primary" />;
        }
    };

    return (
        <div className="automation-container">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Workflow Automation</h1>
                    <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>Set up automated sequences to handle your busy work.</p>
                </div>
                <button className="btn btn-primary" onClick={() => router.push('/settings/workflows')}><FiPlus /> Create Workflow</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {templates.map(template => (
                    <motion.div
                        key={template.id}
                        whileHover={{ y: -5 }}
                        // Add click handler and dynamic styling if selected
                        onClick={() => handleSelectTemplate(template)}
                        className={`card template-card flex flex-col justify-between cursor-pointer ${selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''}`}
                        style={{ 
                            minHeight: '180px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            border: selectedTemplate?.id === template.id ? '2px solid var(--primary-color)' : 'none'
                        }}
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
                            {/* You could optionally update this to show the actual step count if you fetch it beforehand */}
                            <span className="text-xs font-semibold text-primary">VIEW STEPS</span>
                            <div className="flex gap-2">
                                <button className="action-btn" style={{ padding: '4px' }}><FiSettings size={16} /></button>
                                <button className="action-btn" style={{ padding: '4px' }}><FiActivity size={16} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12" style={{ marginTop: '40px' }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    {selectedTemplate ? `Workflow Playground: ${selectedTemplate.name}` : 'Workflow Playground (Select a template)'}
                </h2>
                
                <div className="card bg-tertiary" style={{ background: 'var(--bg-tertiary)', padding: '20px' }}>
                    {loadingTasks ? (
                        <p className="text-center text-muted">Loading workflow steps...</p>
                    ) : tasks.length > 0 ? (
                        <div className="task-sequence" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {tasks.map((task, index) => (
                                <div key={task.id} className="task-step" style={{ minWidth: '200px', flex: 1 }}>
                                    <div className="step-badge">{task.step_order || index + 1}</div>
                                    <h4 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize' }}>
                                        {getTaskIcon(task.action_type)} {task.action_type.replace('_', ' ')}
                                    </h4>
                                    <p className="text-xs text-muted mt-2" style={{ color: 'var(--text-secondary)' }}>
                                        {task.task_subject}
                                    </p>
                                    {task.delay_days > 0 && (
                                        <p className="text-xs mt-1 text-warning">
                                            Delay: {task.delay_days} days
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted">
                            {selectedTemplate ? 'No tasks found for this template.' : 'Click a template above to view its sequence.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
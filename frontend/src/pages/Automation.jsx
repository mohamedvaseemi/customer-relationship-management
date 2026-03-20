import { useState, useEffect } from 'react';
import { FiPlus, FiZap, FiSettings, FiActivity, FiClock, FiMail } from 'react-icons/fi';
import { automationAPI } from '../api/api';
import { motion } from 'framer-motion';
import './Automation.css';

const Automation = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await automationAPI.getTemplates();
            setTemplates(response.data.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
            // Mock data if API is empty
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
                    <h1 className="text-3xl font-bold">Workflow Automation</h1>
                    <p className="text-muted">Set up automated sequences to handle your busy work.</p>
                </div>
                <button className="btn btn-primary"><FiPlus /> Create Workflow</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <motion.div
                        key={template.id}
                        whileHover={{ y: -5 }}
                        className="card template-card flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary-subtle rounded-lg text-primary">
                                    <FiZap size={20} />
                                </div>
                                <div className="badge badge-secondary">{template.trigger_event}</div>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                            <p className="text-sm text-muted mb-4">{template.description}</p>
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center">
                            <span className="text-xs font-semibold text-primary">3 STEPS</span>
                            <div className="flex gap-2">
                                <button className="btn btn-icon"><FiSettings size={16} /></button>
                                <button className="btn btn-icon"><FiActivity size={16} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">Workflow Playground</h2>
                <div className="card bg-tertiary">
                    <div className="task-sequence">
                        <div className="task-step">
                            <div className="step-badge">1</div>
                            <h4 className="font-bold flex items-center gap-2"><FiMail className="text-info" /> Welcome Email</h4>
                            <p className="text-xs text-muted">Sent immediately when trigger fires.</p>
                        </div>
                        <div className="task-step">
                            <div className="step-badge">2</div>
                            <h4 className="font-bold flex items-center gap-2"><FiClock className="text-warning" /> 2-Day Delay</h4>
                            <p className="text-xs text-muted">Waiting period before next action.</p>
                        </div>
                        <div className="task-step">
                            <div className="step-badge">3</div>
                            <h4 className="font-bold flex items-center gap-2"><FiActivity className="text-success" /> Follow-up Task</h4>
                            <p className="text-xs text-muted">Creates a task for: 'Call lead to check interest'</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Automation;

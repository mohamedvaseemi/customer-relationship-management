-- Workflow Automation Templates
CREATE TABLE IF NOT EXISTS automation_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(100), -- e.g., 'new_lead', 'status_won'
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automation Tasks (Sequences)
CREATE TABLE IF NOT EXISTS automation_tasks (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES automation_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    action_type VARCHAR(100), -- e.g., 'create_task', 'send_email', 'update_status'
    delay_days INTEGER DEFAULT 0,
    task_subject VARCHAR(255),
    task_description TEXT
);

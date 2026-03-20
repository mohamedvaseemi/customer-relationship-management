import ComingSoonPage from '@/components/ComingSoonPage';

export default function AutomationPage() {
    return (
        <ComingSoonPage
            icon="⚡"
            title="Workflow Automation"
            description="Build powerful no-code automation workflows to eliminate repetitive tasks and accelerate your sales process."
            features={[
                { icon: '🔄', title: 'Trigger-Based Flows', desc: 'Automate actions on events like new leads or deal stage changes' },
                { icon: '📧', title: 'Email Sequences', desc: 'Automated drip campaigns and follow-up sequences' },
                { icon: '🤖', title: 'AI Actions', desc: 'Let AI classify, score, and route leads automatically' },
                { icon: '📊', title: '100+ Integrations', desc: 'Connect with Slack, HubSpot, Salesforce, and more' },
            ]}
        />
    );
}

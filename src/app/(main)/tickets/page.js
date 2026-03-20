import ComingSoonPage from '@/components/ComingSoonPage';

export default function TicketsPage() {
    return (
        <ComingSoonPage
            icon="🎧"
            title="Service Desk"
            description="Unified customer support with ticketing, SLAs, and seamless hand-off between sales and support teams."
            features={[
                { icon: '🎫', title: 'Ticket Management', desc: 'Smart ticket routing with priority scoring' },
                { icon: '⏱️', title: 'SLA Tracking', desc: 'Monitor and enforce response and resolution SLAs' },
                { icon: '🤝', title: 'Customer Portal', desc: 'Self-service portal for customers to track their issues' },
                { icon: '🔁', title: 'Sales Handoff', desc: 'Seamlessly escalate support issues to sales opportunities' },
            ]}
        />
    );
}

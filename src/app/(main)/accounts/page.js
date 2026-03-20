import ComingSoonPage from '@/components/ComingSoonPage';

export default function AccountsPage() {
    return (
        <ComingSoonPage
            icon="🏢"
            title="Account Intelligence"
            description="Manage B2B relationships at the organizational level with hierarchical account structures and team collaboration."
            features={[
                { icon: '🔗', title: 'Account Hierarchy', desc: 'Parent-child company relationships for enterprise accounts' },
                { icon: '👥', title: 'Stakeholder Mapping', desc: 'Visualize all contacts within an account' },
                { icon: '💼', title: 'Account Health Score', desc: 'AI-calculated health metrics to prioritize accounts' },
                { icon: '📋', title: 'Activity Timeline', desc: 'Full history of all interactions with each account' },
            ]}
        />
    );
}

import ComingSoonPage from '@/components/ComingSoonPage';

export default function CampaignsPage() {
    return (
        <ComingSoonPage
            icon="📢"
            title="Marketing Campaigns"
            description="Design, launch, and measure multi-channel marketing campaigns to drive pipeline growth."
            features={[
                { icon: '✉️', title: 'Email Campaigns', desc: 'Drag-and-drop email builder with A/B testing' },
                { icon: '📱', title: 'SMS Campaigns', desc: 'High-engagement mobile messaging campaigns' },
                { icon: '🌐', title: 'Landing Pages', desc: 'No-code landing page builder with CRM capture forms' },
                { icon: '📉', title: 'Campaign ROI', desc: 'Track revenue influenced by marketing campaigns' },
            ]}
        />
    );
}

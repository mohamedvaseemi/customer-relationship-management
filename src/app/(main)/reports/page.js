import ComingSoonPage from '@/components/ComingSoonPage';

export default function ReportsPage() {
    return (
        <ComingSoonPage
            icon="📊"
            title="Analytics & Reports"
            description="Deep-dive into your pipeline performance with AI-powered insights, trend forecasting, and custom dashboards."
            features={[
                { icon: '📈', title: 'Revenue Forecasting', desc: 'AI-driven predictions based on historical pipeline data' },
                { icon: '🎯', title: 'Goal Tracking', desc: 'Set and monitor team and individual sales targets' },
                { icon: '🔍', title: 'Funnel Analysis', desc: 'Identify drop-off points and optimize conversion at each stage' },
                { icon: '📄', title: 'Custom Reports', desc: 'Build and export tailored reports for stakeholders' },
            ]}
        />
    );
}

import ComingSoonPage from '@/components/ComingSoonPage';

export default function ActivitiesPage() {
    return (
        <ComingSoonPage
            icon="📅"
            title="Activity Center"
            description="Centralized hub for meetings, calls, follow-ups, and tasks — with smart scheduling and calendar integration."
            features={[
                { icon: '📞', title: 'Call Logging', desc: 'One-click call logging with notes and outcomes' },
                { icon: '🤝', title: 'Meeting Scheduler', desc: 'Integrated calendar with Google and Outlook sync' },
                { icon: '✅', title: 'Task Management', desc: 'Smart to-do lists with deadline tracking and reminders' },
                { icon: '🔔', title: 'Smart Reminders', desc: 'AI-prioritized follow-up suggestions based on deal stage' },
            ]}
        />
    );
}

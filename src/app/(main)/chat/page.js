import ComingSoonPage from '@/components/ComingSoonPage';

export default function ChatPage() {
    return (
        <ComingSoonPage
            icon="💬"
            title="Team Collaboration"
            description="Real-time messaging, deal rooms, and shared context for your entire revenue team."
            features={[
                { icon: '💬', title: 'Deal Rooms', desc: 'Dedicated channels per deal with all context in one place' },
                { icon: '📌', title: 'Pinned Insights', desc: 'Pin key data — emails, calls, notes — to team threads' },
                { icon: '🔔', title: 'Smart Mentions', desc: 'Tag teammates on deals with automatic context sharing' },
                { icon: '📹', title: 'Video Rooms', desc: 'One-click video calls embedded in deal conversations' },
            ]}
        />
    );
}

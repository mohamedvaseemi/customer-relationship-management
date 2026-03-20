import ComingSoonPage from '@/components/ComingSoonPage';

export default function CallsPage() {
    return (
        <ComingSoonPage
            icon="📞"
            title="Call Intelligence"
            description="VoIP calling, call recording, and AI-powered conversation analysis directly within ModernCRM."
            features={[
                { icon: '🎙️', title: 'Built-in VoIP', desc: 'Make and receive calls without leaving the platform' },
                { icon: '🎧', title: 'Call Recording', desc: 'Automatic recording with searchable transcripts' },
                { icon: '🧠', title: 'AI Sentiment Analysis', desc: 'Understand customer mood and topics discussed' },
                { icon: '📝', title: 'Auto Call Notes', desc: 'AI-generated call summaries and next steps' },
            ]}
        />
    );
}

import ComingSoonPage from '@/components/ComingSoonPage';

export default function DocumentsPage() {
    return (
        <ComingSoonPage
            icon="📄"
            title="Document Hub"
            description="Centralized document management with e-signature, version control, and client-facing portals."
            features={[
                { icon: '✍️', title: 'E-Signatures', desc: 'Send contracts and proposals for digital signing' },
                { icon: '📁', title: 'Version Control', desc: 'Track revisions and changes across all documents' },
                { icon: '🔗', title: 'Document Links', desc: 'Share documents with contacts and track view analytics' },
                { icon: '📊', title: 'Proposal Builder', desc: 'Professional quotes and proposals with product catalog' },
            ]}
        />
    );
}

import PageLoader from '@/components/PageLoader';

export default function Home() {
    // Middleware handles the actual redirect server-side before this renders.
    // This is a minimal client fallback while middleware is active.
    return <PageLoader label="Redirecting..." fullScreen />;
}

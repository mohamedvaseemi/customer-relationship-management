// Per-route metadata layout for /login
// noindex — auth pages should never appear in search results

export const metadata = {
    title: 'Sign In',
    description: 'Sign in to ModernCRM and access your AI-powered sales intelligence dashboard.',
    robots: { index: false, follow: false },
};

export default function LoginLayout({ children }) {
    return children;
}

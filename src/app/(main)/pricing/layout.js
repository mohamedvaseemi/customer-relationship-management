// Per-route metadata layout for /pricing
// This server component wraps the 'use client' PricingPage and provides metadata

export const metadata = {
    title: 'Plans & Pricing',
    description: 'Choose the ModernCRM plan that fits your team. Starter at $29/mo, Professional at $79/mo with unlimited leads and AI forecasting, or Enterprise at $199/mo with SSO and white-label reporting.',
    robots: { index: true, follow: true },
    openGraph: {
        title: 'ModernCRM Plans & Pricing — Scale Your Sales Intelligence',
        description: 'Three strategic tiers designed to grow with your business. From solo founders to global enterprise teams.',
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ModernCRM Pricing Plans' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ModernCRM Pricing — Unlimited Sales Intelligence',
        description: 'From $29/mo. Unlimited leads, AI forecasting, and enterprise-grade security.',
    },
};

export default function PricingLayout({ children }) {
    return children;
}

// Metadata for the Login page (server-side, no 'use client' needed here)
// This file is intentionally separate so Next.js can export metadata statically

export const metadata = {
  title: 'Sign In – ModernCRM',
  description: 'Sign in to ModernCRM and access your AI-powered sales intelligence platform. Track leads, close deals, and automate your CRM workflows.',
  robots: { index: false, follow: false }, // Private app – don't index auth pages
  openGraph: {
    title: 'Sign In – ModernCRM',
    description: 'Access your sales intelligence platform.',
    type: 'website',
  },
};

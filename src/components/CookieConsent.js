"use client";
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = Cookies.get('cookieConsent');
        if (!consent) {
            // Slight delay so it doesn't flash on first paint
            const t = setTimeout(() => setIsVisible(true), 800);
            return () => clearTimeout(t);
        }
    }, []);

    const handleAccept = () => {
        Cookies.set('cookieConsent', 'true', { expires: 365 });
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            aria-live="polite"
            style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(600px, calc(100vw - 32px))',
                background: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#e2e8f0',
                padding: '16px 20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                zIndex: 9999,
                border: '1px solid rgba(99, 102, 241, 0.25)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                fontFamily: 'var(--font-sans, sans-serif)',
                animation: 'cookieSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
        >
            <div style={{ fontSize: '13px', lineHeight: '1.6', flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>🍪 Cookie Notice</span>
                &nbsp;&mdash;&nbsp;We use essential cookies for authentication and to remember your preferences. No tracking or advertising cookies are used.
            </div>
            <button
                onClick={handleAccept}
                id="cookie-accept-btn"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
                Got it
            </button>
            <style>{`
                @keyframes cookieSlideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
}

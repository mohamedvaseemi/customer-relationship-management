/**
 * Global branded page loader - Kibon spinner used across all loading states
 * Usage: <PageLoader label="Loading..." fullScreen />
 */
export default function PageLoader({ label = 'Loading...', fullScreen = false }) {
    const containerStyle = fullScreen
        ? {
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            zIndex: 9998,
            overflow: 'hidden',
        }
        : {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            flexDirection: 'column',
            gap: '1.5rem',
        };

    return (
        <div style={containerStyle} role="status" aria-label={label}>
            {/* Ambient glow */}
            <div style={{
                position: 'absolute',
                width: '320px',
                height: '320px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
            }} aria-hidden="true" />

            <div style={{ textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                {/* Logo */}
                <div style={{ position: 'relative', width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Inner logo box */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
                        padding: '16px'
                    }}>
                        <img src="/favicon.gif" alt="Kibon" style={{width: 40, height: 40, borderRadius: 6, animation: 'crm-pulse 2s ease-in-out infinite'}} />
                    </div>
                </div>

                {/* Brand name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                        fontSize: '18px', fontWeight: 700, letterSpacing: '0.02em',
                        background: 'linear-gradient(to right, #f8fafc, #c7d2fe)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Kibon
                    </span>
                    <span style={{
                        fontSize: '12px', color: '#64748b', fontWeight: 400,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                        {label}
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes crm-spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes crm-pulse {
                    0%, 100% { opacity: 0.6; transform: scale(0.95); }
                    50%       { opacity: 1;   transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
}

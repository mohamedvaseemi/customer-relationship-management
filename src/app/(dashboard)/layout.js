"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
                color: '#f8fafc',
                fontFamily: 'var(--font-outfit), sans-serif',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Glowing background circles for depth */}
                <div style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                }}></div>
                
                <div style={{ textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Logo wrapper with premium loading indicator */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px' }}>
                        {/* Shimmering pulse outer ring */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            borderRadius: '24px',
                            border: '2px solid rgba(59, 130, 246, 0.2)',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
                        }}></div>
                        
                        {/* Spinning gradient ring */}
                        <div style={{
                            position: 'absolute',
                            top: '-3px', left: '-3px', right: '-3px', bottom: '-3px',
                            borderRadius: '26px',
                            border: '3px solid transparent',
                            borderTopColor: '#3b82f6',
                            borderRightColor: '#8b5cf6',
                            animation: 'spin 1.4s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite'
                        }}></div>

                        {/* Inner Logo Icon */}
                        <div style={{
                            position: 'absolute',
                            top: '12px', left: '12px', right: '12px', bottom: '12px',
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                        }}>
                            {/* Grid logo element */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>
                    </div>

                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes pulse {
                            0%, 100% { opacity: 0.6; transform: scale(0.95); }
                            50% { opacity: 1; transform: scale(1.05); }
                        }
                    `}</style>
                    
                    <div style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        letterSpacing: '0.025em',
                        background: 'linear-gradient(to right, #f8fafc, #cbd5e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px'
                    }}>
                        ModernCRM
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: '#64748b',
                        fontWeight: 400,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        Initializing Workspace
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <Layout>{children}</Layout>;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Loader';
import { motion } from 'framer-motion';

export default function Home() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [showRetry, setShowRetry] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated && user) {
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
        
        const timer = setTimeout(() => setShowRetry(true), 4000);
        return () => clearTimeout(timer);
    }, [user, loading, isAuthenticated, router]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Loader isLoading={true} />
            {showRetry && !loading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ position: 'absolute', bottom: '20%', textAlign: 'center', zIndex: 1000 }}
                >
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Taking a bit longer than usual?</p>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => user ? router.push('/dashboard') : router.push('/login')}
                    >
                        Enter ModernCRM Manually
                    </button>
                </motion.div>
            )}
        </div>
    );
}

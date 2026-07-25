"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <PageLoader label="Initializing Workspace" fullScreen />;
    }

    if (!user) {
        return null;
    }

    return <Layout>{children}</Layout>;
}

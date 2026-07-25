import DashboardClient from '@/components/DashboardClient';

// Next.js 16 instant client-side navigations is removed because layout.js auth guard blocks static shell rendering

export const metadata = {
    title: 'Dashboard | Kibon',
    description: 'Overview of your sales pipeline, deals, activities, and team performance.',
};

export default function DashboardPage() {
    return <DashboardClient />;
}

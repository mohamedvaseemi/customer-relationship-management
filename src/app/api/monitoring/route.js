import { NextResponse } from 'next/server';

// Mock database for monitored apps
let monitoredApps = [
    {
        id: '1',
        name: 'CRM Frontend',
        type: 'frontend',
        url: 'https://crm-frontend.example.com',
        lighthouse: { performance: 95, accessibility: 98, bestPractices: 100, seo: 92 },
        lastChecked: new Date().toISOString()
    },
    {
        id: '2',
        name: 'CRM Backend API',
        type: 'backend',
        url: 'https://api.example.com',
        responseTimes: {
            '/api/users': '45ms',
            '/api/leads': '120ms',
            '/api/contacts': '85ms',
            '/api/deals': '60ms'
        },
        avgResponseTime: '77ms',
        lastChecked: new Date().toISOString()
    }
];

export async function GET(request) {
    // In a real app, verify authentication/authorization here
    return NextResponse.json({ apps: monitoredApps });
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, type, url } = body;

        if (!name || !type || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newApp = {
            id: Date.now().toString(),
            name,
            type,
            url,
            lastChecked: new Date().toISOString(),
        };

        if (type === 'frontend') {
            // Generate mock Lighthouse scores
            newApp.lighthouse = {
                performance:    Math.floor(Math.random() * (100 - 72) + 72),
                accessibility:  Math.floor(Math.random() * (100 - 80) + 80),
                bestPractices:  Math.floor(Math.random() * (100 - 85) + 85),
                seo:            Math.floor(Math.random() * (100 - 80) + 80),
            };
        } else if (type === 'backend') {
            // Generate realistic mock response times
            const endpoints = {
                '/api/health':   `${Math.floor(Math.random() * 40)  + 8}ms`,
                '/api/auth':     `${Math.floor(Math.random() * 80)  + 20}ms`,
                '/api/data':     `${Math.floor(Math.random() * 200) + 60}ms`,
                '/api/search':   `${Math.floor(Math.random() * 150) + 40}ms`,
            };
            newApp.responseTimes = endpoints;
            const times = Object.values(endpoints).map(t => parseInt(t));
            const avg   = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            newApp.avgResponseTime = `${avg}ms`;

        }

        monitoredApps.push(newApp);

        return NextResponse.json({ app: newApp }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add app' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        monitoredApps = monitoredApps.filter(app => app.id !== id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
    }
}

import { testConnection } from '@/lib/db';

export async function GET() {
    const isConnected = await testConnection();
    
    return Response.json({ 
        status: isConnected ? 'ok' : 'error', 
        message: 'ModernCRM API is running',
        database: isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
}

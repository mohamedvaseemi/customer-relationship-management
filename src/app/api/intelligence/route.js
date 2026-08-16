import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lead_id, tone, action_type } = await req.json();

        // 1. Fetch Lead & Contact context from DB
        const leadRes = await pool.query(
            `SELECT l.*, c.first_name, c.last_name, c.email, c.company 
             FROM leads l
             LEFT JOIN contacts c ON l.contact_id = c.id
             WHERE l.id = $1`,
            [lead_id]
        );

        if (leadRes.rows.length === 0) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        const lead = leadRes.rows[0];
        const customerName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.title;
        const companyName = lead.company || 'Target Company';
        const agentName = decoded.name || 'Sales Representative';
        const requestedTone = tone || 'professional';

        const groqApiKey = process.env.GROQ_API_KEY;

        // 2. If Groq API Key exists, call 100% Free Llama 3.1 Model
        if (groqApiKey) {
            const systemPrompt = `You are an expert B2B AI Sales Assistant for a modern CRM. Generate a personalized pitch email for a sales lead. Output MUST follow this tone: ${requestedTone}. Be concise, persuasive, and professional.`;
            const userPrompt = `Lead Name: ${customerName}\nCompany: ${companyName}\nDeal Value: $${lead.value}\nLead Status: ${lead.status}\nAgent Name: ${agentName}\n\nDraft a concise outreach email with a clear subject line.`;

            const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                })
            });

            if (aiRes.ok) {
                const aiData = await aiRes.json();
                const generatedPitch = aiData.choices[0]?.message?.content;
                return NextResponse.json({
                    pitch: generatedPitch,
                    score: lead.probability || 85,
                    lead_id
                });
            }
        }

        // 3. Fallback (If Groq API Key is not set yet)
        const fallbackPitch = `Subject: Strategic Growth & Partnership for ${companyName}\n\nDear ${customerName},\n\nI hope this email finds you well.\n\nI noticed your team at ${companyName} is expanding its sales operations. With an estimated opportunity value of $${lead.value}, our platform can help streamline your sales pipelines and accelerate deal closure.\n\nWould you be open to a 10-minute brief discovery call this week?\n\nBest regards,\n${agentName}`;

        return NextResponse.json({
            pitch: fallbackPitch,
            score: lead.probability || 75,
            lead_id
        });

    } catch (error) {
        console.error('Intelligence AI Error:', error);
        return NextResponse.json({ error: 'Server error generating pitch' }, { status: 500 });
    }
}
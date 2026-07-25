import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields (name, email, subject, message) are required.' },
                { status: 400 }
            );
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        let contactId = null;
        let dbConnected = false;

        try {
            // Check if contact already exists by email
            const contactCheck = await pool.query(
                'SELECT id FROM contacts WHERE email = $1 AND is_deleted = 0 LIMIT 1',
                [email]
            );

            if (contactCheck.rows && contactCheck.rows.length > 0) {
                contactId = contactCheck.rows[0].id;
            } else {
                // Optionally create contact or leave null. Let's create one.
                const names = name.split(' ');
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || 'Contact Form';
                const newContact = await pool.query(
                    `INSERT INTO contacts (first_name, last_name, email, source, status, notes)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [firstName, lastName, email, 'website', 'active', `Created from contact page form. Name: ${name}`]
                );
                if (newContact.rows && newContact.rows.length > 0) {
                    contactId = newContact.rows[0].id;
                }
            }

            // Create a ticket for the CRM
            await pool.query(
                `INSERT INTO tickets (subject, description, priority, contact_id, status)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    `Contact Form: ${subject}`,
                    `Message from ${name} (${email}):\n\n${message}`,
                    'medium',
                    contactId,
                    'open'
                ]
            );
            dbConnected = true;
        } catch (dbErr) {
            console.warn('⚠️ Database operations failed or offline. Logging submission only:', dbErr.message);
        }

        // Always log to standard console for audit/backup
        console.log('📬 NEW CONTACT FORM SUBMISSION:');
        console.log(`- Name: ${name}`);
        console.log(`- Email: ${email}`);
        console.log(`- Subject: ${subject}`);
        console.log(`- Message: ${message}`);
        console.log(`- Saved to DB: ${dbConnected ? 'Yes' : 'No (Offline Mock Mode)'}`);

        return NextResponse.json(
            { 
                success: true, 
                message: 'Your message has been received! We will get back to you shortly.',
                savedToDb: dbConnected
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Contact submission error:', error);
        return NextResponse.json(
            { error: 'An unexpected server error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}

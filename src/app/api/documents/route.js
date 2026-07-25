import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all documents
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const type = searchParams.get('type');

        let queryStr = `
            SELECT d.*, u.name as uploaded_by_name
            FROM documents d
            LEFT JOIN users u ON d.created_by = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        // Optional: Filter by document type if needed
        if (type) {
            queryStr += ` AND d.type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }

        queryStr += ' ORDER BY d.created_at DESC';

        const documents = await pool.query(queryStr, params);
        
        // Format the date to match your frontend requirement before sending
        const formattedDocs = documents.rows.map(doc => ({
            ...doc,
            date: new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));

        return NextResponse.json({ documents: formattedDocs });
    } catch (error) {
        console.error('Get documents error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create/upload document
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        // Extract the file from FormData
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Extract metadata directly from the file object
        const name = file.name;
        const size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        const type = name.split('.').pop().toLowerCase();

        // ------------------------------------------------------------------
        // NOTE: Add your file storage logic here (e.g., AWS S3, Vercel Blob)
        // const buffer = Buffer.from(await file.arrayBuffer());
        // const fileUrl = await uploadToStorageBucket(buffer, name);
        // ------------------------------------------------------------------
        
        const fileUrl = `/uploads/${name}`; // Temporary placeholder URL

        // Insert document metadata into PostgreSQL
        const result = await pool.query(
            `INSERT INTO documents (name, size, type, file_url, created_by)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, size, type, fileUrl, decoded.id]
        );

        // Format the returned document to match your React state expectations
        const newDoc = {
            ...result.rows[0],
            date: new Date(result.rows[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        return NextResponse.json({ 
            message: 'Document uploaded successfully', 
            document: newDoc 
        }, { status: 201 });

    } catch (error) {
        console.error('Upload document error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
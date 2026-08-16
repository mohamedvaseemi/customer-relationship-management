import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        // Safe query without company_id
        const result = await pool.query(
            `SELECT d.*, u.name as uploader_name 
             FROM documents d
             LEFT JOIN users u ON d.created_by = u.id
             ORDER BY d.created_at DESC`
        );

        return NextResponse.json({ documents: result.rows });
    } catch (error) {
        console.error('Get docs error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const formData = await req.formData();
        const name = formData.get('name');
        const type = formData.get('type') || 'document';
        const fileUrl = formData.get('file_url'); 
        const file = formData.get('file'); 

        if (!name) return NextResponse.json({ error: 'Document name is required' }, { status: 400 });

        let finalUrl = fileUrl || '';
        let sizeBytes = 0;

        if (file && file instanceof Blob) {
            sizeBytes = file.size;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const fileBase64 = `data:${file.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`;

            const uploadRes = await cloudinary.uploader.upload(fileBase64, {
                resource_type: 'auto',
                folder: 'crm_documents'
            });

            finalUrl = uploadRes.secure_url;
        } else if (!fileUrl) {
            return NextResponse.json({ error: 'Please provide either a file or a URL' }, { status: 400 });
        }

        // Safe insert without company_id
        const result = await pool.query(
            `INSERT INTO documents (name, file_url, type, size_bytes, created_by) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, finalUrl, type, sizeBytes, decoded.id]
        );

        return NextResponse.json({ message: 'Document uploaded successfully', document: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Upload document error:', error);
        return NextResponse.json({ error: 'Server error or Cloudinary configuration missing' }, { status: 500 });
    }
}
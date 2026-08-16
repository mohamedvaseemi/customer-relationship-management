import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;

        const docRes = await pool.query('SELECT file_url FROM documents WHERE id = $1', [id]);
        
        if (docRes.rows.length === 0) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const fileUrl = docRes.rows[0].file_url;

        // Safe delete without company_id
        await pool.query('DELETE FROM documents WHERE id = $1', [id]);

        // Clean up Cloudinary storage
        if (fileUrl && fileUrl.includes('cloudinary.com')) {
            try {
                const urlParts = fileUrl.split('/');
                const filenameWithExt = urlParts[urlParts.length - 1];
                const folderName = urlParts[urlParts.length - 2];
                const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;

                await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            } catch (cloudErr) {
                console.error('Failed to delete from Cloudinary:', cloudErr);
            }
        }

        return NextResponse.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete doc error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
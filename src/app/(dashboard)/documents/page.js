"use client";
import React from 'react';
import { FiFileText, FiUploadCloud, FiFolder, FiMoreVertical, FiDownload } from 'react-icons/fi';

const mockDocs = [
    { id: 1, name: 'Enterprise License Agreement.pdf', size: '2.4 MB', date: 'Oct 24, 2026', type: 'pdf' },
    { id: 2, name: 'Q3 Marketing Assets.zip', size: '15.8 MB', date: 'Oct 22, 2026', type: 'zip' },
    { id: 3, name: 'TechFlow Proposal Draft.docx', size: '1.1 MB', date: 'Oct 20, 2026', type: 'word' },
];

export default function Documents() {
    return (
        <div className="page-container" style={{ padding: '0' }}>
            <div className="page-header flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Document Library</h1>
                    <p className="text-muted">Securely manage your files, proposals, and contracts.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary"><FiFolder /> New Folder</button>
                    <button className="btn btn-primary"><FiUploadCloud /> Upload File</button>
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card flex items-center gap-4 p-4">
                    <div className="gradient-primary text-white p-4" style={{ borderRadius: '12px' }}>
                        <FiFolder size={24} />
                    </div>
                    <div>
                        <div className="text-muted">Shared with me</div>
                        <div className="font-bold text-lg">12 Folders</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4 p-4">
                    <div className="gradient-primary text-white p-4" style={{ borderRadius: '12px', background: 'var(--success)' }}>
                        <FiFileText size={24} />
                    </div>
                    <div>
                        <div className="text-muted">Recent Files</div>
                        <div className="font-bold text-lg">48 Files</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold">All Documents</h3>
                </div>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Name</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Size</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Last Modified</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockDocs.map(doc => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiFileText style={{ color: 'var(--primary-color)' }} />
                                        <span className="font-medium">{doc.name}</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{doc.size}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{doc.date}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="btn-icon" title="Download"><FiDownload /></button>
                                        <button className="btn-icon" title="Options"><FiMoreVertical /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

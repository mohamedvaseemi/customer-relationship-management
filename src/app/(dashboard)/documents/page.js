"use client";
import React, { useState, useRef } from 'react';
import {
    FiFileText, FiUploadCloud, FiFolder, FiMoreVertical,
    FiDownload, FiX, FiCheckCircle, FiTrash2
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { documentsAPI } from '@/api/api';

const initialMockDocs = [
    { id: 1, name: 'Enterprise License Agreement.pdf', size: '2.4 MB', date: 'Oct 24, 2026', type: 'pdf' },
    { id: 2, name: 'Q3 Marketing Assets.zip', size: '15.8 MB', date: 'Oct 22, 2026', type: 'zip' },
    { id: 3, name: 'TechFlow Proposal Draft.docx', size: '1.1 MB', date: 'Oct 20, 2026', type: 'word' },
];

export default function Documents() {
    const { sampleDataEnabled } = useAuth();

    // Core State
    const [documents, setDocuments] = useState(sampleDataEnabled ? initialMockDocs : []);

    // Upload Modal & Drag-Drop State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef(null);

    // --- File Handling Logic --- //
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        setUploadingFile(file);
        setUploadProgress(0);

        // Simulate API Upload Progress
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    finalizeUpload(file);
                    return 100;
                }
                return prev + 15; // Speed of fake upload
            });
        }, 300);
    };

    const finalizeUpload = async (file) => {
        try {
            // 1. Prepare the file data for upload
            const formData = new FormData();
            formData.append('file', file);

            // You can append extra metadata if your API requires it
            // formData.append('fileName', file.name);

            // 2. Make the API call
            const response = await documentsAPI.upload(formData);

            // 3. Extract the newly created document from your backend response
            // (Adjust 'response.data.document' based on your actual JSON response structure)
            const newDoc = response.data.document;

            // 4. Update the UI state with the real data
            setDocuments(prev => [newDoc, ...prev]);

        } catch (error) {
            console.error('Error uploading document:', error);
            // Optional: Add a toast notification here to tell the user the upload failed
        } finally {
            // 5. Clean up the UI states whether the upload succeeded or failed
            setUploadingFile(null);
            setIsUploadModalOpen(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = (id) => {
        // TODO: Call your Next.js DELETE API here
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    return (
        <div className="page-container" style={{ padding: '0', position: 'relative' }}>
            {/* Header Section */}
            <div className="page-header flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Document Library</h1>
                    <p className="text-muted">Securely manage your files, proposals, and contracts.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary">
                        <FiFolder /> New Folder
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
                        <FiUploadCloud /> Upload File
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card flex items-center gap-4 p-4">
                    <div className="gradient-primary text-white p-4" style={{ borderRadius: '12px' }}>
                        <FiFolder size={24} />
                    </div>
                    <div>
                        <div className="text-muted">Shared with me</div>
                        <div className="font-bold text-lg">{sampleDataEnabled ? '12' : '0'} Folders</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4 p-4">
                    <div className="gradient-primary text-white p-4" style={{ borderRadius: '12px', background: 'var(--success, #10b981)' }}>
                        <FiFileText size={24} />
                    </div>
                    <div>
                        <div className="text-muted">Total Files</div>
                        <div className="font-bold text-lg">{documents.length} Files</div>
                    </div>
                </div>
            </div>

            {/* Documents Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold">All Documents</h3>
                </div>

                {documents.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <FiFileText size={32} className="text-gray-400" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">No documents yet</h4>
                        <p className="text-muted mb-4 max-w-md">Upload your first document to start managing your files in the CRM.</p>
                        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
                            <FiUploadCloud /> Upload First File
                        </button>
                    </div>
                ) : (
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
                                {documents.map(doc => (
                                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FiFileText style={{ color: 'var(--primary-color)' }} />
                                            <span className="font-medium">{doc.name}</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{doc.size}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{doc.date}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button className="btn-icon mr-2" title="Download"><FiDownload /></button>
                                            <button className="btn-icon text-red-500 hover:text-red-700" title="Delete" onClick={() => handleDelete(doc.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Upload Modal Overlay */}
            {isUploadModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
                        <button
                            onClick={() => setIsUploadModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <FiX size={24} className="text-muted hover:text-gray-800" />
                        </button>

                        <h2 className="text-xl font-bold mb-2">Upload Document</h2>
                        <p className="text-muted mb-6">Upload files to your CRM storage.</p>

                        {!uploadingFile ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    borderRadius: '12px', padding: '40px 20px', textAlign: 'center',
                                    cursor: 'pointer', backgroundColor: isDragging ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', marginBottom: '16px' }}>
                                    <FiUploadCloud size={28} />
                                </div>
                                <h3 className="font-bold mb-1">Click or drag file to this area to upload</h3>
                                <p className="text-sm text-muted">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.</p>
                            </div>
                        ) : (
                            <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                                            <FiFileText style={{ color: 'var(--primary-color)' }} size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                                                {uploadingFile.name}
                                            </p>
                                            <p className="text-xs text-muted">{(uploadingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    {uploadProgress === 100 ? <FiCheckCircle color="var(--success, #10b981)" size={24} /> : null}
                                </div>

                                {/* Progress Bar */}
                                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${uploadProgress}%`,
                                        backgroundColor: 'var(--primary-color)',
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-muted">
                                    <span>{uploadProgress < 100 ? 'Uploading...' : 'Complete'}</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
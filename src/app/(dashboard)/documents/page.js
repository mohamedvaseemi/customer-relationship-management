"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
    FiUploadCloud, FiSearch, FiTrash2, FiDownload, 
    FiFileText, FiImage, FiFile, FiLink, FiX, FiCheckCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/ConfirmModal';
import '@/styles/Documents.css';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // UI Modals & Upload State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    const [submitting, setSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    
    // Custom Confirm Modal
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, idToDelete: null });

    // Form Data
    const [name, setName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/documents', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setDocuments(data.documents || []);
        } catch (err) {
            console.error('Failed to load documents:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

    const filteredDocs = useMemo(() => {
        return documents.filter(doc => (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [documents, searchQuery]);

    // Drag & Drop Handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelection = (file) => {
        setSelectedFile(file);
        if (!name) setName(file.name.split('.')[0]); // Auto-fill name
    };

    // Upload Logic
    const handleUpload = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const token = Cookies.get('token');
            const formData = new FormData();
            formData.append('name', name);
            
            if (uploadMethod === 'file') {
                if (!selectedFile) return alert("Please select a file.");
                formData.append('file', selectedFile);
                formData.append('type', selectedFile.type || 'document');
            } else {
                if (!fileUrl) return alert("Please provide a URL.");
                formData.append('file_url', fileUrl);
                formData.append('type', 'link');
            }

            await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            setIsUploadModalOpen(false);
            resetForm();
            fetchDocuments();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setFileUrl('');
        setSelectedFile(null);
        setUploadMethod('file');
    };

    // Delete Logic
    const promptDelete = (id) => setConfirmDialog({ isOpen: true, idToDelete: id });
    const executeDelete = async () => {
        const id = confirmDialog.idToDelete;
        try {
            setDocuments(prev => prev.filter(d => d.id !== id));
            const token = Cookies.get('token');
            await fetch(`/api/documents/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        } catch (err) {
            console.error('Delete failed:', err);
            fetchDocuments();
        }
    };

    const getFileIcon = (type) => {
        if (!type) return <FiFile className="icon-blue" />;
        if (type.includes('pdf')) return <FiFileText className="icon-red" />;
        if (type.includes('image') || type.includes('png') || type.includes('jpg')) return <FiImage className="icon-green" />;
        if (type === 'link') return <FiLink className="icon-purple" />;
        return <FiFile className="icon-blue" />;
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return 'External Link';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="documents-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">File Repository</h1>
                    <p className="page-subtitle">Securely store and share contracts, assets, and links</p>
                </div>
                <button className="btn btn-primary premium-shadow" onClick={() => setIsUploadModalOpen(true)}>
                    <FiUploadCloud /> Upload New File
                </button>
            </div>

            <div className="filters-section card glass-effect">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Document Grid - Premium UI */}
            <div className="docs-grid">
                {filteredDocs.map(doc => (
                    <div key={doc.id} className="doc-card">
                        <div className="doc-card-inner">
                            <div className="doc-icon-wrapper">
                                {getFileIcon(doc.type)}
                            </div>
                            <div className="doc-info">
                                <h4 className="doc-name" title={doc.name}>{doc.name}</h4>
                                <span className="doc-meta">
                                    {formatBytes(doc.size_bytes)} • By {doc.uploader_name || 'System'}
                                </span>
                            </div>
                        </div>
                        <div className="doc-hover-actions">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="action-btn-circle view" title="View/Download">
                                <FiDownload />
                            </a>
                            <button className="action-btn-circle delete" onClick={() => promptDelete(doc.id)} title="Delete">
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredDocs.length === 0 && !loading && (
                    <div className="empty-state-box">
                        <div className="empty-icon-pulse"><FiUploadCloud size={40} /></div>
                        <h3>No documents found</h3>
                        <p>Upload PDFs, images, or link external resources.</p>
                        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>Upload Now</button>
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={confirmDialog.isOpen}
                title="Delete Document?"
                message="This will permanently remove the file from your repository. This action cannot be undone."
                onConfirm={executeDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, idToDelete: null })}
                confirmText="Yes, delete it"
            />

            {/* AWESOME UPLOAD MODAL */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => { setIsUploadModalOpen(false); resetForm(); }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="ai-modal-box upload-modal" onClick={e => e.stopPropagation()}>
                            
                            <div className="ai-modal-header">
                                <h3><FiUploadCloud className="text-primary" /> Upload Resource</h3>
                                <button className="ai-modal-close" onClick={() => { setIsUploadModalOpen(false); resetForm(); }}><FiX /></button>
                            </div>

                            <div className="upload-method-toggle">
                                <button className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`} onClick={() => setUploadMethod('file')}>
                                    <FiFileText /> Upload File
                                </button>
                                <button className={`method-btn ${uploadMethod === 'url' ? 'active' : ''}`} onClick={() => setUploadMethod('url')}>
                                    <FiLink /> External URL
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="auth-form" style={{ paddingTop: '0.5rem' }}>
                                
                                {uploadMethod === 'file' ? (
                                    <div 
                                        className={`dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
                                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) handleFileSelection(e.target.files[0]); }} />
                                        
                                        {selectedFile ? (
                                            <div className="selected-file-info">
                                                <FiCheckCircle size={32} color="#10b981" />
                                                <p className="file-name">{selectedFile.name}</p>
                                                <p className="file-size">{formatBytes(selectedFile.size)}</p>
                                                <span className="change-file">Click to change file</span>
                                            </div>
                                        ) : (
                                            <div className="drop-prompt">
                                                <FiUploadCloud size={40} className="drop-icon" />
                                                <p><strong>Click to upload</strong> or drag and drop</p>
                                                <p className="hint">PDF, DOC, PNG, JPG up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="input-field">
                                        <label>External URL *</label>
                                        <input type="url" className="input-styled" required placeholder="https://drive.google.com/..." value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
                                    </div>
                                )}

                                <div className="input-field" style={{ marginTop: '0.5rem' }}>
                                    <label>Document Name *</label>
                                    <input type="text" className="input-styled" required placeholder="Name this document" value={name} onChange={e => setName(e.target.value)} />
                                </div>

                                <div className="ai-modal-footer" style={{ marginTop: '1rem', padding: '1.25rem 0 0 0', border: 'none', background: 'transparent' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => { setIsUploadModalOpen(false); resetForm(); }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary premium-shadow" disabled={submitting || (uploadMethod === 'file' && !selectedFile)}>
                                        {submitting ? 'Uploading to Cloud...' : 'Confirm Upload'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
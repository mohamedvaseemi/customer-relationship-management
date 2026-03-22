'use client';

import { useState } from 'react';
import { FiBriefcase, FiGlobe, FiMapPin, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../settings.css';

export default function CompanySettings() {
    const [formData, setFormData] = useState({
        name: 'ModernCRM HQ',
        industry: 'Software & Technology',
        website: 'https://moderncrm.com',
        phone: '+1 (555) 123-4567',
        email: 'ops@moderncrm.com',
        address: '123 Innovation Drive, Suite 500',
        city: 'Silicon Valley',
        state: 'CA',
        country: 'USA'
    });
    const [saved, setSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <div>
                    <h1 className="page-title">Organizational Profile</h1>
                    <p className="page-subtitle">Configure your official company identity used across the platform ecosystem.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {saved && <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FiCheckCircle /> Strategic update committed</span>}
                    <button className="btn btn-primary" onClick={handleSave}>Commit Configuration</button>
                </div>
            </header>

            <div className="card shadow-soft" style={{ maxWidth: '800px', margin: '2rem 0', padding: '2.5rem' }}>
                <form className="form-grid">
                    <div className="input-field" style={{ gridColumn: 'span 2' }}>
                        <label>Legal Entity Name</label>
                        <input type="text" className="input-alt" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="input-field">
                        <label>Strategic Industry</label>
                        <input type="text" className="input-alt" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                    </div>
                    <div className="input-field">
                        <label>Corporate Portal (Website)</label>
                        <input type="url" className="input-alt" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                    <div className="input-field" style={{ gridColumn: 'span 2' }}>
                        <label>Global Operations Hub (Address)</label>
                        <input type="text" className="input-alt" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="input-field">
                        <label>Operational City</label>
                        <input type="text" className="input-alt" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="input-field">
                        <label>State/Province</label>
                        <input type="text" className="input-alt" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                    <div className="input-field">
                        <label>Country</label>
                        <input type="text" className="input-alt" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                    </div>
                    <div className="input-field">
                        <label>Corporate Contact (Phone)</label>
                        <input type="tel" className="input-alt" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </form>
            </div>
        </div>
    );
}

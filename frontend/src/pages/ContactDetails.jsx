import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contactsAPI, leadsAPI, activitiesAPI } from '../api/api';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, FiBriefcase, FiDollarSign, FiClock, FiPlus } from 'react-icons/fi';
import './Contacts.css'; // Reusing styles

const ContactDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [leads, setLeads] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [contactRes, leadsRes, activitiesRes] = await Promise.all([
                contactsAPI.getById(id),
                leadsAPI.getAll({ contact_id: id }),
                activitiesAPI.getAll({ contact_id: id })
            ]);

            setContact(contactRes.data.contact);
            setLeads(leadsRes.data.leads || []); // Fallback if no leads
            setActivities(activitiesRes.data.activities || []);
        } catch (error) {
            console.error('Failed to load contact details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!contact) return <div className="p-8 text-center">Contact not found</div>;

    return (
        <div className="contact-details-page">
            <button className="btn btn-secondary mb-4" onClick={() => navigate('/contacts')}>
                <FiArrowLeft /> Back to Contacts
            </button>

            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Sidebar Info */}
                <div className="contact-sidebar card">
                    <div className="text-center mb-6">
                        <div className="contact-avatar-large gradient-primary mx-auto mb-4" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white' }}>
                            {contact.first_name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold">{contact.first_name} {contact.last_name}</h2>
                        <p className="text-muted">{contact.position}</p>
                        <p className="text-primary">{contact.company}</p>
                    </div>

                    <div className="grid gap-4">
                        <div className="info-item flex items-center gap-3">
                            <FiMail className="text-muted" />
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                        </div>
                        <div className="info-item flex items-center gap-3">
                            <FiPhone className="text-muted" />
                            <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
                        </div>
                        <div className="info-item flex items-center gap-3">
                            <FiMapPin className="text-muted" />
                            <span>{contact.city}, {contact.country}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="contact-main">
                    <div className="tabs mb-6 flex gap-4 border-b border-gray-700">
                        {['overview', 'leads', 'activities'].map(tab => (
                            <button
                                key={tab}
                                className={`pb-2 px-4 ${activeTab === tab ? 'border-b-2 border-primary-500 text-primary-500 font-bold' : 'text-muted'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4">About</h3>
                            <p className="text-secondary">{contact.notes || 'No notes available.'}</p>

                            <h3 className="text-lg font-bold mt-6 mb-4">Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-muted text-sm">Source</label>
                                    <p>{contact.source}</p>
                                </div>
                                <div>
                                    <label className="text-muted text-sm">Owner</label>
                                    <p>{contact.assigned_to_name || 'Unassigned'}</p>
                                </div>
                                <div>
                                    <label className="text-muted text-sm">Created</label>
                                    <p>{new Date(contact.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'leads' && (
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Related Leads</h3>
                                <button className="btn btn-sm btn-primary"><FiPlus /> Add Lead</button>
                            </div>
                            {leads.length > 0 ? (
                                <div className="space-y-4">
                                    {leads.map(lead => (
                                        <div key={lead.id} className="border border-gray-700 p-4 rounded-lg flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold">{lead.title}</h4>
                                                <div className="text-sm text-muted">Value: ${lead.value} | Status: {lead.status}</div>
                                            </div>
                                            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/leads')}>View</button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted">No leads associated with this contact.</p>}
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Activity History</h3>
                                <button className="btn btn-sm btn-primary"><FiPlus /> Add Activity</button>
                            </div>
                            {activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map(activity => (
                                        <div key={activity.id} className="border border-gray-700 p-4 rounded-lg">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold capitalize">{activity.type}: {activity.subject}</h4>
                                                <span className="text-xs text-muted">{new Date(activity.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-secondary mt-1">{activity.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted">No activity history.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactDetails;

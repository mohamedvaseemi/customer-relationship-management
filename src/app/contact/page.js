"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
    FiArrowLeft, 
    FiMail, 
    FiPhone, 
    FiMapPin, 
    FiMessageSquare, 
    FiUser, 
    FiCheckCircle, 
    FiAlertCircle,
    FiClock,
    FiSend
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import '@/styles/Contact.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: null
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (status.error) {
            setStatus(prev => ({ ...prev, error: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong. Please try again.');
            }

            setStatus({
                loading: false,
                success: true,
                error: null
            });
            // Clear form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (err) {
            setStatus({
                loading: false,
                success: false,
                error: err.message
            });
        }
    };

    return (
        <div className="contact-page-wrapper">
            <div className="contact-container">
                <Link href="/login" className="contact-back-link">
                    <FiArrowLeft /> Back to Login
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                    className="contact-card"
                >
                    <div className="contact-header">
                        <h1 className="contact-title">Get in Touch</h1>
                        <p className="contact-subtitle">
                            Have questions about Kibon? Want to see a custom demo or talk to our sales and support engineering team? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="contact-grid">
                        {/* Form Section */}
                        <div className="contact-form-section">
                            {status.success && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="alert-box success"
                                >
                                    <FiCheckCircle className="alert-icon" />
                                    <div>
                                        <strong>Message Sent Successfully!</strong>
                                        <p style={{ margin: '4px 0 0 0' }}>Thank you for reaching out. A Kibon team member will contact you shortly.</p>
                                    </div>
                                </motion.div>
                            )}

                            {status.error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="alert-box error"
                                >
                                    <FiAlertCircle className="alert-icon" />
                                    <div>
                                        <strong>Submission Failed</strong>
                                        <p style={{ margin: '4px 0 0 0' }}>{status.error}</p>
                                    </div>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group-row">
                                    <div className="contact-input-group">
                                        <label htmlFor="name">Full Name</label>
                                        <div className="contact-input-wrapper">
                                            <FiUser />
                                            <input 
                                                type="text" 
                                                id="name"
                                                name="name" 
                                                required 
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="contact-input"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="contact-input-group">
                                        <label htmlFor="email">Email Address</label>
                                        <div className="contact-input-wrapper">
                                            <FiMail />
                                            <input 
                                                type="email" 
                                                id="email"
                                                name="email" 
                                                required 
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="contact-input"
                                                placeholder="johndoe@company.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-input-group">
                                    <label htmlFor="subject">Subject</label>
                                    <div className="contact-input-wrapper">
                                        <FiMessageSquare />
                                        <input 
                                            type="text" 
                                            id="subject"
                                            name="subject" 
                                            required 
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="contact-input"
                                            placeholder="How can we help you?"
                                        />
                                    </div>
                                </div>

                                <div className="contact-input-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea 
                                        id="message"
                                        name="message" 
                                        required 
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="contact-textarea"
                                        placeholder="Write your message here details..."
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={status.loading}
                                    className="contact-submit-btn"
                                >
                                    {status.loading ? 'Sending...' : (
                                        <>
                                            Send Message <FiSend />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Info Section */}
                        <div className="contact-info-section">
                            <div className="info-cards-container">
                                <div className="info-card">
                                    <div className="info-icon-wrapper">
                                        <FiMail />
                                    </div>
                                    <div className="info-content">
                                        <h3>Email Us</h3>
                                        <p>Our sales and support teams respond within 24 hours.</p>
                                        <p style={{ marginTop: '4px', fontWeight: 500 }}>
                                            <a href="mailto:support@kibon.com">support@kibon.com</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon-wrapper">
                                        <FiPhone />
                                    </div>
                                    <div className="info-content">
                                        <h3>Call Us</h3>
                                        <p>Mon-Fri from 9am to 6pm EST.</p>
                                        <p style={{ marginTop: '4px', fontWeight: 500 }}>
                                            <a href="tel:+15550199">+1 (555) 0199</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon-wrapper">
                                        <FiMapPin />
                                    </div>
                                    <div className="info-content">
                                        <h3>Visit Office</h3>
                                        <p>Kibon Headquarters</p>
                                        <p style={{ marginTop: '2px', opacity: 0.8 }}>
                                            100 Pine Street, Suite 1500<br />
                                            San Francisco, CA 94111
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="office-hours-widget">
                                <h4>
                                    <FiClock style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--primary-color)' }} /> 
                                    Office Hours
                                </h4>
                                <div className="hours-list">
                                    <div className="hours-row">
                                        <span>Monday - Friday</span>
                                        <span>9:00 AM - 6:00 PM EST</span>
                                    </div>
                                    <div className="hours-row">
                                        <span>Saturday</span>
                                        <span>10:00 AM - 4:00 PM EST</span>
                                    </div>
                                    <div className="hours-row">
                                        <span>Sunday</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

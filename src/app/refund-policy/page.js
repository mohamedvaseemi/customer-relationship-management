"use client";
import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '@/styles/Legal.css';

export default function RefundPolicy() {
    return (
        <div className="legal-page-wrapper">
            <div className="legal-container">
                <Link href="/login" className="legal-back-link">
                    <FiArrowLeft /> Back to Login
                </Link>
                
                <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                    className="legal-card"
                >
                    <div className="legal-header">
                        <h1 className="legal-title">Refund and Cancellation Policy</h1>
                        <div className="legal-meta">Last Updated: July 7, 2026</div>
                    </div>
                    
                    <div className="legal-body">
                        <div className="legal-section">
                            <p>
                                Upon completing a Transaction, you are entering into a legally binding and enforceable agreement with us to purchase the product and/or service. After this point the User may cancel the Transaction unless it has been specifically provided for on the Platform. In which case, the cancellation will be subject to the terms mentioned on the Platform.
                            </p>
                            <p>
                                We shall retain the discretion in approving any cancellation requests and we may ask for additional details before approving any requests. Once you have received the product and/or service, the only event where you can request for a replacement or a return and a refund is if the product and/or service does not match the description as mentioned on the Platform.
                            </p>
                            <p>
                                Any request for refund must be submitted within three days from the date of the Transaction or such number of days prescribed on the Platform, which shall in no event be less than three days.
                            </p>
                            <p>
                                A User may submit a claim for a refund for a purchase made, by raising a ticket here or contacting us on <a href="mailto:seller+8da2a84482cf4907b0e5c252ac6ba078@instamojo.com" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>seller+8da2a84482cf4907b0e5c252ac6ba078@instamojo.com</a> and providing a clear and specific reason for the refund request, including the exact terms that have been violated, along with any proof, if required. Whether a refund will be provided will be determined by us, and we may ask for additional details before approving any requests.
                            </p>
                        </div>
                    </div>
                    
                    <div className="legal-footer">
                        &copy; 2026 Kibon. All rights reserved.
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

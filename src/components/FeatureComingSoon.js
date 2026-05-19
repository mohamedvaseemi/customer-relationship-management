"use client";
import React from 'react';
import { FiTool } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FeatureComingSoon = ({ title, description }) => {
    return (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center p-12"
                style={{ maxWidth: '500px', margin: '0 auto' }}
            >
                <div
                    className="gradient-primary"
                    style={{
                        width: '80px', height: '80px', borderRadius: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', color: 'white'
                    }}
                >
                    <FiTool size={40} />
                </div>
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h1>
                <p className="text-muted mb-8" style={{ color: 'var(--text-secondary)' }}>{description || "This module is currently being optimized for your workspace. Stay tuned for advanced features and integrations."}</p>
                <button className="btn btn-primary">Notify Me</button>
            </motion.div>
        </div>
    );
};

export default FeatureComingSoon;

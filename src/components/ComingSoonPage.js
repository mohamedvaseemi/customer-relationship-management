'use client';

import { motion } from 'framer-motion';

export default function ComingSoonPage({ icon, title, description, features = [] }) {
    return (
        <div style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', paddingTop: '4rem' }}
            >
                <div style={{
                    width: 96, height: 96,
                    borderRadius: '28px',
                    background: 'var(--primary-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 2rem',
                    fontSize: '2.5rem', color: 'white',
                    boxShadow: 'var(--shadow-glow)'
                }}>
                    {icon}
                </div>

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.375rem 1rem',
                    background: 'var(--primary-light)',
                    color: 'var(--primary-color)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem', fontWeight: 700,
                    marginBottom: '1.5rem'
                }}>
                    ✦ Coming Soon
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.8rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                }}>
                    {title}
                </h1>

                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '1.1rem',
                    maxWidth: '520px',
                    margin: '0 auto 3rem',
                    lineHeight: 1.7
                }}>
                    {description}
                </p>

                {features.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                        marginTop: '2rem'
                    }}>
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{
                                    padding: '1.5rem',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'left',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{f.title}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

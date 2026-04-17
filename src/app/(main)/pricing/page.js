'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiShield, FiStar, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

export default function PricingPage() {
    const { user, token, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const plans = [
        {
            name: 'Starter',
            price: '29',
            description: 'Essential features for small teams starting their CRM journey.',
            features: [
                'Up to 15 Leads',
                'Basic Analytics',
                'Email Support',
                '1 User License',
                'CRM Wave Integration'
            ],
            icon: FiZap,
            tier: 'free', // Current tier
            popular: false
        },
        {
            name: 'Professional',
            price: '79',
            description: 'Advanced intelligence and high-volume lead management.',
            features: [
                'Unlimited Leads',
                'Advanced AI Forecasting',
                'Priority 24/7 Support',
                'Up to 10 User Licenses',
                'API Access',
                'Custom Field Tracking'
            ],
            icon: FiStar,
            tier: 'pro',
            popular: true
        },
        {
            name: 'Enterprise',
            price: '199',
            description: 'Complete sales orchestration for global organizations.',
            features: [
                'Everything in Professional',
                'Dedicated Account Manager',
                'SSO & Advanced Security',
                'Unlimited User Licenses',
                'Custom Integrations',
                'White-label Reporting'
            ],
            icon: FiShield,
            tier: 'enterprise',
            popular: false
        }
    ];

    const handleUpgrade = async (tier) => {
        if (tier === user?.subscription_tier) {
            showToast('info', 'Current Plan', `You are already on the ${tier} plan.`);
            return;
        }

        setLoading(true);
        try {
            // Mock payment process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real app, you would call your backend to verify payment and update user tier
            const response = await fetch('/api/user/subscription', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tier })
            });

            if (response.ok) {
                showToast('success', 'Plan Updated', `Successfully upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`);
                await refreshUser();
            } else {
                throw new Error('Failed to update subscription');
            }
        } catch (error) {
            showToast('error', 'Payment Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pricing-page p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="text-center mb-16 fade-in-up">
                <span className="badge badge-info mb-4">Investment Plans</span>
                <h1 className="page-title mb-4" style={{ fontSize: '3rem', textAlign: 'center' }}>Scale your intelligence.</h1>
                <p className="page-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Choose the strategic tier that aligns with your market goals.
                </p>
            </div>

            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {plans.map((plan, idx) => (
                    <motion.div
                        key={idx}
                        className={`card-premium p-8 relative ${plan.popular ? 'border-primary' : ''}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            borderWidth: plan.popular ? '2px' : '1px',
                            background: 'var(--bg-secondary)'
                        }}
                    >
                        {plan.popular && (
                            <div className="popular-badge" style={{ 
                                position: 'absolute', 
                                top: '-12px', 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                background: 'var(--primary-color)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800
                            }}>
                                MOST POPULAR
                            </div>
                        )}

                        <div className="plan-header mb-8">
                            <div className="plan-icon mb-4" style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                background: plan.popular ? 'var(--primary-color)' : 'var(--bg-tertiary)',
                                color: plan.popular ? 'white' : 'var(--primary-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <plan.icon size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.description}</p>
                        </div>

                        <div className="plan-price mb-8">
                            <span style={{ fontSize: '3rem', fontWeight: 800 }}>${plan.price}</span>
                            <span style={{ color: 'var(--text-muted)' }}>/month</span>
                        </div>

                        <ul className="plan-features mb-8" style={{ listStyle: 'none', padding: 0, flex: 1 }}>
                            {plan.features.map((feature, fIdx) => (
                                <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                    <FiCheck className="text-success" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full`} 
                            style={{ height: '56px' }}
                            onClick={() => handleUpgrade(plan.tier)}
                            disabled={loading || user?.subscription_tier === plan.tier}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    {user?.subscription_tier === plan.tier ? 'Current Plan' : 'Select Plan'}
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 text-center card bg-glass p-8 fade-in-up" style={{ borderStyle: 'dashed' }}>
                <h3>Corporate Solutions</h3>
                <p className="mb-4">Need a customized architecture for 100+ users? Let's build it together.</p>
                <button className="btn btn-outline">Contact Strategic Partnerships</button>
            </div>
        </div>
    );
}

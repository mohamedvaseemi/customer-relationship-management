"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiCheck, FiStar, FiAlertCircle, FiCheckCircle, FiShield, FiClock } from 'react-icons/fi';
import Cookies from 'js-cookie';
import '@/styles/Billing.css';

const PLANS = [
    {
        id: 'basic',
        name: 'Basic Plan',
        badge: '7-Day Free Trial',
        price: 299,
        interval: 'per month',
        features: ['1 Team Member (Solo)', 'Up to 500 Leads', '1 Sales Pipeline', 'Standard Email Support'],
        recommended: false
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 499,
        interval: 'per month',
        features: ['Up to 3 Team Members', 'Up to 2,500 Leads', '3 Sales Pipelines', 'Basic Task Automation'],
        recommended: false
    },
    {
        id: 'pro',
        name: 'Professional',
        price: 899,
        interval: 'per month',
        features: ['Up to 10 Team Members', '10,000 Leads Limit', 'Unlimited Pipelines', 'AI Sales Copilot (100 msgs)', 'Priority 24/7 Support'],
        recommended: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 1199,
        interval: 'per month',
        features: ['Unlimited Team Members', 'Unlimited Leads', 'Unlimited AI Copilot', 'API & Webhook Access', 'Dedicated Account Manager'],
        recommended: false
    }
];

export default function BillingPage() {
    const { user } = useAuth(); // Assume user.plan_id comes from context/API
    const searchParams = useSearchParams();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [alert, setAlert] = useState(null);

    // Mocking user plan for UI if not set in DB yet. Defaulting to 'basic'
    const activePlanId = user?.plan_id || 'basic'; 

    useEffect(() => {
        const status = searchParams.get('payment_status');
        const txnid = searchParams.get('txnid');
        if (status === 'success') {
            setAlert({ type: 'success', msg: `Payment successful! Transaction ID: ${txnid}` });
        } else if (status === 'failure') {
            setAlert({ type: 'error', msg: `Payment failed or was cancelled. Transaction ID: ${txnid}` });
        } else if (status === 'error') {
            setAlert({ type: 'error', msg: 'An error occurred during payment processing.' });
        }
        
        // Show Warning if in Grace Period
        if (user?.account_status === 'grace_period') {
            setAlert({ type: 'error', msg: `WARNING: Your plan has expired. Data will be purged in ${new Date(user?.grace_period_ends_at).toLocaleDateString()}. Please renew immediately.`});
        }
    }, [searchParams, user]);

    const handleUpgrade = async (plan) => {
        setLoadingPlan(plan.id);
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    amount: plan.price,
                    planId: plan.id,
                    planName: plan.name,
                    firstname: user?.name || 'User',
                    email: user?.email || 'user@example.com',
                    phone: user?.phone || '9999999999'
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.actionUrl;

            const fields = {
                key: data.key, txnid: data.txnid, amount: data.amount,
                productinfo: data.productinfo, firstname: data.firstname,
                email: data.email, phone: data.phone, surl: data.surl,
                furl: data.furl, hash: data.hash, udf1: data.udf1, udf2: data.udf2
            };

            for (const key in fields) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = fields[key];
                form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();

        } catch (err) {
            setAlert({ type: 'error', msg: err.message || 'Failed to initiate payment gateway.' });
            setLoadingPlan(null);
        }
    };

    return (
        <div className="billing-page">
            <div className="billing-header">
                <h1 className="billing-title">Billing & Subscriptions</h1>
                <p className="billing-subtitle">Upgrade your workspace to unlock advanced AI capabilities and unlimited pipelines.</p>
            </div>

            {alert && (
                <div className={`billing-alert ${alert.type}`}>
                    {alert.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                    <span>{alert.msg}</span>
                </div>
            )}

            <div className="billing-grid">
                {PLANS.map(plan => {
                    const isCurrentPlan = activePlanId === plan.id;
                    return (
                        <div key={plan.id} className={`billing-card ${plan.recommended && !isCurrentPlan ? 'recommended' : ''} ${isCurrentPlan ? 'current-active' : ''}`}>
                            {plan.recommended && !isCurrentPlan && (
                                <div className="recommended-badge"><FiStar /> Most Popular</div>
                            )}
                            {isCurrentPlan && (
                                <div className="recommended-badge" style={{ background: '#10b981' }}><FiCheckCircle /> Active Plan</div>
                            )}
                            
                            <div className="plan-header">
                                <h3 className="plan-name">{plan.name}</h3>
                                {plan.badge && (
                                    <div className="trial-badge"><FiClock size={12} /> {plan.badge}</div>
                                )}
                                <div className="plan-price-box">
                                    <span className="currency">₹</span>
                                    <span className="price">{plan.price}</span>
                                    <span className="interval">/{plan.interval}</span>
                                </div>
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((feat, idx) => (
                                    <li key={idx}>
                                        <div className="feature-icon-wrapper"><FiCheck /></div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            {isCurrentPlan ? (
                                <button className="btn btn-outline upgrade-btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed', borderColor: '#10b981', color: '#10b981' }}>
                                    Current Active Plan
                                </button>
                            ) : (
                                <button 
                                    className={`btn ${plan.recommended ? 'btn-primary' : 'btn-secondary'} upgrade-btn`}
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={loadingPlan !== null}
                                >
                                    {loadingPlan === plan.id ? 'Connecting to PayU...' : `Upgrade to ${plan.name}`}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="secure-badge"><FiShield /> Payments are securely processed via 256-bit encryption by PayU.</div>
        </div>
    );
}
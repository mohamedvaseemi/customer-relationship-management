"use client";

import React, { useState } from 'react';
import { FiCheck, FiShield, FiZap, FiLock, FiX } from 'react-icons/fi';
import { SiPaytm } from 'react-icons/si';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small teams and startups getting started with CRM.',
    monthlyPrice: 249,
    yearlyPrice: 2390,
    popular: false,
    features: [
      'Up to 5 Users',
      'Contact & Lead Management',
      'Task & Activity Tracking',
      'Basic Reporting & Analytics',
      'Standard Support (24h SLA)',
    ]
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Advanced automated CRM capabilities for growing businesses.',
    monthlyPrice: 549,
    yearlyPrice: 5270,
    popular: true,
    features: [
      'Up to 20 Users',
      'Advanced Sales Pipelines',
      'Custom Fields & Workflows',
      'Lead Intelligence & Scoring',
      'Automated Email & Chat Rules',
      'Priority Support (4h SLA)',
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Dedicated infrastructure, custom workflows, and unlimited scale.',
    monthlyPrice: 999,
    yearlyPrice: 9590,
    popular: false,
    features: [
      'Unlimited Users',
      'Dedicated Database Instance',
      'Custom API & Integrations',
      'Audit Logging & Advanced Security',
      'Dedicated Account Manager',
      '24/7 Phone & Chat Support',
    ]
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Customer Form State
  const [customer, setCustomer] = useState({
    firstname: '',
    email: '',
    phone: ''
  });

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setErrorMessage('');
  };

  const handleInitiatePayUPayment = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    if (!customer.firstname.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setErrorMessage('Please fill in all customer details.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const price = billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;

    try {
      const res = await fetch('/api/payment/payu/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: selectedPlan.name,
          billingCycle,
          amount: price,
          firstname: customer.firstname.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim()
        })
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.error || 'Could not initiate PayU checkout.');
        setLoading(false);
        return;
      }

      // Create dynamic hidden form and submit to PayU Endpoint
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.actionUrl;

      Object.entries(data.payuParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error initiating PayU payment.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
          <FiShield className="w-4 h-4" />
          <span>PayU Secured Subscription Gateway</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
          Flexible Pricing for Teams of Any Size
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Choose the right plan for your business. Pay securely using PayU Cards, NetBanking, UPI & Wallets.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center pt-6">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-2 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-indigo-900/40 via-slate-900 to-slate-950 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 md:-translate-y-2'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 backdrop-blur-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                  <FiZap className="w-3.5 h-3.5 fill-current" />
                  <span>Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</span>
                <span className="text-slate-400 text-sm ml-2">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-300 space-x-3">
                    <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                      <FiCheck className="w-4 h-4" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleOpenCheckout(plan)}
                className={`w-full py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40 hover:shadow-indigo-500/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-white border border-slate-700'
                }`}
              >
                <FiLock className="w-4 h-4" />
                <span>Pay with PayU</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* PayU Checkout Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>PayU Secure Checkout</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Subscribe to {selectedPlan.name}</h2>
              <p className="text-sm text-slate-400 mt-1">
                Amount to pay: <strong className="text-white">₹{(billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice).toLocaleString('en-IN')}</strong> ({billingCycle})
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleInitiatePayUPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={customer.firstname}
                  onChange={(e) => setCustomer({ ...customer, firstname: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Connecting to PayU...</span>
                  ) : (
                    <>
                      <span>Proceed to PayU Checkout</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-slate-500 pt-2 flex items-center justify-center space-x-1">
                <FiLock className="w-3 h-3" />
                <span>Redirecting to Official PayU Hosted Gateway</span>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

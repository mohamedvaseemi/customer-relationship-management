"use client";

import React, { useState } from 'react';
import Script from 'next/script';

const plans = [
  { name: 'Basic', price: 249, features: ['Core CRM features', 'Up to 5 users', 'Basic support'] },
  { name: 'Business', price: 549, features: ['Advanced reporting', 'Up to 20 users', 'Priority support'] },
  { name: 'Enterprise', price: 749, features: ['Custom integrations', 'Unlimited users', 'Dedicated account manager'] }
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePayment = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.name);

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price })
      });

      const data = await res.json();

      if (!data.success) {
        alert('Payment initialization failed.');
        setLoading(false);
        setSelectedPlan(null);
        return;
      }

      const options = {
        key: data.key, 
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'CRM Solutions',
        description: `Subscription for ${plan.name} Plan`,
        order_id: data.order.id,
        handler: function (response) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // We can add backend verification here later
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#4F46E5' // Indigo 600
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert('Something went wrong during payment initialization.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-20 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Choose Your Subscription
          </h1>
          <p className="text-xl text-gray-400">Simple, transparent pricing to grow your business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-2 flex flex-col shadow-xl">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-extrabold">₹{plan.price}</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-indigo-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handlePayment(plan)}
                disabled={loading && selectedPlan === plan.name}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && selectedPlan === plan.name ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

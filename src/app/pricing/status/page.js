"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiArrowLeft, FiHome } from 'react-icons/fi';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get('status') || 'unknown';
  const txnid = searchParams.get('txnid') || 'N/A';
  const payuid = searchParams.get('payuid') || 'N/A';
  const amount = searchParams.get('amount') || '0';
  const plan = searchParams.get('plan') || 'Subscription';
  const cycle = searchParams.get('cycle') || 'monthly';
  const verified = searchParams.get('verified') === '1';
  const errorMessage = searchParams.get('error');

  const isSuccess = status.toLowerCase() === 'success' && verified;

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
      {isSuccess ? (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
            <p className="text-sm text-slate-400 mt-1">
              Your subscription for <strong className="text-white">{plan} Plan ({cycle})</strong> has been activated.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <FiXCircle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
            <p className="text-sm text-rose-400 mt-1">
              {errorMessage || 'Transaction could not be processed.'}
            </p>
          </div>
        </div>
      )}

      {/* Transaction Details Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2.5">
        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
          <span>Status</span>
          <span className={`font-semibold capitalize ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
            {status}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
          <span>Transaction ID</span>
          <span className="font-mono text-slate-200">{txnid}</span>
        </div>

        {payuid && payuid !== 'N/A' && (
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
            <span>PayU Payment ID</span>
            <span className="font-mono text-slate-200">{payuid}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
          <span>Amount</span>
          <span className="font-semibold text-white">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between items-center text-slate-400">
          <span>Security Verification</span>
          <span className={verified ? 'text-emerald-400' : 'text-amber-400'}>
            {verified ? 'Verified (SHA-512)' : 'Unverified / Direct'}
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push('/pricing')}
          className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm transition flex items-center justify-center space-x-2"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </button>

        <button
          onClick={() => router.push('/')}
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30"
        >
          <FiHome className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </button>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading status...</div>}>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}

"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Receipt } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("txId");
  const amount = searchParams.get("amount");

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
          <p className="text-sm text-slate-400">
            Thank you! Your repair service payment has been confirmed.
          </p>
        </div>

        {(txId || amount) && (
          <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
            {amount && (
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-400">${amount}</span>
              </div>
            )}
            {txId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-slate-200">{txId}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/dashboard/customer/payments"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition"
          >
            <Receipt className="w-4 h-4" />
            Payment History
          </Link>
          <Link
            href="/dashboard/customer/bookings"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
          >
            My Bookings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090d16]" />}>
      <SuccessContent />
    </Suspense>
  );
}
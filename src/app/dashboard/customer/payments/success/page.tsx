"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Receipt,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { getValidToken } from "@/lib/jwt-token";

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const sessionId = searchParams.get("session_id");
  const fallbackTxId = searchParams.get("txId");
  const fallbackAmount = searchParams.get("amount");

  const [verifying, setVerifying] = useState(Boolean(sessionId));
  const [error, setError] = useState("");
  const [txId, setTxId] = useState(fallbackTxId || "");
  const [amount, setAmount] = useState<string | number>(fallbackAmount || "");

  useEffect(() => {
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    if (isPending) return;

    let active = true;

    const verifySession = async () => {
      setVerifying(true);
      try {
        const token = await getValidToken(
          session?.user?.email,
          session?.user?.name
        );

        const res = await fetch(
          `${baseUrl}/api/payments/verify?session_id=${encodeURIComponent(
            sessionId
          )}`,
          {
            cache: "no-store",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const data = await res.json();
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Payment verification failed");
        }

        if (!active) return;

        const record = data?.payment || data;
        setTxId(record?.transactionId || fallbackTxId || "");
        setAmount(record?.amount ?? fallbackAmount ?? "");
        toast.success("Payment verified and recorded!");
      } catch (err: unknown) {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : "Could not verify payment";
        setError(message);
        toast.error(message);
      } finally {
        if (active) setVerifying(false);
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, [
    sessionId,
    isPending,
    session?.user?.email,
    session?.user?.name,
    fallbackTxId,
    fallbackAmount,
  ]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
          <p className="text-sm text-slate-300">
            Verifying your Stripe payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-[#131b2e] border border-red-500/30 rounded-2xl max-w-md w-full p-8 text-center space-y-5">
          <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-white">Verification Failed</h1>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition"
          >
            Back to My Bookings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

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

        {(txId || amount !== "") && (
          <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
            {amount !== "" && (
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-400">${amount}</span>
              </div>
            )}
            {txId && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-slate-200 break-all text-right">
                  {txId}
                </span>
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
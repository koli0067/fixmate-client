"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Receipt, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type PaymentItem = {
  _id: string;
  bookingId: string;
  transactionId: string;
  serviceTitle: string;
  technicianName?: string;
  technicianEmail?: string;
  amount: number;
  paymentMethod?: string;
  status: string;
  paidAt: string;
};

export default function CustomerPaymentsPage() {
  const { data: session, isPending } = useSession();
  const customerEmail = session?.user?.email ?? "";

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

  const fetchPayments = useCallback(async () => {
    if (!customerEmail) {
      if (!isPending) setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/payments/customer/${encodeURIComponent(customerEmail)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load payments");
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Payment history error:", error);
      toast.error("Could not load payment history.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, customerEmail, isPending]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalSpent = payments.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment History</h1>
          <p className="text-sm text-slate-400 mt-1">
            View all your completed repair payments and transaction receipts.
          </p>
        </div>

        <div className="bg-[#131b2e] border border-slate-800 px-4 py-2.5 rounded-xl">
          <p className="text-xs text-slate-400">Total Paid</p>
          <p className="text-lg font-bold text-emerald-400">${totalSpent}</p>
        </div>
      </div>

      {loading || isPending ? (
        <div className="min-h-[40vh] flex items-center justify-center gap-2 text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
          <span className="text-sm">Loading payments...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-12 text-center space-y-2">
          <Receipt className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-slate-300 font-medium">No payments yet</p>
          <p className="text-xs text-slate-400">
            Once you pay for a completed service booking, the receipt will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Service</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {payments.map((item) => (
                <tr key={item._id} className="hover:bg-[#0d1322]/60 transition">
                  <td className="py-4 px-5">
                    <p className="font-semibold text-white">{item.serviceTitle}</p>
                    <p className="text-xs text-slate-400">
                      Technician: {item.technicianName || item.technicianEmail}
                    </p>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-teal-400">
                    {item.transactionId}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.paidAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-white">
                    ${item.amount}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
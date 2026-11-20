"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Receipt,
  CheckCircle2,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type PaymentItem = {
  _id?: string;
  id?: string;
  bookingId?: string;
  transactionId?: string;
  sessionId?: string;
  serviceTitle?: string;
  technicianName?: string;
  technicianEmail?: string;
  amount?: number;
  status?: string;
  paymentStatus?: string;
  paidAt?: string;
  createdAt?: string;
  date?: string;
};

export default function CustomerPaymentsPage() {
  const { data: session, isPending } = useSession();
  const customerEmail = session?.user?.email ?? "";

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "http://localhost:5000";

  const fetchPayments = useCallback(
    async (isManualRefresh = false) => {
      if (!customerEmail) {
        if (!isPending) setLoading(false);
        return;
      }

      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const encodedEmail = encodeURIComponent(customerEmail);
        const headers: HeadersInit = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        let res = await fetch(`${baseUrl}/api/payments/customer/${encodedEmail}`, {
          cache: "no-store",
          headers,
        });

        if (res.status === 404) {
          res = await fetch(`${baseUrl}/payments/customer/${encodedEmail}`, {
            cache: "no-store",
            headers,
          });
        }

        if (!res.ok) {
          throw new Error("Failed to load payments");
        }

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.payments)
          ? data.payments
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setPayments(list);
      } catch (error) {
        console.error("Payment history error:", error);
        toast.error("Could not load payment history.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [baseUrl, customerEmail, isPending]
  );

  useEffect(() => {
    fetchPayments(false);
  }, [fetchPayments]);

  const totalSpent = payments.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const formatPaidDate = (item: PaymentItem) => {
    const rawDate = item.paidAt || item.createdAt || item.date;
    if (!rawDate) return "N/A";
    const parsed = new Date(rawDate);
    return Number.isNaN(parsed.getTime()) ? "N/A" : parsed.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment History</h1>
          <p className="text-sm text-slate-400 mt-1">
            View all your completed repair payments and transaction receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchPayments(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 bg-[#131b2e] hover:bg-slate-800 disabled:opacity-60 border border-slate-800 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-teal-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <div className="bg-[#131b2e] border border-slate-800 px-4 py-2 rounded-xl">
            <p className="text-xs text-slate-400">Total Paid</p>
            <p className="text-lg font-bold text-emerald-400">${totalSpent}</p>
          </div>
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
            Once you pay for a completed service booking, the receipt will appear
            here.
          </p>
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Service</th>
                <th className="py-3.5 px-4">Technician</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {payments.map((item, index) => {
                const rowKey =
                  item._id || item.id || item.transactionId || `payment-${index}`;
                const txDisplay =
                  item.transactionId || item.sessionId || "N/A";
                const isPaid =
                  item.paymentStatus === "paid" ||
                  item.status === "paid" ||
                  item.status === "succeeded" ||
                  item.status === "completed";

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-[#0d1322]/60 transition"
                  >
                    <td className="py-4 px-5">
                      <p className="font-semibold text-white">
                        {item.serviceTitle || "Repair Service"}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                      {item.technicianName || item.technicianEmail || "N/A"}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-teal-400">
                      {txDisplay}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-300 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatPaidDate(item)}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                      ${Number(item.amount || 0)}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isPaid ? "Paid" : item.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
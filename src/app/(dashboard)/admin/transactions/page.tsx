"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { getValidToken } from "@/lib/jwt-token";

type TransactionItem = {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  technicianName?: string;
  technicianEmail?: string;
  serviceTitle?: string;
  amount: number;
  transactionId?: string;
  paidAt?: string;
  createdAt?: string;
};

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

export default function AdminTransactionsPage() {
  const { data: session, isPending } = useSession();
  const adminEmail = session?.user?.email ?? "";
  const adminName = session?.user?.name ?? "";

  const [payments, setPayments] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    if (isPending) return;
    if (!adminEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getValidToken(adminEmail, adminName);
      const res = await fetch(`${baseUrl}/admin/payments`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load transactions");
      }
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Could not load transactions."
      );
    } finally {
      setLoading(false);
    }
  }, [adminEmail, adminName, isPending]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const totalRevenue = payments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-slate-400 mt-1">
            All completed payments and platform revenue records.
          </p>
        </div>

        <div className="bg-[#131b2e] border border-teal-500/30 rounded-2xl px-5 py-3">
          <p className="text-xs text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold text-teal-400">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {loading || isPending ? (
        <div className="h-64 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse" />
      ) : payments.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400 text-sm">
          No transactions recorded yet.
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 bg-[#0e1525]">
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Technician</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-medium text-white">
                    {p.serviceTitle || "Repair Service"}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">
                    <p className="text-white font-medium">
                      {p.customerName || "Customer"}
                    </p>
                    <p className="text-slate-400">{p.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">
                    <p className="text-white font-medium">
                      {p.technicianName || "Technician"}
                    </p>
                    <p className="text-slate-400">{p.technicianEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-teal-400">
                    {p.transactionId || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {formatDate(p.paidAt || p.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ${Number(p.amount || 0).toFixed(2)}
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
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type AdminBooking = {
  _id: string;
  serviceTitle?: string;
  customerName?: string;
  customerEmail?: string;
  technicianName?: string;
  technicianEmail?: string;
  preferredDate?: string;
  status: string;
  paymentStatus?: string;
  finalAmount?: number;
  basePrice?: number;
};

const STATUS_FILTERS = [
  "all",
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

export default function AdminAllBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        statusFilter !== "all"
          ? `?status=${encodeURIComponent(statusFilter)}`
          : "";
      const res = await fetch(`${baseUrl}/admin/bookings${query}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "accepted":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "in-progress":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Bookings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Read-only monitor of every repair request across the platform.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#131b2e] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-white focus:outline-none focus:border-teal-500 w-fit"
        >
          {STATUS_FILTERS.map((st) => (
            <option key={st} value={st}>
              {st === "all" ? "All Statuses" : st}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-64 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse" />
      ) : bookings.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400 text-sm">
          No bookings found for this filter.
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 bg-[#0e1525]">
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Technician</th>
                <th className="py-3.5 px-4">Preferred Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {bookings.map((b) => {
                const amount = b.finalAmount ?? b.basePrice ?? 0;
                const isPaid = (b.paymentStatus || "unpaid") === "paid";

                return (
                  <tr key={b._id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-medium text-white">
                      {b.serviceTitle || "Repair Service"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <p className="text-white font-medium">
                        {b.customerName || "Customer"}
                      </p>
                      <p className="text-slate-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <p className="text-white font-medium">
                        {b.technicianName || "Technician"}
                      </p>
                      <p className="text-slate-400">{b.technicianEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {b.preferredDate || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-lg border ${getStatusStyle(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-lg border ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {b.paymentStatus || "unpaid"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ${amount}
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
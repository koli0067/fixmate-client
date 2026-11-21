"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

async function getOrSyncToken(email?: string | null, name?: string | null) {
  if (typeof window === "undefined") return null;

  const existing =
    localStorage.getItem("token") || localStorage.getItem("auth_token");
  if (existing) return existing;

  if (!email) return null;

  try {
    const res = await fetch(`${baseUrl}/api/auth/jwt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: name || "" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.token) {
      localStorage.setItem("token", data.token);
      return data.token as string;
    }
  } catch (err) {
    console.error("Failed to sync JWT token:", err);
  }

  return null;
}

type BookingItem = {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  technicianName?: string;
  preferredDate?: string;
  basePrice?: number;
  finalAmount?: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
};

function getStatusBadge(status: string) {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "requested":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "accepted":
      return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
    case "in-progress":
    case "in_progress":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "completed":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "rejected":
    case "cancelled":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

export default function CustomerDashboardPage() {
  const { data: session, isPending } = useSession();

  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string | null }
    | undefined;

  const customerEmail = user?.email?.trim() || "";
  const customerName = user?.name?.trim() || "";

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCustomerBookings = useCallback(
    async (email: string, name?: string) => {
      setLoading(true);
      try {
        const token = await getOrSyncToken(email, name);
        const res = await fetch(
          `${baseUrl}/bookings/customer/${encodeURIComponent(email)}`,
          {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to fetch bookings");
        }

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading customer overview:", error);
        toast.error(
          error instanceof Error ? error.message : "Could not load your bookings"
        );
        setBookings([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isPending) return;
    if (!customerEmail) {
      setLoading(false);
      return;
    }
    fetchCustomerBookings(customerEmail, customerName);
  }, [isPending, customerEmail, customerName, fetchCustomerBookings]);

  const totalRequests = bookings.length;

  const activeJobs = bookings.filter((b) =>
    ["requested", "accepted", "in-progress", "in_progress"].includes(
      (b.status || "").toLowerCase()
    )
  ).length;

  const completedJobs = bookings.filter(
    (b) => (b.status || "").toLowerCase() === "completed"
  ).length;

  const totalSpent = bookings
    .filter((b) => (b.paymentStatus || "").toLowerCase() === "paid")
    .reduce(
      (sum, b) => sum + Number(b.finalAmount ?? b.basePrice ?? 0),
      0
    );

  const recentBookings = bookings.slice(0, 5);

  if (isPending || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-300 gap-2.5">
        <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
        <span className="text-sm">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-7 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of your repair requests, active jobs, and completed services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white transition"
          >
            Browse Services
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Required Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Requests
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              {String(totalRequests).padStart(2, "0")}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Active Jobs
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              {String(activeJobs).padStart(2, "0")}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Completed Jobs
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              {String(completedJobs).padStart(2, "0")}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Spent
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              ${totalSpent}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Bookings / Activity */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your latest repair requests and status updates
            </p>
          </div>

          <Link
            href="/customer/bookings"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-teal-400 hover:text-teal-300 transition"
          >
            View All Bookings
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-10 text-center space-y-3 border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm text-slate-300">
              You haven't requested any repair services yet.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition"
            >
              Find a Repair Service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => {
              const amount = booking.finalAmount ?? booking.basePrice ?? 0;
              return (
                <div
                  key={booking._id}
                  className="bg-[#0d1322] border border-slate-800/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        booking.serviceImage ||
                        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300"
                      }
                      alt={booking.serviceTitle}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {booking.serviceTitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        {booking.technicianName && (
                          <span>Tech: {booking.technicianName}</span>
                        )}
                        {booking.preferredDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-teal-400" />
                            {booking.preferredDate}
                          </span>
                        )}
                        <span className="text-slate-200 font-medium">
                          ${amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border capitalize ${getStatusBadge(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border capitalize ${
                        (booking.paymentStatus || "").toLowerCase() === "paid"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800/80 text-slate-300 border-slate-700"
                      }`}
                    >
                      {booking.paymentStatus || "unpaid"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
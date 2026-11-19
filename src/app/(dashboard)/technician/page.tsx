"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ClipboardList,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type TechnicianService = {
  _id: string;
  title: string;
  basePrice: number;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
};

type BookingRequest = {
  _id: string;
  serviceTitle: string;
  basePrice: number;
  customerName: string;
  customerEmail: string;
  preferredDate?: string;
  preferredTime?: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "rejected";
};

export default function TechnicianOverviewPage() {
  const { data: session, isPending } = useSession();
  const technicianName = session?.user?.name ?? "Technician";
  const technicianEmail = session?.user?.email ?? "";

  const [services, setServices] = useState<TechnicianService[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

  const loadOverviewData = useCallback(async () => {
    if (!technicianEmail) {
      if (!isPending) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const encodedEmail = encodeURIComponent(technicianEmail);
      const [servicesRes, bookingsRes] = await Promise.all([
        fetch(`${baseUrl}/services/technician/${encodedEmail}`, {
          cache: "no-store",
        }),
        fetch(`${baseUrl}/bookings/technician/${encodedEmail}`, {
          cache: "no-store",
        }),
      ]);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(
          Array.isArray(servicesData) ? servicesData : servicesData.services || []
        );
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setRequests(Array.isArray(bookingsData) ? bookingsData : []);
      }

      if (!servicesRes.ok || !bookingsRes.ok) {
        toast.error("Some overview data could not be loaded.");
      }
    } catch (error) {
      console.error("Failed to load overview data:", error);
      toast.error("Could not load overview data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isPending, technicianEmail]);

  useEffect(() => {
    loadOverviewData();
  }, [loadOverviewData]);

  const totalServices = services.length;
  const pendingRequestsCount = requests.filter(
    (req) => req.status === "pending"
  ).length;
  const completedJobsCount = requests.filter(
    (req) => req.status === "completed"
  ).length;
  const totalEarnings = requests
    .filter((req) => req.status === "completed")
    .reduce((sum, req) => sum + Number(req.basePrice || 0), 0);

  const recentRequests = requests.slice(0, 5);

  const getStatusBadge = (status: BookingRequest["status"]) => {
    switch (status) {
      case "accepted":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "in_progress":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {technicianName}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is a quick summary of your services, booking requests, and
            earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/technician/requests"
            className="inline-flex items-center gap-2 bg-[#131b2e] hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-medium px-4 py-2.5 rounded-xl transition"
          >
            Manage Requests
          </Link>

          <Link
            href="/technician/add-service"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {loading || isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-32 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Total Services
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalServices}</p>
            <Link
              href="/technician/my-services"
              className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300"
            >
              View my services <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Pending Requests
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {pendingRequestsCount}
            </p>
            <Link
              href="/technician/requests"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
            >
              Review requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Completed Jobs
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {completedJobsCount}
            </p>
            <span className="inline-block text-xs text-slate-400">
              Finished repair bookings
            </span>
          </div>

          <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Total Earnings
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">${totalEarnings}</p>
            <span className="inline-block text-xs text-slate-400">
              From completed services
            </span>
          </div>
        </div>
      )}

      {/* Recent Booking Requests */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
          <div>
            <h2 className="text-base font-semibold text-white">
              Recent Booking Requests
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest bookings assigned to your account
            </p>
          </div>

          <Link
            href="/technician/requests"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
          >
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading || isPending ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 bg-[#090d16] border border-slate-800/60 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <p className="text-sm text-slate-300 font-medium">
              No recent booking requests yet.
            </p>
            <p className="text-xs text-slate-400">
              New customer bookings for your services will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {recentRequests.map((req) => (
              <div
                key={req._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      {req.serviceTitle}
                    </span>
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md border ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      {req.customerName}
                    </span>
                    {req.preferredDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        {req.preferredDate}{" "}
                        {req.preferredTime ? `• ${req.preferredTime}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-bold text-white">
                  ${req.basePrice}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Wrench,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type BookingRequest = {
  _id: string;
  serviceId?: string;
  serviceTitle: string;
  category?: string;
  basePrice: number;
  serviceMode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  preferredDate?: string;
  preferredTime?: string;
  issueDescription?: string;
  technicianName?: string;
  technicianEmail: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "rejected";
  paymentStatus?: string;
  createdAt?: string;
};

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

export default function ManageRequestsPage() {
  const { data: session, isPending } = useSession();
  const technicianEmail = session?.user?.email ?? "";

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

  const loadRequests = useCallback(async () => {
    if (!technicianEmail) {
      if (!isPending) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/bookings/technician/${encodeURIComponent(technicianEmail)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } else {
        toast.error("Could not load booking requests.");
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
      toast.error("Could not load booking requests.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isPending, technicianEmail]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleStatusUpdate = async (
    id: string,
    newStatus: BookingRequest["status"]
  ) => {
    setUpdatingId(id);

    try {
      const res = await fetch(`${baseUrl}/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req._id === id ? { ...req, status: newStatus } : req
          )
        );
        toast.success(`Request marked as ${newStatus.replace("_", " ")}.`);
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

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

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((req) => req.status === activeTab);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold text-white">Manage Requests</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review customer service bookings and update repair progress.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? requests.length
              : requests.filter((r) => r.status === tab.value).length;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                activeTab === tab.value
                  ? "bg-teal-600 text-white border-teal-500"
                  : "bg-[#131b2e] text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {loading || isPending ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-12 text-center space-y-2">
          <ClipboardList className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-slate-300 font-medium">
            No booking requests found in this category.
          </p>
          <p className="text-xs text-slate-400">
            When customers book your services, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg border ${getStatusBadge(
                      req.status
                    )}`}
                  >
                    {req.status.replace("_", " ")}
                  </span>

                  {req.serviceMode && (
                    <span className="text-xs bg-slate-900 text-teal-400 px-2.5 py-1 rounded-lg border border-slate-800">
                      {req.serviceMode}
                    </span>
                  )}

                  <span className="text-sm font-bold text-white ml-auto lg:ml-0">
                    ${req.basePrice}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {req.serviceTitle}
                  </h2>
                  {req.issueDescription && (
                    <p className="text-sm text-slate-400 mt-1">
                      Issue: {req.issueDescription}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">
                      {req.customerName} ({req.customerEmail})
                    </span>
                  </div>

                  {req.customerPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{req.customerPhone}</span>
                    </div>
                  )}

                  {(req.preferredDate || req.preferredTime) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>
                        {req.preferredDate}{" "}
                        {req.preferredTime ? `• ${req.preferredTime}` : ""}
                      </span>
                    </div>
                  )}

                  {req.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{req.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                {req.status === "pending" && (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === req._id}
                      onClick={() => handleStatusUpdate(req._id, "accepted")}
                      className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === req._id}
                      onClick={() => handleStatusUpdate(req._id, "rejected")}
                      className="inline-flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 disabled:opacity-60 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                )}

                {req.status === "accepted" && (
                  <button
                    type="button"
                    disabled={updatingId === req._id}
                    onClick={() => handleStatusUpdate(req._id, "in_progress")}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Start Work
                  </button>
                )}

                {req.status === "in_progress" && (
                  <button
                    type="button"
                    disabled={updatingId === req._id}
                    onClick={() => handleStatusUpdate(req._id, "completed")}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Completed
                  </button>
                )}

                {(req.status === "completed" || req.status === "rejected") && (
                  <span className="text-xs text-slate-500 italic">
                    No further actions
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
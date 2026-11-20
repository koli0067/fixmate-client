"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Wrench,
  ClipboardList,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";

type BookingRequest = {
  _id: string;
  serviceId?: string;
  serviceTitle: string;
  category?: string;
  basePrice: number;
  finalAmount?: number;
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
  status: BookingStatus;
  paymentStatus?: string;
  createdAt?: string;
};

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

function normalizeStatus(status?: string): BookingStatus {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "requested";
  if (s === "in_progress") return "in-progress";
  if (
    s === "requested" ||
    s === "accepted" ||
    s === "in-progress" ||
    s === "completed" ||
    s === "rejected" ||
    s === "cancelled"
  ) {
    return s;
  }
  return "requested";
}

export default function ManageRequestsPage() {
  const { data: session, isPending } = useSession();
  const technicianEmail = session?.user?.email ?? "";

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Complete Modal State
  const [completingBooking, setCompletingBooking] =
    useState<BookingRequest | null>(null);
  const [finalAmountInput, setFinalAmountInput] = useState<string>("");

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
      if (!res.ok) {
        throw new Error("Failed to fetch technician requests");
      }
      const data = await res.json();
      const normalizedList: BookingRequest[] = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            status: normalizeStatus(item.status),
          }))
        : [];
      setRequests(normalizedList);
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
    newStatus: BookingStatus,
    finalAmount?: number
  ) => {
    setUpdatingId(id);

    try {
      const payload: { status: BookingStatus; finalAmount?: number } = {
        status: newStatus,
      };
      if (newStatus === "completed" && typeof finalAmount === "number") {
        payload.finalAmount = finalAmount;
      }

      const res = await fetch(`${baseUrl}/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setRequests((prev) =>
        prev.map((req) =>
          req._id === id
            ? {
                ...req,
                status: newStatus,
                ...(typeof finalAmount === "number" ? { finalAmount } : {}),
              }
            : req
        )
      );

      toast.success(`Request marked as ${newStatus}.`);
      setCompletingBooking(null);
      setFinalAmountInput("");
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openCompleteModal = (booking: BookingRequest) => {
    setCompletingBooking(booking);
    const defaultAmount = booking.finalAmount ?? booking.basePrice ?? 0;
    setFinalAmountInput(String(defaultAmount));
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingBooking) return;

    const parsedAmount = Number(finalAmountInput);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid final amount greater than 0.");
      return;
    }

    handleStatusUpdate(completingBooking._id, "completed", parsedAmount);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "accepted":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "in-progress":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "rejected":
      case "cancelled":
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
          {filteredRequests.map((req) => {
            const displayAmount = req.finalAmount ?? req.basePrice ?? 0;

            return (
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
                      {req.status}
                    </span>

                    {req.serviceMode && (
                      <span className="text-xs bg-slate-900 text-teal-400 px-2.5 py-1 rounded-lg border border-slate-800">
                        {req.serviceMode}
                      </span>
                    )}

                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 capitalize">
                      Payment: {req.paymentStatus || "unpaid"}
                    </span>

                    <span className="text-sm font-bold text-white ml-auto lg:ml-0">
                      ${displayAmount}
                      {typeof req.finalAmount === "number" && (
                        <span className="text-[11px] font-normal text-emerald-400 ml-1">
                          (Final)
                        </span>
                      )}
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
                  {req.status === "requested" && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === req._id}
                        onClick={() =>
                          handleStatusUpdate(req._id, "accepted")
                        }
                        className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === req._id}
                        onClick={() =>
                          handleStatusUpdate(req._id, "rejected")
                        }
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
                      onClick={() =>
                        handleStatusUpdate(req._id, "in-progress")
                      }
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Start Work
                    </button>
                  )}

                  {req.status === "in-progress" && (
                    <button
                      type="button"
                      disabled={updatingId === req._id}
                      onClick={() => openCompleteModal(req)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  )}

                  {(req.status === "completed" ||
                    req.status === "rejected" ||
                    req.status === "cancelled") && (
                    <span className="text-xs text-slate-500 italic">
                      No further actions
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Job & Final Amount Modal */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Complete Repair Job
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {completingBooking.serviceTitle} — Customer:{" "}
                  {completingBooking.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompletingBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Final Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={finalAmountInput}
                  onChange={(e) => setFinalAmountInput(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  placeholder="Enter final service amount"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Base Price: ${completingBooking.basePrice}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === completingBooking._id}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white transition cursor-pointer"
                >
                  {updatingId === completingBooking._id
                    ? "Saving..."
                    : "Confirm Completed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
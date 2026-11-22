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
import { getValidToken } from "@/lib/jwt-token";

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
  problemDescription?: string;
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
];

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

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
  const technicianName = session?.user?.name ?? "";

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Complete Modal State
  const [completingBooking, setCompletingBooking] =
    useState<BookingRequest | null>(null);
  const [finalAmountInput, setFinalAmountInput] = useState<string>("");

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getValidToken(technicianEmail, technicianName);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [technicianEmail, technicianName]);

  const loadRequests = useCallback(async () => {
    if (!technicianEmail) {
      if (!isPending) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${baseUrl}/bookings/technician/${encodeURIComponent(technicianEmail)}`,
        { cache: "no-store", headers }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch technician requests");
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load booking requests."
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, isPending, technicianEmail]);

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

      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/bookings/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update status");
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
      toast.error(
        error instanceof Error ? error.message : "Failed to update status."
      );
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

  const renderPaymentBadge = (paymentStatus?: string) => {
    const isPaid = (paymentStatus || "").toLowerCase() === "paid";
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize ${
          isPaid
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
        }`}
      >
        {isPaid ? "Paid" : "Unpaid"}
      </span>
    );
  };

  const renderActionOrCompletedBadge = (req: BookingRequest) => {
    if (req.status === "requested") {
      return (
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            disabled={updatingId === req._id}
            onClick={() => handleStatusUpdate(req._id, "accepted")}
            className="inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accept
          </button>

          <button
            type="button"
            disabled={updatingId === req._id}
            onClick={() => handleStatusUpdate(req._id, "rejected")}
            className="inline-flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 disabled:opacity-60 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      );
    }

    if (req.status === "accepted") {
      return (
        <button
          type="button"
          disabled={updatingId === req._id}
          onClick={() => handleStatusUpdate(req._id, "in-progress")}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5" />
          Start Work
        </button>
      );
    }

    if (req.status === "in-progress") {
      return (
        <button
          type="button"
          disabled={updatingId === req._id}
          onClick={() => openCompleteModal(req)}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark Completed
        </button>
      );
    }

    if (req.status === "completed") {
      return renderPaymentBadge(req.paymentStatus);
    }

    return <span className="text-xs text-slate-500">—</span>;
  };

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((req) => req.status === activeTab);

  return (
    <div className="text-slate-100 space-y-6">
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
              className="h-32 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse"
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
        <>
          {/* Mobile / Tablet Card View */}
          <div className="grid grid-cols-1 gap-4 xl:hidden">
            {filteredRequests.map((req) => {
              const displayAmount = req.finalAmount ?? req.basePrice ?? 0;
              const description =
                req.problemDescription || req.issueDescription || "";

              return (
                <div
                  key={req._id}
                  className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg border ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>

                    <span className="text-sm font-bold text-white">
                      ${displayAmount}
                      {typeof req.finalAmount === "number" && (
                        <span className="text-[11px] font-normal text-emerald-400 ml-1">
                          (Final)
                        </span>
                      )}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {req.serviceTitle}
                    </h2>
                    {description && (
                      <p className="text-xs text-slate-400 mt-1">
                        Problem: {description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-[#0d1322] p-3 rounded-xl border border-slate-800/70">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{req.customerName}</span>
                    </div>

                    {req.customerPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{req.customerPhone}</span>
                      </div>
                    )}

                    {req.preferredDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>
                          {req.preferredDate}
                          {req.preferredTime ? ` • ${req.preferredTime}` : ""}
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

                  <div className="flex justify-end pt-1">
                    {renderActionOrCompletedBadge(req)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-[#0e1525] text-xs uppercase text-slate-400">
                    <th className="py-3.5 px-4">Service & Problem</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Phone & Address</th>
                    <th className="py-3.5 px-4">Preferred Date</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">
                      Action / Payment
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/70 text-sm">
                  {filteredRequests.map((req) => {
                    const displayAmount = req.finalAmount ?? req.basePrice ?? 0;
                    const description =
                      req.problemDescription || req.issueDescription || "";

                    return (
                      <tr
                        key={req._id}
                        className="hover:bg-slate-900/40 transition"
                      >
                        <td className="py-4 px-4 max-w-[260px]">
                          <p className="font-semibold text-white">
                            {req.serviceTitle}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                            {description || "No problem description provided"}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <p className="text-xs font-medium text-slate-200">
                            {req.customerName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {req.customerEmail}
                          </p>
                        </td>

                        <td className="py-4 px-4 max-w-[220px] text-xs text-slate-300 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>{req.customerPhone || "N/A"}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {req.address || "N/A"}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-teal-400" />
                            {req.preferredDate || "Not specified"}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap font-bold text-white">
                          ${displayAmount}
                          {typeof req.finalAmount === "number" && (
                            <span className="block text-[11px] font-normal text-emerald-400">
                              Base: ${req.basePrice}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block text-xs font-semibold capitalize px-2.5 py-1 rounded-lg border ${getStatusBadge(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {renderActionOrCompletedBadge(req)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
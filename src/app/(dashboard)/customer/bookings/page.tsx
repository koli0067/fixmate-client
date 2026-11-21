"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CreditCard,
  Search,
  User,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/lib/auth-client";

type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";

type CustomerBooking = {
  _id: string;
  serviceId?: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  basePrice: number;
  finalAmount?: number;
  technicianName?: string;
  technicianEmail?: string;
  preferredDate?: string;
  address?: string;
  problemDescription?: string;
  status: BookingStatus;
  paymentStatus: "unpaid" | "paid";
};

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

export default function CustomerBookingsPage() {
  const { data: session, isPending } = useSession();
  const customerEmail = session?.user?.email ?? "";
  const customerName = session?.user?.name ?? "";

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getOrSyncToken(customerEmail, customerName);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [customerEmail, customerName]);

  const loadMyBookings = useCallback(async () => {
    if (!customerEmail) {
      if (!isPending) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${baseUrl}/bookings/customer/${encodeURIComponent(customerEmail)}`,
        { cache: "no-store", headers }
      );
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not load your bookings.");
      }
    } catch (error) {
      console.error("Failed to fetch customer bookings:", error);
      toast.error("Could not load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [customerEmail, getAuthHeaders, isPending]);

  useEffect(() => {
    loadMyBookings();
  }, [loadMyBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers,
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((item) =>
            item._id === bookingId ? { ...item, status: "cancelled" } : item
          )
        );
        toast.success("Booking request cancelled.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not cancel booking.");
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Could not cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayNow = async (booking: CustomerBooking) => {
    setPayingId(booking._id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${baseUrl}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ bookingId: booking._id }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(
          data.message ||
            data.error ||
            "Stripe checkout session could not be started for this booking."
        );
      }
    } catch (error) {
      console.error("Payment checkout error:", error);
      toast.error("Unable to start payment right now.");
    } finally {
      setPayingId(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "requested":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "accepted":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "in-progress":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "rejected":
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your repair requests, cancel pending requests, and pay for
            completed jobs.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition w-fit"
        >
          <Search className="w-4 h-4" />
          Browse Services
        </Link>
      </div>

      {loading || isPending ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-10 text-center space-y-3">
          <p className="text-slate-200 font-semibold">
            No repair bookings found yet.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Explore approved device and home appliance repair services and send a
            repair request to get started.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#0e1525] text-xs uppercase text-slate-400">
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Preferred Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/70 text-sm">
                {bookings.map((booking) => {
                  const amountToShow =
                    booking.status === "completed" &&
                    typeof booking.finalAmount === "number" &&
                    booking.finalAmount > 0
                      ? booking.finalAmount
                      : booking.basePrice;

                  const canCancel = booking.status === "requested";
                  const canPay =
                    booking.status === "completed" &&
                    booking.paymentStatus === "unpaid";

                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-slate-900/40 transition"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3 min-w-[210px]">
                          <img
                            src={
                              booking.serviceImage ||
                              "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400"
                            }
                            alt={booking.serviceTitle}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-white line-clamp-1">
                              {booking.serviceTitle}
                            </p>
                            {booking.category && (
                              <span className="text-xs text-teal-400">
                                {booking.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <User className="w-3.5 h-3.5 text-teal-400" />
                          {booking.technicianName || "Assigned Technician"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          {booking.preferredDate || "Not specified"}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                        ${amountToShow}
                        {booking.status === "completed" &&
                          booking.finalAmount && (
                            <span className="block text-[11px] font-normal text-slate-400">
                              Base: ${booking.basePrice}
                            </span>
                          )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-xs font-semibold capitalize px-2.5 py-1 rounded-lg border ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {booking.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                            Unpaid
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {canPay && (
                            <button
                              type="button"
                              disabled={payingId === booking._id}
                              onClick={() => handlePayNow(booking)}
                              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              {payingId === booking._id
                                ? "Redirecting..."
                                : "Pay Now"}
                            </button>
                          )}

                          {canCancel && (
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <button
                                  type="button"
                                  disabled={cancellingId === booking._id}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-60 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  {cancellingId === booking._id
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </button>
                              </AlertDialogTrigger>

                              <AlertDialogContent className="bg-[#131b2e] border-slate-800 text-slate-100">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">
                                    Cancel this repair request?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-400">
                                    Are you sure you want to cancel your request
                                    for "{booking.serviceTitle}"? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer">
                                    Keep Request
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleCancelBooking(booking._id)
                                    }
                                    className="bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                                  >
                                    Yes, Cancel Request
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {!canPay && !canCancel && (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
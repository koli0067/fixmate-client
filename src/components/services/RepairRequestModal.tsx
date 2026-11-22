"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { X, Wrench, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { getValidToken } from "@/lib/jwt-token";

type ServiceSummary = {
  _id: string;
  title: string;
  category?: string;
  image?: string;
  basePrice: number;
  technicianName?: string;
  technicianEmail?: string;
};

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

export default function RepairRequestModal({
  service,
}: {
  service: ServiceSummary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string | null }
    | undefined;

  const userRole = (user?.role || "customer").toLowerCase();
  const isLoggedIn = Boolean(user?.email);
  const isTechnicianOrAdmin =
    isLoggedIn && (userRole === "technician" || userRole === "admin");

  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerPhone: "",
    address: "",
    preferredDate: "",
    problemDescription: "",
  });

  const todayDate = new Date().toLocaleDateString("en-CA");

  const handleOpenClick = () => {
    if (isPending) return;

    if (!isLoggedIn) {
      toast.info("Please sign in as a customer to request a repair.");
      const redirectTarget = encodeURIComponent(
        pathname || `/services/${service._id}`
      );
      router.push(`/sign-in?callbackUrl=${redirectTarget}`);
      return;
    }

    if (isTechnicianOrAdmin) {
      toast.error("Only customers can request a repair.");
      return;
    }

    setSubmittedSuccess(false);
    setIsOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.problemDescription.trim().length < 20) {
      toast.error("Problem description must be at least 20 characters.");
      return;
    }

    if (!formData.preferredDate || formData.preferredDate < todayDate) {
      toast.error("Preferred date must be today or a future date.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        serviceId: service._id,
        serviceTitle: service.title,
        serviceImage: service.image || "",
        category: service.category || "",
        basePrice: Number(service.basePrice),
        finalAmount: Number(service.basePrice),
        technicianName: service.technicianName || "",
        technicianEmail: service.technicianEmail || "",
        customerName: user?.name || "Customer",
        customerEmail: user?.email || "",
        customerPhone: formData.customerPhone.trim(),
        address: formData.address.trim(),
        preferredDate: formData.preferredDate,
        problemDescription: formData.problemDescription.trim(),
        status: "requested",
        paymentStatus: "unpaid",
      };

      const token = await getValidToken(user?.email, user?.name);

      const res = await fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Repair request submitted successfully!");
        setSubmittedSuccess(true);
        setFormData({
          customerPhone: "",
          address: "",
          preferredDate: "",
          problemDescription: "",
        });
      } else {
        toast.error(data.message || "Could not submit repair request.");
      }
    } catch (error) {
      console.error("Booking submit error:", error);
      toast.error("Network error while submitting request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isTechnicianOrAdmin) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full py-3 px-5 rounded-xl bg-slate-800 text-slate-500 text-sm font-semibold cursor-not-allowed border border-slate-700"
        >
          Request repair
        </button>
        <p className="text-xs text-amber-400">
          Only customers can request a repair.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenClick}
        className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold py-3 px-6 rounded-xl transition cursor-pointer"
      >
        <Wrench className="w-4 h-4" />
        Request repair
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Request Repair Service
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {service.title} • Starting at ${service.basePrice}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-white">
                    Repair Request Sent!
                  </h4>
                  <p className="text-xs text-slate-400">
                    Your booking is now in "requested" status. You can
                    track it in My Bookings.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                  <Link
                    href="/dashboard/customer/bookings"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white"
                  >
                    Go to My Bookings
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Your Name</label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      readOnly
                      className="w-full bg-[#090d16]/70 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Your Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full bg-[#090d16]/70 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      value={formData.customerPhone}
                      onChange={handleChange}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      min={todayDate}
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Service / Pickup Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House, road, area / city"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Problem Description (min 20 characters) *
                  </label>
                  <textarea
                    name="problemDescription"
                    required
                    minLength={20}
                    rows={3}
                    value={formData.problemDescription}
                    onChange={handleChange}
                    placeholder="Describe the issue with your device or appliance in detail..."
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    {formData.problemDescription.trim().length}/20 characters
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? "Sending..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
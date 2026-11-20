"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

type ServiceItem = {
  _id: string;
  title: string;
  category: string;
  image?: string;
  basePrice: number;
  serviceMode: string;
  serviceArea?: string;
  technicianName?: string;
  technicianEmail?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable?: boolean;
  createdAt?: string;
};

function getApprovalBadge(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "rejected":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    default:
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/admin/services?status=${encodeURIComponent(filterStatus)}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }

      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Admin services error:", error);
      toast.error("Could not load services");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, filterStatus]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleApprovalChange = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${baseUrl}/admin/services/${id}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approvalStatus: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(
        newStatus === "approved"
          ? "Service approved and now live!"
          : "Service has been rejected"
      );
      fetchServices();
    } catch (error) {
      console.error("Approval update error:", error);
      toast.error("Failed to update approval status");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = services.filter(
    (s) => s.approvalStatus === "pending"
  ).length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Service Approval
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review technician services and approve or reject listings before they go public.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-teal-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#131b2e] border border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Services ({services.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[45vh] flex items-center justify-center gap-2.5 text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
          <span className="text-sm">Loading services...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-12 text-center space-y-2">
          <Wrench className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-base font-semibold text-white">No services found</p>
          <p className="text-xs text-slate-400">
            No technician services match the selected filter.
          </p>
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Service</th>
                <th className="py-3.5 px-4">Technician</th>
                <th className="py-3.5 px-4">Mode & Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {services.map((service) => {
                const isUpdating = updatingId === service._id;
                return (
                  <tr
                    key={service._id}
                    className="hover:bg-[#0d1322]/60 transition"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            service.image ||
                            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300"
                          }
                          alt={service.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {service.title}
                          </p>
                          <p className="text-xs text-teal-400 mt-0.5">
                            {service.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="text-slate-200 font-medium">
                        {service.technicianName || "Technician"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {service.technicianEmail}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-white">
                        ${service.basePrice}
                      </p>
                      <p className="text-xs text-slate-400">
                        {service.serviceMode}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border capitalize ${getApprovalBadge(
                          service.approvalStatus
                        )}`}
                      >
                        {service.approvalStatus === "pending" && (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {service.approvalStatus}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          disabled={
                            isUpdating || service.approvalStatus === "approved"
                          }
                          onClick={() =>
                            handleApprovalChange(service._id, "approved")
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>

                        <button
                          disabled={
                            isUpdating || service.approvalStatus === "rejected"
                          }
                          onClick={() =>
                            handleApprovalChange(service._id, "rejected")
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/90 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
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
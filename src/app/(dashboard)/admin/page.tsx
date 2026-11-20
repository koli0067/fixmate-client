"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Users, Wrench, Clock, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

type AdminUserItem = {
  _id: string;
  role?: string;
};

type AdminServiceItem = {
  _id: string;
  approvalStatus?: string;
};

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTechnicians, setTotalTechnicians] = useState(0);
  const [pendingServices, setPendingServices] = useState(0);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

  const loadOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, servicesRes] = await Promise.all([
        fetch(`${baseUrl}/admin/users`, { cache: "no-store" }),
        fetch(`${baseUrl}/admin/services`, { cache: "no-store" }),
      ]);

      if (usersRes.ok) {
        const usersData: AdminUserItem[] = await usersRes.json();
        const usersList = Array.isArray(usersData) ? usersData : [];
        setTotalUsers(usersList.length);
        setTotalTechnicians(
          usersList.filter((u) => (u.role || "").toLowerCase() === "technician")
            .length
        );
      }

      if (servicesRes.ok) {
        const servicesData: AdminServiceItem[] = await servicesRes.json();
        const servicesList = Array.isArray(servicesData) ? servicesData : [];
        setPendingServices(
          servicesList.filter((s) => s.approvalStatus === "pending").length
        );
      }
    } catch (error) {
      console.error("Failed to load admin overview:", error);
      toast.error("Could not load admin overview stats.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadOverviewData();
  }, [loadOverviewData]);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      href: "/dashboard/admin/users",
      accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      label: "Total Technicians",
      value: totalTechnicians,
      icon: Wrench,
      href: "/dashboard/admin/users",
      accent: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
    {
      label: "Pending Services",
      value: pendingServices,
      icon: Clock,
      href: "/dashboard/admin/services",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Platform summary for users, technicians, and pending service approvals.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="bg-[#131b2e] hover:bg-[#172138] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between transition group"
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-3xl font-bold text-white">{item.value}</p>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-4">
                  <div className={`p-3 rounded-xl border ${item.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { getValidToken } from "@/lib/jwt-token";

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  role?: "customer" | "technician" | "admin";
  createdAt?: string;
};

const ROLES: Array<"customer" | "technician" | "admin"> = [
  "customer",
  "technician",
  "admin",
];

export default function ManageUsersPage() {
  const { data: session, isPending } = useSession();
  const currentAdminEmail = (session?.user?.email || "").toLowerCase();
  const currentAdminName = session?.user?.name ?? "";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getValidToken(currentAdminEmail, currentAdminName);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [currentAdminEmail, currentAdminName]);

  const loadUsers = useCallback(async () => {
    if (isPending) return;
    if (!currentAdminEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/admin/users`, {
        cache: "no-store",
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load users");
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Could not load users."
      );
    } finally {
      setLoading(false);
    }
  }, [currentAdminEmail, getAuthHeaders, isPending]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (
    user: AdminUser,
    newRole: "customer" | "technician" | "admin"
  ) => {
    const isSelf = user.email?.toLowerCase() === currentAdminEmail;
    if (isSelf) {
      toast.error("You cannot change your own role.");
      return;
    }

    setUpdatingId(user._id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/admin/users/${user._id}/role`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          role: newRole,
          adminEmail: session?.user?.email,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to update role.");
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item._id === user._id ? { ...item, role: newRole } : item
        )
      );
      toast.success(`Role updated to ${newRole}.`);
    } catch (error) {
      console.error(error);
      toast.error("Error updating user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        <p className="text-sm text-slate-400 mt-1">
          View registered users and assign roles (Customer, Technician, Admin).
        </p>
      </div>

      {loading || isPending ? (
        <div className="h-64 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse" />
      ) : users.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400 text-sm">
          No users found.
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 bg-[#0e1525]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {users.map((user) => {
                const isSelf =
                  user.email?.toLowerCase() === currentAdminEmail;
                const currentRole = (user.role || "customer") as
                  | "customer"
                  | "technician"
                  | "admin";

                return (
                  <tr key={user._id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <UserIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {user.name || "Unnamed User"}
                          </p>
                          {isSelf && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-teal-400">
                              <Shield className="w-3 h-3" />
                              You (protected)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">{user.email}</td>

                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={currentRole}
                        disabled={isSelf || updatingId === user._id}
                        onChange={(e) =>
                          handleRoleChange(
                            user,
                            e.target.value as "customer" | "technician" | "admin"
                          )
                        }
                        className="bg-[#090d16] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-teal-500"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
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
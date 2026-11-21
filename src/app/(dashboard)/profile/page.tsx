"use client";

import React, { useCallback, useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Wrench, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { getValidToken } from "@/lib/jwt-token";

const SPECIALTIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
  "All-Rounder Technician",
];


const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

export default function TechnicianSettingsPage() {
  const { data: session, isPending } = useSession();
  const userEmail = session?.user?.email ?? "";
  const sessionName = session?.user?.name ?? "";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceArea: "",
    specialty: "Smartphone",
    bio: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getValidToken(userEmail, sessionName);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [sessionName, userEmail]);

  const loadProfile = useCallback(async () => {
    if (!userEmail) {
      if (!isPending) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${baseUrl}/users/${encodeURIComponent(userEmail)}`,
        { cache: "no-store", headers }
      );
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || session?.user?.name || "",
          phone: data.phone || "",
          serviceArea: data.serviceArea || "",
          specialty: data.specialty || "Smartphone",
          bio: data.bio || "",
          image: data.image || session?.user?.image || "",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not load profile settings.");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Could not load profile settings.");
    } finally {
      setLoading(false);
    }
  }, [
    getAuthHeaders,
    isPending,
    session?.user?.image,
    session?.user?.name,
    userEmail,
  ]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${baseUrl}/users/${encodeURIComponent(userEmail)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        toast.success("Profile & settings updated successfully!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not update profile.");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-2xl font-bold text-white">Settings & Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Update your technician profile details, contact info, and service
            preferences.
          </p>
        </div>

        {loading || isPending ? (
          <div className="h-96 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Account Card */}
            <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 space-y-4 h-fit">
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    formData.image ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
                  }
                  alt={formData.name || "Technician"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-500/40"
                />
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-white truncate">
                    {formData.name || "Technician"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs text-teal-400 font-medium mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Technician Account
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate text-slate-300">{userEmail}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-slate-300">{formData.phone}</span>
                  </div>
                )}
                {formData.serviceArea && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-slate-300">
                      {formData.serviceArea}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="text-slate-300">{formData.specialty}</span>
                </div>
              </div>
            </div>

            {/* Right Update Form */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 space-y-5"
            >
              <h3 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
                Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full bg-[#090d16]/60 border border-slate-800/70 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., 017XXXXXXXX"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    Primary Service Area
                  </label>
                  <input
                    type="text"
                    name="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleChange}
                    placeholder="e.g., Mirpur, Dhaka"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Primary Specialty
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {SPECIALTIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://i.ibb.co/..."
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Short Bio / Experience
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write a brief note about your repair experience and certifications..."
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
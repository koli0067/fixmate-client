"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  ShieldCheck,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { getValidToken } from "@/lib/jwt-token";

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";
const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400";

type ProfileState = {
  name: string;
  email: string;
  role: string;
  phone: string;
  area: string;
  bio: string;
  image: string;
};

export default function SharedProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const sessionEmail = session?.user?.email ?? "";
  const sessionName = session?.user?.name ?? "";
  const sessionImage = session?.user?.image ?? "";
  const sessionRole =
    (session?.user as { role?: string } | undefined)?.role || "customer";

  const [formData, setFormData] = useState<ProfileState>({
    name: "",
    email: "",
    role: "customer",
    phone: "",
    area: "",
    bio: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getValidToken(sessionEmail, sessionName);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [sessionEmail, sessionName]);

  const loadProfile = useCallback(async () => {
    if (!sessionEmail) {
      if (!isPending) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${baseUrl}/users/${encodeURIComponent(sessionEmail)}`,
        { cache: "no-store", headers }
      );

      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || sessionName || "",
          email: data.email || sessionEmail,
          role: data.role || sessionRole,
          phone: data.phone || "",
          area: data.area || data.serviceArea || "",
          bio: data.bio || "",
          image: data.image || sessionImage || "",
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || sessionName || "",
          email: sessionEmail,
          role: sessionRole,
          image: prev.image || sessionImage || "",
        }));
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Could not load profile details.");
    } finally {
      setLoading(false);
    }
  }, [
    getAuthHeaders,
    isPending,
    sessionEmail,
    sessionImage,
    sessionName,
    sessionRole,
  ]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (!imgbbApiKey) {
      toast.error("ImgBB API key is missing (NEXT_PUBLIC_IMGBB_API_KEY).");
      return;
    }

    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbApiKey)}`,
        {
          method: "POST",
          body,
        }
      );

      const data = await res.json();
      const uploadedUrl = data?.data?.display_url || data?.data?.url;

      if (!res.ok || !data?.success || !uploadedUrl) {
        throw new Error(data?.error?.message || "Failed to upload photo.");
      }

      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      toast.success("Profile photo uploaded to ImgBB!");
    } catch (error) {
      console.error("ImgBB upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not upload photo."
      );
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionEmail) return;

    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const cleanName = formData.name.trim();
      const cleanPhone = formData.phone.trim();
      const cleanArea = formData.area.trim();
      const cleanBio = formData.bio.trim();
      const cleanImage = formData.image.trim();

      const payload = {
        name: cleanName,
        phone: cleanPhone,
        area: cleanArea,
        serviceArea: cleanArea,
        bio: cleanBio,
        image: cleanImage,
      };

      const res = await fetch(
        `${baseUrl}/users/${encodeURIComponent(sessionEmail)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Could not update profile.");
      }

      if (typeof authClient?.updateUser === "function") {
        await authClient
          .updateUser({
            name: cleanName,
            ...(cleanImage ? { image: cleanImage } : {}),
          })
          .catch(() => null);
      }

      if (typeof refetch === "function") {
        await refetch().catch(() => null);
      }

      setFormData((prev) => ({
        ...prev,
        name: cleanName,
        phone: cleanPhone,
        area: cleanArea,
        bio: cleanBio,
        image: cleanImage,
      }));

      window.dispatchEvent(
        new CustomEvent("fixmate:profile-updated", {
          detail: {
            name: cleanName,
            image: cleanImage,
            email: sessionEmail,
          },
        })
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-slate-100 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-2xl font-bold text-white">Update Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal details, area, bio, and profile photo.
          </p>
        </div>

        {loading || isPending ? (
          <div className="h-96 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 space-y-4 h-fit">
              <div className="flex items-center gap-3.5">
                <img
                  src={formData.image || FALLBACK_AVATAR}
                  alt={formData.name || "User"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-500/40 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-white truncate">
                    {formData.name || "User"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs text-teal-400 font-medium capitalize mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {formData.role} Account
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate text-slate-300">
                    {formData.email}
                  </span>
                </div>
                {formData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-slate-300">{formData.phone}</span>
                  </div>
                )}
                {formData.area && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-slate-300">{formData.area}</span>
                  </div>
                )}
              </div>

              {formData.bio && (
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
                  {formData.bio}
                </p>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 space-y-5"
            >
              <h3 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
                Profile Information
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Profile Photo (ImgBB Upload)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 bg-[#090d16] hover:bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition">
                    {uploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    ) : (
                      <Upload className="w-4 h-4 text-teal-400" />
                    )}
                    {uploadingPhoto ? "Uploading..." : "Choose Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPhoto}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.image && (
                    <span className="text-xs text-emerald-400 truncate max-w-xs">
                      Photo ready
                    </span>
                  )}
                </div>
              </div>

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
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    Phone
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
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g., Gaibandha Sadar / Dhaka"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    Role (Read-only)
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    readOnly
                    disabled
                    className="w-full bg-[#090d16]/60 border border-slate-800/70 rounded-xl px-4 py-2.5 text-sm text-slate-400 capitalize cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full bg-[#090d16]/60 border border-slate-800/70 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write a short bio about yourself..."
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || uploadingPhoto}
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
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Plus,
  Trash2,
  Pencil,
  X,
  Upload,
  Loader2,
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

const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

const SERVICE_MODES = ["Home Visit", "Shop Drop-off"];

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

type TechnicianService = {
  _id: string;
  title: string;
  category: string;
  description?: string;
  image?: string;
  basePrice: number;
  estimatedDuration?: string;
  serviceMode: string;
  serviceArea?: string;
  technicianName?: string;
  technicianEmail?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
};

export default function MyServicesPage() {
  const { data: session, isPending } = useSession();
  const technicianEmail = session?.user?.email ?? "";
  const technicianName = session?.user?.name ?? "";

  const [services, setServices] = useState<TechnicianService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Modal State
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingService, setEditingService] = useState<TechnicianService | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    title: "",
    category: "Smartphone",
    description: "",
    image: "",
    basePrice: "",
    estimatedDuration: "",
    serviceMode: "Home Visit",
    serviceArea: "",
  });
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string>("");
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getOrSyncToken(technicianEmail, technicianName);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [technicianEmail, technicianName]);

  const loadMyServices = useCallback(async () => {
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
        `${baseUrl}/services/technician/${encodeURIComponent(technicianEmail)}`,
        { cache: "no-store", headers }
      );
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : data.services || []);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not load your services.");
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      toast.error("Could not load your services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, isPending, technicianEmail]);

  useEffect(() => {
    loadMyServices();
  }, [loadMyServices]);

  const resetEditImageState = () => {
    if (editPreviewUrl && editPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setSelectedEditFile(null);
    setEditPreviewUrl("");
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const openEditModal = (service: TechnicianService) => {
    resetEditImageState();
    setEditingService(service);
    setEditForm({
      title: service.title || "",
      category: service.category || "Smartphone",
      description: service.description || "",
      image: service.image || "",
      basePrice: String(service.basePrice ?? ""),
      estimatedDuration: service.estimatedDuration || "",
      serviceMode: service.serviceMode || "Home Visit",
      serviceArea: service.serviceArea || "",
    });
    setEditPreviewUrl(service.image || "");
  };

  const closeEditModal = () => {
    resetEditImageState();
    setEditingService(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (editPreviewUrl && editPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(editPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedEditFile(file);
    setEditPreviewUrl(objectUrl);
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    if (!imgbbApiKey) {
      throw new Error("NEXT_PUBLIC_IMGBB_API_KEY is missing in .env.local");
    }

    const body = new FormData();
    body.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      {
        method: "POST",
        body,
      }
    );

    const data = await res.json();
    if (!res.ok || !data?.success || !data?.data?.url) {
      throw new Error(data?.error?.message || "Failed to upload image to ImgBB");
    }

    return data.data.url as string;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const numericPrice = Number(editForm.basePrice);
    if (!numericPrice || Number.isNaN(numericPrice) || numericPrice <= 0) {
      toast.error("Base price must be a positive number.");
      return;
    }

    setSavingEdit(true);
    try {
      let imageUrl = editForm.image;

      if (selectedEditFile) {
        setUploadingEditImage(true);
        imageUrl = await uploadToImgBB(selectedEditFile);
        setUploadingEditImage(false);
      }

      const updatedPayload = {
        title: editForm.title.trim(),
        category: editForm.category,
        description: editForm.description.trim(),
        image: imageUrl,
        basePrice: numericPrice,
        estimatedDuration: editForm.estimatedDuration.trim(),
        serviceMode: editForm.serviceMode,
        serviceArea: editForm.serviceArea.trim(),
        approvalStatus: "pending" as const,
      };

      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/services/${editingService._id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updatedPayload),
      });

      if (res.ok) {
        setServices((prev) =>
          prev.map((item) =>
            item._id === editingService._id
              ? { ...item, ...updatedPayload }
              : item
          )
        );
        toast.success(
          "Service updated! Status set to 'pending' for admin review."
        );
        closeEditModal();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not update service.");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not update service.";
      console.error("Failed to update service:", error);
      toast.error(message);
    } finally {
      setUploadingEditImage(false);
      setSavingEdit(false);
    }
  };

  const handleToggleAvailability = async (service: TechnicianService) => {
    const nextState = !service.isAvailable;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${baseUrl}/services/${service._id}/availability`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ isAvailable: nextState }),
        }
      );

      if (res.ok) {
        setServices((prev) =>
          prev.map((item) =>
            item._id === service._id
              ? { ...item, isAvailable: nextState }
              : item
          )
        );
        toast.success(
          nextState
            ? "Service is now available."
            : "Service marked as unavailable."
        );
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not update availability.");
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast.error("Could not update availability.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/services/${id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setServices((prev) => prev.filter((item) => item._id !== id));
        toast.success("Service deleted.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not delete the service.");
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Could not delete the service.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (status === "rejected") {
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">My Services</h1>
          <p className="text-sm text-slate-400 mt-1">
            View, edit, toggle availability, and manage your repair services.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Link>
      </div>

      {loading || isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 bg-[#131b2e] border border-slate-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-10 text-center space-y-3">
          <p className="text-slate-300 font-medium">No services found yet.</p>
          <p className="text-xs text-slate-400">
            Click "Add Service" to create your first repair service.
          </p>
          <Link
            href="/dashboard/technician/add-service"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <img
                  src={
                    service.image ||
                    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"
                  }
                  alt={service.title}
                  className="w-full h-40 object-cover border-b border-slate-800/80"
                />

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium bg-slate-900 text-teal-400 px-2.5 py-1 rounded-lg border border-slate-800">
                      {service.category}
                    </span>
                    <span
                      className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-lg border ${getStatusBadge(
                        service.approvalStatus
                      )}`}
                    >
                      {service.approvalStatus}
                    </span>
                  </div>

                  <h2 className="text-base font-semibold text-white line-clamp-1">
                    {service.title}
                  </h2>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {service.serviceMode}
                    </span>
                    <span className="font-bold text-white">
                      ${service.basePrice}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 pt-1">
                    {service.serviceArea && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span>{service.serviceArea}</span>
                      </div>
                    )}
                    {service.estimatedDuration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{service.estimatedDuration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-[#0e1525] border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(service)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    service.isAvailable
                      ? "bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {service.isAvailable ? "Available: ON" : "Available: OFF"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(service)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 px-2.5 py-1.5 rounded-lg hover:bg-sky-500/10 transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger>
                      <button
                        type="button"
                        disabled={deletingId === service._id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-60 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === service._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="bg-[#131b2e] border-slate-800 text-slate-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Delete this service?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          This action cannot be undone. "{service.title}
                          " will be permanently removed from your
                          services.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(service._id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                        >
                          Yes, Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Edit Service
                </h3>
                <p className="text-xs text-slate-400">
                  Updating a service sets approval status back to pending.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Category *</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Base Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    required
                    min="0.01"
                    step="any"
                    value={editForm.basePrice}
                    onChange={handleEditChange}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    name="estimatedDuration"
                    value={editForm.estimatedDuration}
                    onChange={handleEditChange}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Service Mode *
                  </label>
                  <select
                    name="serviceMode"
                    value={editForm.serviceMode}
                    onChange={handleEditChange}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {SERVICE_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Service Area</label>
                  <input
                    type="text"
                    name="serviceArea"
                    value={editForm.serviceArea}
                    onChange={handleEditChange}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-slate-300">
                  Service Image
                </label>
                <div className="flex items-center gap-3.5">
                  <div className="w-28 h-20 rounded-xl border border-slate-800 bg-[#090d16] flex items-center justify-center overflow-hidden shrink-0">
                    {editPreviewUrl ? (
                      <img
                        src={editPreviewUrl}
                        alt="Edit preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        No image yet
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 bg-[#090d16] hover:bg-slate-900 border border-slate-800 hover:border-teal-500 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-teal-400" />
                      Upload image
                    </button>
                    {selectedEditFile && (
                      <p className="text-xs text-teal-400 truncate max-w-[200px]">
                        {selectedEditFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || uploadingEditImage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-60 cursor-pointer"
                >
                  {(savingEdit || uploadingEditImage) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {uploadingEditImage
                    ? "Uploading..."
                    : savingEdit
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
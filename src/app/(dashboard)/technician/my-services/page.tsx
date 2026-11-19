"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Plus,
  Trash2,
  Pencil,
  X,
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

  const [services, setServices] = useState<TechnicianService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Modal State
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
  const [savingEdit, setSavingEdit] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

  const loadMyServices = useCallback(async () => {
    if (!technicianEmail) {
      if (!isPending) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/services/technician/${encodeURIComponent(technicianEmail)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : data.services || []);
      } else {
        toast.error("Could not load your services.");
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      toast.error("Could not load your services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isPending, technicianEmail]);

  useEffect(() => {
    loadMyServices();
  }, [loadMyServices]);

  const openEditModal = (service: TechnicianService) => {
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
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setSavingEdit(true);
    try {
      const updatedPayload = {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
        image: editForm.image,
        basePrice: Number(editForm.basePrice),
        estimatedDuration: editForm.estimatedDuration,
        serviceMode: editForm.serviceMode,
        serviceArea: editForm.serviceArea,
        approvalStatus: "pending" as const,
      };

      const res = await fetch(`${baseUrl}/services/${editingService._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        setEditingService(null);
      } else {
        toast.error("Could not update service.");
      }
    } catch (error) {
      console.error("Failed to update service:", error);
      toast.error("Could not update service.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleAvailability = async (service: TechnicianService) => {
    const nextState = !service.isAvailable;

    try {
      const res = await fetch(
        `${baseUrl}/services/${service._id}/availability`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
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
        toast.error("Could not update availability.");
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast.error("Could not update availability.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const res = await fetch(`${baseUrl}/services/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setServices((prev) => prev.filter((item) => item._id !== id));
        toast.success("Service deleted.");
      } else {
        toast.error("Could not delete the service.");
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
                          " will be permanently removed from your services.
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
                onClick={() => setEditingService(null)}
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
                    min="1"
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

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={editForm.image}
                  onChange={handleEditChange}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
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
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-60 cursor-pointer"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
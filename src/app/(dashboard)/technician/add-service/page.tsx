"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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

export default function AddServicePage() {
  const { data: session } = useSession();
  const technicianName = session?.user?.name ?? "";
  const technicianEmail = session?.user?.email ?? "";

  const [formData, setFormData] = useState({
    title: "",
    category: "Smartphone",
    description: "",
    image: "",
    basePrice: "",
    estimatedDuration: "",
    serviceMode: "Home Visit",
    serviceArea: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

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

    if (!technicianEmail) {
      toast.error("Please wait for your session to load or log in again.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      basePrice: Number(formData.basePrice),
      estimatedDuration: formData.estimatedDuration,
      serviceMode: formData.serviceMode,
      serviceArea: formData.serviceArea,
      technicianName,
      technicianEmail,
    };

    const res = await fetch(`${baseUrl}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFeedback({
        type: "error",
        message: data.message || "Could not create service.",
      });
      return;
    }

    toast.success("Service added successfully!");
    setFeedback({
      type: "success",
      message:
        "Service submitted! It is now in your My Services list with 'pending' approval status.",
    });

    setFormData({
      title: "",
      category: "Smartphone",
      description: "",
      image: "",
      basePrice: "",
      estimatedDuration: "",
      serviceMode: "Home Visit",
      serviceArea: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <Link
              href="/dashboard/technician/my-services"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to My Services
            </Link>
            <h1 className="text-2xl font-bold text-white">Add New Service</h1>
            <p className="text-sm text-slate-400 mt-1">
              Create a repair service listing for customers to discover and book.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-[#131b2e] border border-slate-800/80 px-3.5 py-2 rounded-xl h-fit">
            Technician:{" "}
            <span className="text-slate-200 font-medium">
              {technicianName || "Loading..."}
            </span>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-teal-500/10 border-teal-500/30 text-teal-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {feedback.type === "success" && (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Service Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., iPhone Screen Replacement"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Base Price (USD) *
              </label>
              <input
                type="number"
                name="basePrice"
                required
                min="1"
                step="any"
                value={formData.basePrice}
                onChange={handleChange}
                placeholder="e.g., 85"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Estimated Duration
              </label>
              <input
                type="text"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                placeholder="e.g., 2-3 hours, 1 day"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Service Mode *
              </label>
              <select
                name="serviceMode"
                value={formData.serviceMode}
                onChange={handleChange}
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {SERVICE_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Service Area
              </label>
              <input
                type="text"
                name="serviceArea"
                value={formData.serviceArea}
                onChange={handleChange}
                placeholder="e.g., Dhanmondi, Dhaka"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Service Banner URL (ImgBB)
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://i.ibb.co/..."
              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Description (What the service includes)
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what the repair includes, parts quality, diagnostics, or warranty..."
              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
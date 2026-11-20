"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Loader2,
  X,
} from "lucide-react";
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";
  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!technicianEmail) {
      toast.error("Please wait for your session to load or log in again.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a service title.");
      return;
    }

    const numericPrice = Number(formData.basePrice);
    if (!numericPrice || Number.isNaN(numericPrice) || numericPrice <= 0) {
      toast.error("Base Price must be a positive number.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        setUploadingImage(true);
        imageUrl = await uploadToImgBB(selectedFile);
        setUploadingImage(false);
      }

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        image: imageUrl,
        basePrice: numericPrice,
        estimatedDuration: formData.estimatedDuration.trim(),
        serviceMode: formData.serviceMode,
        serviceArea: formData.serviceArea.trim(),
        technicianName,
        technicianEmail,
        approvalStatus: "pending",
        isAvailable: true,
      };

      const res = await fetch(`${baseUrl}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.message || "Could not create service.";
        toast.error(errMsg);
        setFeedback({
          type: "error",
          message: errMsg,
        });
        return;
      }

      toast.success("Service submitted! Waiting for admin approval.");
      setFeedback({
        type: "success",
        message:
          "Service submitted and is waiting for admin approval. Status is set to 'pending' and availability is active.",
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
      handleClearImage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to submit service.";
      toast.error(message);
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setUploadingImage(false);
      setSubmitting(false);
    }
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
                Technician Name
              </label>
              <input
                type="text"
                readOnly
                value={technicianName}
                placeholder="Loading technician name..."
                className="w-full bg-[#090d16]/70 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Technician Email
              </label>
              <input
                type="email"
                readOnly
                value={technicianEmail}
                placeholder="Loading technician email..."
                className="w-full bg-[#090d16]/70 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed focus:outline-none"
              />
            </div>

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
                min="0.01"
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

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Service Image
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-36 h-24 rounded-xl border border-slate-800 bg-[#090d16] flex items-center justify-center overflow-hidden shrink-0">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      title="Remove image"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/90 text-slate-200 hover:bg-rose-600 flex items-center justify-center transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    No image yet
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 bg-[#090d16] hover:bg-slate-900 border border-slate-800 hover:border-teal-500 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  Upload image
                </button>

                {selectedFile && (
                  <span className="text-xs text-teal-400 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
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
              disabled={submitting || uploadingImage}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer"
            >
              {submitting || uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              {uploadingImage
                ? "Uploading Image..."
                : submitting
                ? "Submitting..."
                : "Submit Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
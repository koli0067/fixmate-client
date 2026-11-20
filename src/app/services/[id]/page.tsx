"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Tag,
  Home,
  ShieldCheck,
} from "lucide-react";
import RepairRequestModal from "@/components/services/RepairRequestModal";
export const dynamic = "force-dynamic";

export type ServiceDetail = {
  _id: string;
  title: string;
  category: string;
  serviceMode: string;
  basePrice: number;
  serviceArea?: string;
  technicianName?: string;
  technicianEmail?: string;
  technicianPhoto?: string;
  technicianBio?: string;
  technicianArea?: string;
  description?: string;
  estimatedDuration?: string;
  duration?: string;
  image?: string;
  approvalStatus?: string;
  isAvailable?: boolean;
};

async function getServiceById(id: string): Promise<ServiceDetail | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";
  const res = await fetch(`${baseUrl}/services/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (
    !service ||
    service.approvalStatus !== "approved" ||
    service.isAvailable !== true
  ) {
    notFound();
  }

  const displayDuration =
    service.estimatedDuration || service.duration || "Flexible";
  const techName = service.technicianName || "Verified Technician";
  const techArea =
    service.technicianArea || service.serviceArea || "Local Service Area";
  const techBio =
    service.technicianBio ||
    "Certified repair specialist with experience in fast diagnostics and reliable service.";

  const initials = techName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <section className="min-h-screen bg-[#090d16] text-slate-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* বাম কলাম: সার্ভিসের ছবি, টাইটেল, ডেসক্রিপশন ও মূল তথ্য */}
          <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="bg-[#0d1322] border-b border-slate-800/80">
              <img
                src={
                  service.image ||
                  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"
                }
                alt={service.title}
                className="w-full h-72 sm:h-96 object-cover"
              />
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="space-y-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {service.title}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {service.description ||
                    "Reliable and professional repair service by verified technicians with transparent pricing."}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
                <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-teal-400" />
                    Category
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {service.category}
                  </p>
                </div>

                <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    Duration
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {displayDuration}
                  </p>
                </div>

                <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Home className="w-3.5 h-3.5 text-teal-400" />
                    Service Mode
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {service.serviceMode}
                  </p>
                </div>

                <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    Service Area
                  </div>
                  <p className="text-xs font-semibold text-white truncate">
                    {service.serviceArea || "Citywide"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ডান কলাম: Starting Price কার্ড ও Technician Summary কার্ড */}
          <div className="space-y-5">
            <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">
                  Starting price
                </p>
                <p className="text-3xl font-bold text-white">
                  ${service.basePrice}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  The technician confirms the final price when the job is done.
                  You pay only after that.
                </p>
              </div>

              <div className="pt-1">
                <RepairRequestModal
                  service={{
                    _id: String(service._id),
                    title: service.title,
                    category: service.category,
                    image: service.image,
                    basePrice: service.basePrice,
                    technicianName: service.technicianName,
                    technicianEmail: service.technicianEmail,
                  }}
                />
              </div>
            </div>

            <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <p className="text-xs font-medium text-slate-400">
                Your technician
              </p>

              <div className="flex items-center gap-3.5">
                {service.technicianPhoto ? (
                  <img
                    src={service.technicianPhoto}
                    alt={techName}
                    className="w-12 h-12 rounded-full object-cover border border-teal-500/30 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-600/20 border border-teal-500/30 text-teal-300 font-bold text-sm flex items-center justify-center shrink-0">
                    {initials || "TN"}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-white truncate">
                    {techName}
                  </h2>
                  <p className="text-xs text-slate-400 truncate">{techArea}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {techBio}
              </p>

              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Verified technician on FixMate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
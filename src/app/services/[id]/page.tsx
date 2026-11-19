import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Wrench, ShieldCheck, Clock } from "lucide-react";
import RepairRequestModal from "@/components/services/RepairRequestModal";

// The service detail is fetched from the API at request time.
export const instant = false;

export type ServiceDetail = {
  _id: string;
  title: string;
  category: string;
  serviceMode: string;
  basePrice: number;
  serviceArea?: string;
  technicianName?: string;
  technicianEmail?:string;
  description?: string;
  duration?: string;
  image?: string;
};

async function getServiceById(id: string): Promise<ServiceDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";
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

  if (!service) {
    notFound();
  }

  return (
    <section className="min-h-screen bg-[#090d16] text-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-4 sm:p-6 flex items-center justify-center bg-[#0d1322]">
            <img
              src={
                service.image ||
                "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"
              }
              alt={service.title}
              className="w-full h-72 sm:h-96 object-cover rounded-xl border border-slate-800/60"
            />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 px-3 py-1 rounded-lg border border-teal-500/20">
                  {service.category}
                </span>
                <span className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                  {service.serviceMode}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {service.title}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                {service.description ||
                  "Reliable and professional repair service by verified technicians with transparent pricing."}
              </p>

              <div className="space-y-2.5 pt-2 text-sm text-slate-300">
                {service.technicianName && (
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-teal-400" />
                    <span>Technician: {service.technicianName}</span>
                  </div>
                )}
                {service.serviceArea && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span>Service Area: {service.serviceArea}</span>
                  </div>
                )}
                {service.duration && (
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>Estimated Time: {service.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Verified & Quality Assured</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Starting Price</p>
                <p className="text-2xl font-bold text-white">
                  ${service.basePrice}
                </p>
              </div>

              {/* <Link
                href={`/booking/${service._id}`}
                className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
              >
                Book Now
              </Link> */}
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
        </div>
      </div>
    </section>
  );
}
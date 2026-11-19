// src/components/home/FeaturedServices.tsx
import Link from "next/link";

type Service = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
};

const FeaturedServices = async () => {
  let services: Service[] = [];

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";
    const res = await fetch(`${baseUrl}/services`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      services = Array.isArray(data) ? data : data.services || [];
    }
  } catch (error) {
    console.error("Failed to fetch featured services:", error);
  }

  return (
    <section className="bg-[#090d16] text-slate-100 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Services
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Trusted repair and maintenance services near you
            </p>
          </div>

          <Link
            href="/services"
            className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition"
          >
            View All →
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-[#131b2e] border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            No featured services available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <div
                key={service._id}
                className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4 hover:border-teal-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <img
                    src={
                      service.image ||
                      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"
                    }
                    alt={service.title}
                    className="w-full h-56 object-cover rounded-xl border border-slate-800/60"
                  />

                  <div className="flex items-center justify-between mt-3.5 gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-lg border border-teal-500/20">
                      {service.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {service.serviceMode}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mt-2.5 line-clamp-1">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-white">
                      ${service.basePrice}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      • {service.estimatedDuration}
                    </span>
                  </div>

                  <Link
                    href={`/services/${service._id}`}
                    className="text-sm font-semibold bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-500 transition shadow-sm"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedServices;
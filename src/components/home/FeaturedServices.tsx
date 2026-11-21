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
  technicianName?: string;
};

const FeaturedServices = async () => {
  let services: Service[] = [];

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_BASE_URL ||
      "https://fixmate-server-side.vercel.app";

    // Fetch latest 6 approved and available services from the backend
    const res = await fetch(`${baseUrl}/services?limit=6`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      services = Array.isArray(data) ? data : data.services || [];
    }
  } catch (error) {
    console.error("Failed to fetch featured services:", error);
  }

  return (
    <section className="bg-[#090d16] py-14 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Featured Services
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Trusted repair and maintenance services near you
            </p>
          </div>

          <Link
            href="/services"
            className="shrink-0 text-sm font-semibold text-teal-400 transition hover:text-teal-300"
          >
            View All →
          </Link>
        </div>

        {/* Featured Services */}
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#131b2e] p-8 text-center">
            <h3 className="text-lg font-semibold text-white">
              No Featured Services Yet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Approved repair services will appear here soon.
            </p>

            <Link
              href="/services"
              className="mt-5 inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service._id}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#131b2e] p-4 transition duration-300 hover:-translate-y-1 hover:border-teal-500/40"
              >
                {/* Service Image */}
                <div>
                  <img
                    src={
                      service.image ||
                      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"
                    }
                    alt={service.title}
                    className="h-56 w-full rounded-xl border border-slate-800/60 object-cover"
                  />

                  {/* Category and Service Mode */}
                  <div className="mt-3.5 flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                      {service.category}
                    </span>

                    <span className="text-xs text-slate-400">
                      {service.serviceMode}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="mt-2.5 line-clamp-1 text-xl font-semibold text-white">
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-400">
                    {service.description}
                  </p>

                  {/* Technician Name */}
                  <p className="mt-3 text-sm text-slate-400">
                    Technician:{" "}
                    <span className="font-medium text-slate-200">
                      {service.technicianName || "Verified Technician"}
                    </span>
                  </p>
                </div>

                {/* Price and Details Button */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3.5">
                  <div>
                    <span className="text-lg font-bold text-white">
                      ৳{service.basePrice}
                    </span>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {service.estimatedDuration}
                    </p>
                  </div>

                  <Link
                    href={`/services/${service._id}`}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500"
                  >
                    View Details
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
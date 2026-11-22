
"use client";

import { useRouter } from "next/navigation";
import {
  Smartphone,
  Laptop,
  Snowflake,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
} from "lucide-react";

export default function CategoriesSection() {
  const router = useRouter();

  const categories = [
    {
      name: "Smartphone",
      icon: Smartphone,
      description: "Screen replacement, battery & hardware fix",
      query: "Smartphone",
    },
    {
      name: "Laptop & PC",
      icon: Laptop,
      description: "OS installation, hardware repair & upgrades",
      query: "Laptop & PC",
    },
    {
      name: "AC Repair",
      icon: Snowflake,
      description: "Servicing, gas refill & cooling issues",
      query: "AC",
    },
    {
      name: "Refrigerator",
      icon: Refrigerator,
      description: "Cooling breakdown, compressor & wiring",
      query: "Refrigerator",
    },
    {
      name: "Smart TV",
      icon: Tv,
      description: "Display panel, sound & board repair",
      query: "TV",
    },
    {
      name: "Washing Machine",
      icon: WashingMachine,
      description: "Drainage, motor & spinning problems",
      query: "Washing Machine",
    },
    {
      name: "Electrical",
      icon: Zap,
      description: "Wiring, switchboard & fan installation",
      query: "Electrical",
    },
  ];

  const handleCategoryClick = (categoryQuery: string) => {
    router.push(`/services?category=${encodeURIComponent(categoryQuery)}`);
  };

  return (
    <section className="border-b border-slate-800 bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-20">
        {/* Popular Categories */}
        <div className="space-y-12">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <span className="rounded-full border border-teal-800/60 bg-teal-950/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400">
              Explore Services
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl pt-5">
              Popular Repair Categories
            </h2>

            <p className="text-sm text-slate-400 sm:text-base">
              Click on any category below to find technicians for your specific
              device or appliance.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const IconComponent = cat.icon;

              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryClick(cat.query)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-left transition-all duration-300 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-950/30"
                >
                  <div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 transition duration-300 group-hover:bg-teal-600 group-hover:text-white">
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <h3 className="mb-1.5 text-lg font-bold text-white transition group-hover:text-teal-300">
                      {cat.name}
                    </h3>

                    <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-6 text-xs font-semibold text-teal-400 transition-transform group-hover:translate-x-1">
                    Explore Services
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Why Choose FixMate */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60 p-8 sm:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Heading */}
            <div className="space-y-4 lg:col-span-5">
              <span className="rounded-full border border-amber-800/60 bg-amber-950/50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                Why Choose FixMate
              </span>

              <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Reliable Repair Services You Can Trust
              </h3>

              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Find skilled technicians for your repair needs with a simple
                booking process, clear service details, and convenient repair
                options.
              </p>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
              {/* Trust Point 1 */}
              <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <h4 className="font-bold text-white">Skilled Technicians</h4>

                <p className="text-xs leading-relaxed text-slate-400">
                  Find professionals for different repair services.
                </p>
              </div>

              {/* Trust Point 2 */}
              <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Users className="h-5 w-5" />
                </div>

                <h4 className="font-bold text-white">Easy Booking</h4>

                <p className="text-xs leading-relaxed text-slate-400">
                  Request a repair service without hassle.
                </p>
              </div>

              {/* Trust Point 3 */}
              <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <h4 className="font-bold text-white">Pay After Service</h4>

                <p className="text-xs leading-relaxed text-slate-400">
                  Complete payment after your repair is finished.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

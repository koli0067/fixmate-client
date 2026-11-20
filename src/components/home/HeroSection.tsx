
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Clock,
} from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push("/services");
    }
  };

  return (
    <section className="overflow-hidden border-b border-slate-800 bg-slate-900 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">

        {/* Main Hero */}
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Left Content */}
          <div className="space-y-7">

            <span className="inline-block rounded-full border border-teal-700/60 bg-teal-900/50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-teal-300">
              FixMate Repair Platform
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
              Broken Device?
              <br />
              Get It Fixed by
              <span className="text-teal-400">
                {" "}Verified Technicians
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Book expert technicians for smartphones, laptops, AC,
              and home appliances. Reliable repairs, transparent pricing,
              and service you can trust.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search AC, Laptop, Smartphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-12 pr-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <button
                type="submit"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-700"
              >
                Search Services
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="text-sm text-slate-400">
              Find trusted technicians and get your device fixed hassle-free.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative mx-auto w-full max-w-xl">

            {/* Background decoration */}
            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />

            {/* Image Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800 p-2 shadow-2xl">

              <img
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1000&q=85"
                alt="Technician repairing electronic devices"
                className="h-[300px] w-full rounded-2xl object-cover sm:h-[380px] lg:h-[440px]"
              />

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20">
                    <ShieldCheck className="h-6 w-6 text-teal-400" />
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      Trusted Repair Experts
                    </p>
                    <p className="text-sm text-slate-400">
                      Quality service you can rely on
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Trust Cards */}
        <div className="mt-16 grid grid-cols-1 gap-4 border-t border-slate-800 pt-8 sm:grid-cols-3">

          {/* Card 1 */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-teal-400" />

            <div>
              <p className="text-sm font-bold text-white">
                Verified Experts
              </p>
              <p className="text-xs text-slate-400">
                Trusted technicians
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <Clock className="h-6 w-6 shrink-0 text-teal-400" />

            <div>
              <p className="text-sm font-bold text-white">
                Fast Response
              </p>
              <p className="text-xs text-slate-400">
                Convenient repair service
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <Wrench className="h-6 w-6 shrink-0 text-teal-400" />

            <div>
              <p className="text-sm font-bold text-white">
                Pay After Service
              </p>
              <p className="text-xs text-slate-400">
                Customer-first experience
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

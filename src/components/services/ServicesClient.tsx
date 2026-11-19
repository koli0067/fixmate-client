// src/components/services/ServicesClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import type { ServiceItem } from "@/app/services/page";

const CATEGORIES = [
  "All",
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

const SERVICE_MODES = ["All", "Home Visit", "Shop Drop-off"];

type Props = {
  initialServices: ServiceItem[];
  initialFilters: {
    search: string;
    category: string;
    serviceMode: string;
    sort: string;
  };
};

export default function ServicesClient({
  initialServices,
  initialFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialFilters.search);
  const [category, setCategory] = useState(initialFilters.category);
  const [serviceMode, setServiceMode] = useState(initialFilters.serviceMode);
  const [sort, setSort] = useState(initialFilters.sort);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "All");
    setServiceMode(searchParams.get("serviceMode") || "All");
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  const applyFilters = (next: {
    search: string;
    category: string;
    serviceMode: string;
    sort: string;
  }) => {
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.category && next.category !== "All") {
      params.set("category", next.category);
    }
    if (next.serviceMode && next.serviceMode !== "All") {
      params.set("serviceMode", next.serviceMode);
    }
    if (next.sort && next.sort !== "newest") {
      params.set("sort", next.sort);
    }

    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search, category, serviceMode, sort });
  };

  const handleReset = () => {
    setSearch("");
    setCategory("All");
    setServiceMode("All");
    setSort("newest");
    router.push("/services");
  };

  return (
    <section className="min-h-screen bg-[#090d16] text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Browse Repair Services
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Find verified technicians for your device and home appliances
          </p>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by service title or category..."
                className="w-full bg-[#090d16] border border-slate-800 text-sm text-slate-100 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                applyFilters({ search, category: val, serviceMode, sort });
              }}
              className="bg-[#090d16] border border-slate-800 text-sm text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>

            <select
              value={serviceMode}
              onChange={(e) => {
                const val = e.target.value;
                setServiceMode(val);
                applyFilters({ search, category, serviceMode: val, sort });
              }}
              className="bg-[#090d16] border border-slate-800 text-sm text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
            >
              {SERVICE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode === "All" ? "All Service Modes" : mode}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => {
                  const val = e.target.value;
                  setSort(val);
                  applyFilters({ search, category, serviceMode, sort: val });
                }}
                className="flex-1 bg-[#090d16] border border-slate-800 text-sm text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <button
                type="button"
                onClick={handleReset}
                title="Reset filters"
                className="bg-[#090d16] border border-slate-800 hover:border-slate-700 text-slate-300 px-3 rounded-xl transition flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {initialServices.length === 0 ? (
          <div className="bg-[#131b2e] border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <p className="text-slate-300 font-medium">
              No matching repair services found.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialServices.map((service) => (
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
                    className="w-full h-48 object-cover rounded-xl border border-slate-800/60"
                  />

                  <div className="flex items-center justify-between mt-3 gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-lg border border-teal-500/20">
                      {service.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {service.serviceMode}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-white mt-2.5 line-clamp-1">
                    {service.title}
                  </h2>

                  {service.serviceArea && (
                    <p className="text-xs text-slate-400 mt-1">
                      Area: {service.serviceArea}
                    </p>
                  )}

                  {service.technicianName && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Technician: {service.technicianName}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    ${service.basePrice}
                  </span>

                  <Link
                    href={`/services/${service._id}`}
                    className="text-xs font-semibold bg-teal-600 text-white px-3.5 py-2 rounded-xl hover:bg-teal-500 transition"
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
}
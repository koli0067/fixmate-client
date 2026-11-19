// src/components/home/HeroSection.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, Wrench, Clock } from "lucide-react";

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
    <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        
        {/* রিকোয়ারমেন্ট অনুযায়ী ক্লিয়ার ও প্রিমিয়াম হেডলাইন */}
        <div className="space-y-4">
          <span className="inline-block bg-teal-900/50 border border-teal-700/60 text-teal-300 text-xs font-semibold px-3.5 py-1.5 rounded-full tracking-wide uppercase">
            FixMate Repair Platform
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Broken Device? Get It Fixed by <span className="text-teal-400">Verified Technicians</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Book expert local technicians for AC, smartphone, home appliances, and electronics repair right at your doorstep. Transparent pricing and guaranteed service.
          </p>
        </div>

        {/* রিকোয়ারমেন্ট অনুযায়ী সার্চ বক্স ও CTA যা /services এ নিয়ে যায় */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for AC, Refrigerator, Smartphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-teal-900/20"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* ছোট একটি ট্রাস্ট বার বা ব্যাজ সেকশন */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 max-w-3xl mx-auto border-t border-slate-800 text-left">
          <div className="flex items-center gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Verified Experts</p>
              <p className="text-xs text-slate-400">Background checked</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
            <Clock className="w-6 h-6 text-teal-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Fast Response</p>
              <p className="text-xs text-slate-400">Doorstep service</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
            <Wrench className="w-6 h-6 text-teal-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Secure Work</p>
              <p className="text-xs text-slate-400">Pay after completion</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
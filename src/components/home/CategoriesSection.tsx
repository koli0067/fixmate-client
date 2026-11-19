// src/components/home/CategoriesSection.tsx
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
  Award
} from "lucide-react";

export default function CategoriesSection() {
  const router = useRouter();

  // ক্যাটাগরি লিস্ট (রিকোয়ারমেন্ট অনুযায়ী)
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
      query: "Laptop",
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
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* অংশ ১: পপুলার ক্যাটাগরিজ */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-teal-400 font-semibold text-xs uppercase tracking-wider bg-teal-950/80 px-3.5 py-1.5 rounded-full border border-teal-800/60">
              Explore Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Popular Repair Categories
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Click on any category below to instantly find expert technicians for your specific device.
            </p>
          </div>

          {/* ক্যাটাগরি কার্ড গ্রিড */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, index) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleCategoryClick(cat.query)}
                  className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-teal-950/30 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-teal-300 transition">
                      {cat.name}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold pt-6 mt-4 border-t border-slate-800 group-hover:translate-x-1 transition-transform">
                    <span>Explore Services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* অংশ ২: প্ল্যাটফর্ম স্ট্যাটস এবং হোয়াই চুজ আস (Why Choose Us) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* বাম দিক: হেডলাইন ও বর্ণনা */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider bg-amber-950/50 px-3.5 py-1.5 rounded-full border border-amber-800/60">
                Why Choose FixMate
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Trusted by Thousands for Reliable Home Repairs
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                We ensure top-quality repair services right at your doorstep with verified experts, complete transparency, and post-service security.
              </p>
            </div>

            {/* ডান দিক: স্ট্যাটস ও ট্রাস্ট পয়েন্ট কার্ড */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-black text-white">100%</h4>
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide">Verified Technicians</p>
                <p className="text-[11px] text-slate-400">Background checked and skilled</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-black text-white">5,000+</h4>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Jobs Completed</p>
                <p className="text-[11px] text-slate-400">Successfully repaired & delivered</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-black text-white">Pay After</h4>
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide">Service Completion</p>
                <p className="text-[11px] text-slate-400">Inspect first, then pay securely</p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
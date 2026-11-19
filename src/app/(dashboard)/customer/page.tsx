// src/app/(dashboard)/customer/page.tsx
"use client";

import { ShoppingBag, Clock, CheckCircle2, ArrowUpRight, Wrench } from "lucide-react";
import Link from "next/link";

export default function CustomerOverviewPage() {
  return (
    <div className="space-y-8">
      {/* স্ট্যাটাস কার্ডসমূহ (৪টি কার্ড - স্ক্রিনশটের স্টাইলে) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-[#131b2e] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Requests</p>
            <h3 className="text-3xl font-bold text-white mt-2">04</h3>
          </div>
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131b2e] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-3xl font-bold text-white mt-2">02</h3>
          </div>
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131b2e] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Jobs</p>
            <h3 className="text-3xl font-bold text-white mt-2">05</h3>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131b2e] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</p>
            <h3 className="text-3xl font-bold text-white mt-2">$120</h3>
          </div>
          <div className="bg-teal-500/10 text-teal-400 p-3 rounded-xl border border-teal-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recent Activity Section */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
          <Link href="/customer/bookings" className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1">
            View All Activity <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="bg-[#090d16] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500/10 text-teal-400 p-2.5 rounded-lg border border-teal-500/20">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Your repair request for <span className="text-white font-semibold">iPhone Screen Replacement</span> was accepted.
                </p>
                <span className="text-xs text-slate-500">2 hours ago</span>
              </div>
            </div>
            <span className="text-xs bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-md font-medium border border-teal-500/20">
              Accepted
            </span>
          </div>

          <div className="bg-[#090d16] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-lg border border-blue-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  New service booked: <span className="text-white font-semibold">AC General Servicing</span>.
                </p>
                <span className="text-xs text-slate-500">Yesterday</span>
              </div>
            </div>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md font-medium border border-blue-500/20">
              Requested
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
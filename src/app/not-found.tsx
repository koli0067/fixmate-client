import Link from "next/link";
import { Wrench, Hammer, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-slate-800/90 rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-xl">
        {/* Repair / Tools Theme Visual */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center">
          <Wrench className="w-10 h-10 text-teal-400 -rotate-12" />
          <div className="w-9 h-9 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-center absolute -bottom-2 -right-2">
            <Hammer className="w-4 h-4 text-amber-400 rotate-12" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
            Error 404
          </p>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Looks like this route is still under repair or the link you followed
            doesn't exist. Let's get you back to a working bench.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
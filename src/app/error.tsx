"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-rose-500/30 rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Something Went Wrong
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error?.message ||
              "An unexpected error occurred while loading this page. Please try again."}
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-slate-500 pt-1">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-5 rounded-xl transition"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
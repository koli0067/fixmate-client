import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center space-y-5">
        <XCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white">Payment Cancelled</h1>
          <p className="text-sm text-slate-400">
            Your payment was cancelled. No charges were made.
          </p>
        </div>
        <Link
          href="/customer/bookings"
          className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Link>
      </div>
    </div>
  );
}
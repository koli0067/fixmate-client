import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        <p className="text-sm text-slate-400">Loading FixMate...</p>
      </div>
    </div>
  );
}
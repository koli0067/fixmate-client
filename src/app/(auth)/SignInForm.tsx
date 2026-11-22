"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signIn, useSession } from "@/lib/auth-client";
import { clearJwtToken, getValidToken } from "@/lib/jwt-token";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Wrench, Eye, EyeOff } from "lucide-react";

function getSafeCallbackUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return null;
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeCallbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const { data: session, isPending } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasRedirectedRef = useRef(false);

  const navigateAfterAuth = useCallback(
    (role?: string) => {
      if (hasRedirectedRef.current) return;
      hasRedirectedRef.current = true;

      if (safeCallbackUrl) {
        router.replace(safeCallbackUrl);
        return;
      }

      const normalizedRole = (role || "customer").toLowerCase();
      if (normalizedRole === "admin") {
        router.replace("/dashboard/admin");
      } else if (normalizedRole === "technician") {
        router.replace("/dashboard/technician");
      } else {
        router.replace("/dashboard/customer");
      }
    },
    [router, safeCallbackUrl]
  );

  // আগে থেকেই লগইন করা থাকলে ড্যাশবোর্ডে বা আগের পেজে পাঠাবে + টোকেন সিঙ্ক রাখবে
  useEffect(() => {
    if (isPending || !session?.user || hasRedirectedRef.current) return;

    let active = true;

    const redirectExisting = async () => {
      await getValidToken(
        session.user.email || "",
        session.user.name || ""
      );
      if (!active || hasRedirectedRef.current) return;

      const userRole =
        (session.user as { role?: string })?.role || "customer";
      navigateAfterAuth(userRole);
    };

    redirectExisting();

    return () => {
      active = false;
    };
  }, [isPending, navigateAfterAuth, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || hasRedirectedRef.current) return;

    setLoading(true);
    clearJwtToken();

    try {
      await signIn.email(
        {
          email: email.trim(),
          password,
        },
        {
          onSuccess: async (ctx) => {
            const signedInEmail = ctx.data?.user?.email || email.trim();
            const signedInName = ctx.data?.user?.name || "";

            await getValidToken(signedInEmail, signedInName);

            setLoading(false);
            toast.success("Signed in successfully!");

            const userRole =
              (ctx.data?.user as { role?: string })?.role || "customer";
            navigateAfterAuth(userRole);
          },
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message || "Invalid email or password.");
          },
        }
      );
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-slate-100 px-4 py-12">
      <div className="max-w-md w-full bg-[#131b2e] p-8 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2.5 mb-2 group">
            <div className="bg-teal-600 text-white p-2 rounded-xl group-hover:bg-teal-500 transition shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Fix<span className="text-teal-400">Mate</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white mt-2">Welcome Back</h1>
          <p className="text-sm text-slate-400">
            Sign in to manage your repairs & services
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-500 transition disabled:opacity-50 shadow-sm mt-2 cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-teal-400 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
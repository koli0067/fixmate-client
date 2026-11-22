"use client";

import { useEffect, useState } from "react";
import { signUp, useSession } from "@/lib/auth-client";
import { clearJwtToken, getValidToken } from "@/lib/jwt-token";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Wrench, User, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  // আগে থেকেই লগইন করা থাকলে তার নিজের ড্যাশবোর্ডে পাঠাবে
  useEffect(() => {
    if (isPending || !session?.user) return;

    const userRole = (session.user as { role?: string })?.role;
    if (userRole === "admin") {
      router.replace("/dashboard/admin");
    } else if (userRole === "technician") {
      router.replace("/dashboard/technician");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [isPending, router, session]);

  const validatePassword = (pass: string) => {
    if (pass.length < 6) return "Password must be at least 6 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    return "";
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPasswordError(validatePassword(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validatePassword(password);
    if (err) {
      setPasswordError(err);
      return;
    }

    setLoading(true);
    clearJwtToken();

    try {
      await signUp.email(
        {
          email,
          password,
          name,
          image: "",
          role,
          phone: "",
          area: "",
          bio: "",
        },
        {
          onSuccess: async () => {
            await getValidToken(email, name);
            setLoading(false);
            toast.success("Account created successfully! Welcome to FixMate.");

            if (role === "customer") {
              router.replace("/dashboard/customer");
            } else if (role === "technician") {
              router.replace("/dashboard/technician");
            }
          },
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message || "Failed to create account.");
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
          <h1 className="text-xl font-bold text-white mt-2">Create an Account</h1>
          <p className="text-sm text-slate-400">Join FixMate as a customer or technician</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Koli Khatun"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0d1322] border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-[#0d1322] border rounded-xl text-white placeholder:text-slate-500 outline-none transition pr-10 ${
                  passwordError
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500"
                    : "border-slate-700/80 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError ? (
              <p className="text-xs text-rose-400 mt-1.5 font-medium">{passwordError}</p>
            ) : (
              <p className="text-xs text-slate-400 mt-1.5">
                At least 6 characters, 1 uppercase & 1 lowercase letter.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">I want to join as a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`p-3.5 border rounded-xl flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  role === "customer"
                    ? "border-teal-500 bg-teal-500/15 text-teal-300 ring-1 ring-teal-500"
                    : "bg-[#0d1322] border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <User className={`w-5 h-5 ${role === "customer" ? "text-teal-400" : "text-slate-400"}`} />
                <span className="text-sm font-semibold">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("technician")}
                className={`p-3.5 border rounded-xl flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  role === "technician"
                    ? "border-teal-500 bg-teal-500/15 text-teal-300 ring-1 ring-teal-500"
                    : "bg-[#0d1322] border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <ShieldCheck className={`w-5 h-5 ${role === "technician" ? "text-teal-400" : "text-slate-400"}`} />
                <span className="text-sm font-semibold">Technician</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!passwordError}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-teal-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
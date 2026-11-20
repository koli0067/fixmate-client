
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { 
  Wrench, 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Search,
  Bell,
  Mail
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = (session?.user as { role?: string })?.role || "customer";
  const roleDashboard =
    userRole === "admin"
      ? "/admin"
      : userRole === "technician"
        ? "/technician"
        : "/customer";

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/sign-in");
      return;
    }

    const routeRole = pathname.split("/")[1];
    if (
      (routeRole === "admin" || routeRole === "technician" || routeRole === "customer") &&
      routeRole !== userRole
    ) {
      router.replace(roleDashboard);
    }
  }, [isPending, pathname, roleDashboard, router, session, userRole]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-300">
        Loading dashboard...
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully!");
          router.push("/sign-in");
          router.refresh();
        },
        onError: () => {
          toast.error("Failed to sign out.");
        },
      },
    });
  };

  // রোল অনুযায়ী সাইডবার মেনু
  const getSidebarLinks = () => {
    if (userRole === "admin") {
      return [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Manage Users", href: "/admin/users", icon: ShoppingBag },
        { name: "Service Approval", href: "/admin/services", icon: Wrench },
        { name: "All Bookings", href: "/admin/bookings", icon: ShoppingBag },
        { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
      ];
    } else if (userRole === "technician") {
      return [
        { name: "Overview", href: "/technician", icon: LayoutDashboard },
        { name: "Add Service", href: "/technician/add-service", icon: Wrench },
        { name: "My Services", href: "/technician/my-services", icon: ShoppingBag },
        { name: "Manage Requests", href: "/technician/requests", icon: ShoppingBag },
      ];
    } else {
      return [
        { name: "Overview", href: "/customer", icon: LayoutDashboard },
        { name: "My Bookings", href: "/customer/bookings", icon: ShoppingBag },
        { name: "Payment History", href: "/customer/payments", icon: CreditCard },
      ];
    }
  };

  const links = getSidebarLinks();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      
      {/* মোবাইল ওভারলে */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* সাইডবার (Sidebar) - স্ক্রিনশটের মতো ডার্ক স্টাইল */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0d1322] border-r border-slate-800/80 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 space-y-6">
          {/* লোগো */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-teal-600 text-white p-2 rounded-xl group-hover:bg-teal-700 transition shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Fix<span className="text-teal-500">Mate</span>
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* ইউজার পোর্টাল কার্ড */}
          <div className="bg-[#131b2e] border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3">
            <img
              src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt="User"
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{session?.user?.name || "User"}</p>
              <p className="text-[11px] text-teal-400 font-medium capitalize">
                {userRole} Portal
              </p>
            </div>
          </div>

          {/* নেভিগেশন মেনু */}
          <nav className="space-y-1.5 pt-2">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname === "/profile"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>

        {/* নিচের লগআউট ও হোম বাটন */}
        <div className="p-6 border-t border-slate-800/80 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* মূল কন্টেন্ট এরিয়া */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#090d16]">
        
        {/* টপ বার (Top Bar) */}
        <header className="h-20 bg-[#090d16]/80 border-b border-slate-800/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* সার্চ বার */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services or bookings..."
                className="w-full bg-[#131b2e] border border-slate-800 text-sm text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* টপ রাইট আইকনসমূহ */}
          <div className="flex items-center gap-4">
            <button className="bg-[#131b2e] border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white transition relative">
              <Mail className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
            </button>
            <button className="bg-[#131b2e] border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
            </button>
            <img
              src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt="User"
              className="w-9 h-9 rounded-full object-cover border border-teal-500"
            />
          </div>
        </header>

        {/* পেজ কন্টেন্ট */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
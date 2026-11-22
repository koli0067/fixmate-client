"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { clearJwtToken, getValidToken } from "@/lib/jwt-token";
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
  Mail,
} from "lucide-react";
import { toast } from "sonner";

const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name ?? "";
  const userRole = (session?.user as { role?: string })?.role || "customer";

  const [displayName, setDisplayName] = useState(userName);
  const [displayImage, setDisplayImage] = useState(session?.user?.image ?? "");

  useEffect(() => {
    setDisplayName((prev) => prev || userName);
    setDisplayImage((prev) => prev || session?.user?.image || "");
  }, [userName, session?.user?.image]);

  useEffect(() => {
    if (!userEmail) return;

    let active = true;

    const syncUserFromDb = async () => {
      try {
        const token = await getValidToken(userEmail, userName);
        const res = await fetch(
          `${baseUrl}/users/${encodeURIComponent(userEmail)}`,
          {
            cache: "no-store",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok || !active) return;
        const data = await res.json();
        if (!active) return;

        if (data?.name) setDisplayName(data.name);
        if (typeof data?.image === "string" && data.image.trim()) {
          setDisplayImage(data.image.trim());
        }
      } catch {
        // Ignore network sync errors; session/event still works
      }
    };

    void syncUserFromDb();

    return () => {
      active = false;
    };
  }, [userEmail, userName]);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        name?: string;
        image?: string;
      }>;
      if (customEvent.detail?.name) {
        setDisplayName(customEvent.detail.name);
      }
      if (typeof customEvent.detail?.image === "string") {
        setDisplayImage(customEvent.detail.image);
      }
    };

    window.addEventListener("fixmate:profile-updated", onProfileUpdated);
    return () =>
      window.removeEventListener("fixmate:profile-updated", onProfileUpdated);
  }, []);

  const roleDashboard =
    userRole === "admin"
      ? "/dashboard/admin"
      : userRole === "technician"
        ? "/dashboard/technician"
        : "/dashboard/customer";

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const routeRole = pathname.split("/")[2];
    if (
      (routeRole === "admin" ||
        routeRole === "technician" ||
        routeRole === "customer") &&
      routeRole !== userRole
    ) {
      router.replace(roleDashboard);
    }
  }, [isPending, pathname, roleDashboard, router, session, userRole]);

  useEffect(() => {
    if (isPending || !userEmail) return;
    void getValidToken(userEmail, displayName || userName);
  }, [isPending, userEmail, displayName, userName]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-300">
        Loading dashboard...
      </div>
    );
  }

  const handleSignOut = async () => {
    clearJwtToken();
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

  const getSidebarLinks = () => {
    if (userRole === "admin") {
      return [
        { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
        { name: "Manage Users", href: "/dashboard/admin/users", icon: ShoppingBag },
        { name: "Service Approval", href: "/dashboard/admin/services", icon: Wrench },
        { name: "All Bookings", href: "/dashboard/admin/bookings", icon: ShoppingBag },
        { name: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
      ];
    } else if (userRole === "technician") {
      return [
        { name: "Overview", href: "/dashboard/technician", icon: LayoutDashboard },
        { name: "Add Service", href: "/dashboard/technician/add-service", icon: Wrench },
        { name: "My Services", href: "/dashboard/technician/my-services", icon: ShoppingBag },
        { name: "Manage Requests", href: "/dashboard/technician/requests", icon: ShoppingBag },
      ];
    } else {
      return [
        { name: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
        { name: "My Bookings", href: "/dashboard/customer/bookings", icon: ShoppingBag },
        { name: "Payment History", href: "/dashboard/customer/payments", icon: CreditCard },
      ];
    }
  };

  const links = getSidebarLinks();
  const resolvedName = displayName || userName || "User";
  const resolvedImage =
    displayImage || session?.user?.image || FALLBACK_AVATAR;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0d1322] border-r border-slate-800/80 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="p-6 space-y-6">
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

          <div className="bg-[#131b2e] border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3">
            <img
              src={resolvedImage}
              alt={resolvedName}
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {resolvedName}
              </p>
              <p className="text-[11px] text-teal-400 font-medium capitalize">
                {userRole} Portal
              </p>
            </div>
          </div>

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
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname === "/dashboard/profile"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>

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

      <div className="flex-1 flex flex-col min-w-0 bg-[#090d16]">
        <header className="h-20 bg-[#090d16]/80 border-b border-slate-800/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services or bookings..."
                className="w-full bg-[#131b2e] border border-slate-800 text-sm text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-[#131b2e] border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white transition relative">
              <Mail className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
            </button>
            <button className="bg-[#131b2e] border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2.5">
              <img
                src={resolvedImage}
                alt={resolvedName}
                className="w-9 h-9 rounded-full object-cover border border-teal-500 shrink-0"
              />
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-semibold text-white">
                  {resolvedName}
                </p>
                <p className="text-[11px] font-medium text-teal-400 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
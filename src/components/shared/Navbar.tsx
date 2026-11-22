"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Wrench, Menu, X, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [displayImage, setDisplayImage] = useState(session?.user?.image || "");

  useEffect(() => {
    setDisplayName(session?.user?.name || "");
    setDisplayImage(session?.user?.image || "");
  }, [session?.user?.name, session?.user?.image]);

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

  // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ করার জন্য
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setIsOpen(false);
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

  const getDashboardRoute = (role?: string) => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "technician") return "/dashboard/technician";
    return "/dashboard/customer";
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "How It Works / About", href: "/about" },
  ];

  const userRole = (session?.user as { role?: string })?.role || "customer";
  const resolvedName = displayName || session?.user?.name || "User";
  const resolvedImage =
    displayImage ||
    session?.user?.image ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";

  return (
    <nav className="sticky top-0 z-50 bg-[#131b2e]/90 text-slate-100 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-teal-600 text-white p-2 rounded-xl group-hover:bg-teal-500 transition shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Fix<span className="text-teal-400">Mate</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-teal-400 font-semibold border-b-2 border-teal-400 py-5"
                      : "text-slate-300 hover:text-teal-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Auth / User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {isPending ? (
              <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />
            ) : session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 focus:outline-none p-1 rounded-full hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
                >
                  <img
                    src={resolvedImage}
                    alt={resolvedName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-teal-500"
                  />
                </button>

                {/* Dropdown Menu (সব স্ক্রিনে নাম ও Role Badge দেখাবে) */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#131b2e] rounded-2xl shadow-xl border border-slate-800 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {resolvedName}
                        </p>
                        <span className="text-[10px] uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                          {userRole}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {session.user.email}
                      </p>
                    </div>

                    <Link
                      href={getDashboardRoute(userRole)}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-teal-500/10 hover:text-teal-400 transition font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 text-teal-400" />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-teal-500/10 hover:text-teal-400 transition font-medium"
                    >
                      <Settings className="w-4 h-4 text-teal-400" />
                      Update Profile
                    </Link>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-slate-200 hover:text-teal-400 px-4 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-semibold bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-500 shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
              className="text-slate-200 hover:text-teal-400 p-2 rounded-lg focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#131b2e] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive
                    ? "bg-teal-500/15 text-teal-400 font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-teal-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="border-t border-slate-800 pt-3 mt-2">
            {session?.user ? (
              <div className="space-y-2">
                {/* User Info & Role Badge */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <img
                    src={resolvedImage}
                    alt={resolvedName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {resolvedName}
                      </p>
                      <span className="text-[10px] uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
                        {userRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{session.user.email}</p>
                  </div>
                </div>

                <Link
                  href={getDashboardRoute(userRole)}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-semibold text-teal-400 bg-teal-500/15"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-teal-400"
                >
                  <Settings className="w-4 h-4 text-teal-400" />
                  Update Profile
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-base font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 border border-teal-500 text-teal-400 rounded-xl font-semibold hover:bg-teal-500/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-teal-600 text-white rounded-xl font-semibold shadow-sm hover:bg-teal-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
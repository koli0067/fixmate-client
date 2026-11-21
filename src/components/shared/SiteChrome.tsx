"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dashboardRoots = ["/customer", "/technician", "/admin", "/profile"];
  const isDashboard = dashboardRoots.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
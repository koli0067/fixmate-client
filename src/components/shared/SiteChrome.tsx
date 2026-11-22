"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

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
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SiteChrome from "@/components/shared/SiteChrome";
import { Suspense } from "react";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixMate | Smart Repair & Maintenance Services",
  description: "Book reliable technicians for fast and transparent repair services.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Toaster position="top-right" richColors />
        <Suspense fallback={null}>
          <SiteChrome>{children}</SiteChrome>
        </Suspense>
      </body>
    </html>
  );
}
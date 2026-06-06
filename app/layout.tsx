import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RUWAN BRASS | Enterprise Distribution Operating System (EDOS)",
  description: "Smart Distribution. Real-Time Intelligence. Infinite Growth. Build high-performing CRM, SCM, Logistics, and Accounting tools for hardware distribution.",
  keywords: ["ERP", "EDOS", "Brass Distribution", "Real-Time Tracking", "SaaS ERP", "Logistics Software", "Supply Chain"],
  authors: [{ name: "Ruwan Brass Enterprise" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-[#030303] text-zinc-100 flex flex-col font-sans select-none antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

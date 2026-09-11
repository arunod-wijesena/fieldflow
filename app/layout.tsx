import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ),

  title: {
    default: "FieldFlow",
    template: "%s | FieldFlow",
  },

  description:
    "A secure Field Service Management System for Customers, Technicians, Work Orders, progress, completion, and operational history.",

  applicationName: "FieldFlow",

  keywords: [
    "FieldFlow",
    "field service management",
    "work order management",
    "technician management",
    "service operations",
  ],

  authors: [
    {
      name: "FieldFlow",
    },
  ],

  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },

  openGraph: {
    title: "FieldFlow",
    description:
      "Secure field-service operations from assignment through completion.",
    type: "website",
    siteName: "FieldFlow",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
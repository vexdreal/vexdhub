import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vexdhub.vercel.app"),

  title: {
    default: "VexdHub",
    template: "%s | VexdHub",
  },

  description:
    "VexdHub - Premium License Management Platform",

  applicationName: "VexdHub",

  keywords: [
    "VexdHub",
    "License",
    "License System",
    "Key System",
    "Premium",
    "Dashboard",
    "Admin Panel",
    "License Manager",
  ],

  authors: [
    {
      name: "VexdReal",
    },
  ],

  creator: "VexdReal",
  publisher: "VexdReal",

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/branding/favicon.ico",
    shortcut: "/branding/favicon.ico",
    apple: "/branding/apple-touch-icon.png",
  },

  openGraph: {
    title: "VexdHub",
    description:
      "Premium License Management Platform",
    siteName: "VexdHub",
    type: "website",
    locale: "id_ID",
  },

  twitter: {
    card: "summary_large_image",
    title: "VexdHub",
    description:
      "Premium License Management Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
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
    default: "VexdHub • Smart License System",
    template: "%s • VexdHub",
  },

  description:
    "VexdHub adalah platform pengelolaan license dan key system modern.",

  applicationName: "VexdHub",

  keywords: [
    "VexdHub",
    "License System",
    "Key System",
    "License Manager",
    "Admin Dashboard",
    "VexdReal",
  ],

  authors: [
    {
      name: "VexdReal",
    },
  ],

  creator: "VexdReal",
  publisher: "VexdReal",

  robots: {
    index: false,
    follow: false,
  },

  icons: {
    icon: [
      {
        url: "/branding/favicon.ico",
        sizes: "any",
      },
      {
        url: "/branding/logo.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    shortcut: "/branding/favicon.ico",

    apple: [
      {
        url: "/branding/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    title: "VexdHub • Smart License System",
    description:
      "Platform modern untuk mengelola license, device, activation, dan key system.",
    siteName: "VexdHub",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/branding/logo.png",
        width: 512,
        height: 512,
        alt: "VexdHub Logo",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "VexdHub • Smart License System",
    description:
      "Platform modern untuk mengelola license dan key system.",
    images: ["/branding/logo.png"],
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
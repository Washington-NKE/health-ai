import type React from "react";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "@/components/root-layout-client";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Med AI",
  description: "AI-powered healthcare assistant ",
  creator: "RiverPen Enterprises",
  keywords: [
    "AI",
    "Healthcare",
    "Assistant",
    "Medical",
    "HealthTech",
    "AI Healthcare",
    "Virtual Health Assistant",
    "Medical AI",
    "Health Assistant",
    "AI Doctor",
    "Telemedicine",
    "HealthTech Solutions",
    "AI Health Advisor",
    "Medical Technology",
    "Healthcare Innovation",
  ],
  openGraph: {
    title: "Med AI",
    description: "AI-powered healthcare assistant ",
    url: "https://med-ai.vercel.app/",
    siteName: "Med AI",
    images: [
      {
        url: "https://med-ai.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Med AI - AI-powered healthcare assistant ",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Med AI",
    description: "AI-powered healthcare assistant ",
    images: ["https://med-ai.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}

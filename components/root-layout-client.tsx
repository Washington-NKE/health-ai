"use client";

import { SessionProvider } from "@/components/session-provider";
import { ChatWidget } from "@/components/ChatWidget";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <ChatWidget />
      {children}
      <Toaster />
    </SessionProvider>
  );
}

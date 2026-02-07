"use client";

import { ChatInterface } from "@/components/chat-interface";

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-slate-900">
              AI Health Assistant
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Get instant help with appointments, prescriptions, and billing
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

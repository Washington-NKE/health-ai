"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
}

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      onError: (err) => {
        if (
          err.message?.includes("Authentication") ||
          err.message?.includes("401")
        ) {
          setIsAuthError(true);
        }
      },
    });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Hide widget on /chat page or if auth error
  if (pathname === "/chat" || isAuthError) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Trigger Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <CardTitle className="text-base font-semibold">
                AI Health Assistant
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-800 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            <ScrollArea ref={scrollRef} className="h-full p-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-slate-600 mb-2 font-medium">
                    Staff Data Assistant
                  </p>
                  <p className="text-xs text-slate-500">
                    Query patient data, view appointments, check billing, and
                    manage healthcare records.
                  </p>
                </div>
              )}
              {(messages as ChatMessage[]).map((m: ChatMessage) => (
                <div
                  key={m.id}
                  className={`mb-4 flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white border-2 border-blue-100 shadow-sm">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="mb-2 last:mb-0" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc pl-4 mb-2 space-y-1"
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="list-decimal pl-4 mb-2 space-y-1"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-xs" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong
                                className="font-semibold text-slate-900"
                                {...props}
                              />
                            ),
                            code: ({ node, ...props }) => (
                              <code
                                className="bg-slate-100 px-1 py-0.5 rounded text-xs"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4 gap-2 animate-in slide-in-from-bottom-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white border-2 border-blue-100 shadow-sm">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-none px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                className="flex-1 focus-visible:ring-blue-600 bg-slate-50 border-slate-200 text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

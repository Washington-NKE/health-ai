"use client";

import { useChat } from "@ai-sdk/react";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Send,
  User,
  Bot,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Calendar,
  FileText,
  DollarSign,
  Users,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export function ChatInterface() {
  const { data: session, status } = useSession();
  const [clientError, setClientError] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onResponse: async (response) => {
      if (!response.ok) {
        try {
          const contentType = response.headers.get("content-type");
          let errorText = "";
          let errorCode = "UNKNOWN_ERROR";

          if (contentType?.includes("application/json")) {
            const errorData = await response.clone().json();
            // Handle structured error responses
            if (typeof errorData.error === "string") {
              try {
                const parsed = JSON.parse(errorData.error);
                errorText = parsed.error || errorData.error;
                errorCode = parsed.code || errorCode;
              } catch {
                errorText = errorData.error;
              }
            } else {
              errorText =
                errorData.error || errorData.message || "An error occurred";
            }
          } else {
            errorText = await response.clone().text();
          }

          console.error("Chat API error:", { errorText, errorCode });

          // Handle auth errors
          if (response.status === 401 || response.status === 403) {
            setClientError(
              "Access required: Only admins and staff can use this feature. Please ensure you're logged in with the appropriate role.",
            );
          }
          // Handle quota exceeded
          else if (
            errorCode === "QUOTA_EXCEEDED" ||
            errorText.includes("quota")
          ) {
            setClientError(
              "API quota limit reached (20 free requests/day). To continue using the chat feature, please upgrade to a paid Google AI plan at https://ai.google.dev/pricing",
            );
          }
          // Handle rate limiting
          else if (errorCode === "RATE_LIMITED") {
            setClientError(
              "Too many requests sent. Please wait a moment and try again.",
            );
          } else {
            setClientError(errorText || `API Error: ${response.statusText}`);
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          setClientError(`API Error: ${response.statusText}`);
        }
      } else {
        setClientError(null);
      }
    },
    onError: (e) => {
      console.error("Chat error:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);

      // Handle quota exceeded in error message
      if (
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("quota")
      ) {
        setClientError(
          "API quota limit reached (20 free requests/day). To continue using the chat feature, please upgrade to a paid Google AI plan at https://ai.google.dev/pricing",
        );
      }
      // Handle rate limiting
      else if (
        errorMsg.includes("429") ||
        errorMsg.includes("Too Many Requests")
      ) {
        setClientError(
          "Too many requests sent. Please wait a moment and try again.",
        );
      }
      // Handle common error messages
      else if (errorMsg.includes("An error occurred")) {
        setClientError(
          "Unable to connect to the AI service. Please try again.",
        );
      } else {
        setClientError(errorMsg);
      }
    },
    onFinish: (message) => {
      console.log("Message finished:", message);
      setClientError(null);
    },
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleQuickAction = (prompt: string) => {
    // Update input value
    handleInputChange({
      target: { value: prompt },
    } as React.ChangeEvent<HTMLInputElement>);

    // Submit after a brief delay
    setTimeout(() => {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      handleSubmit(submitEvent as any);
    }, 100);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setClientError(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6 max-w-3xl mx-auto pb-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Staff Data Assistant
                </h3>
                <p className="text-slate-600 max-w-lg mx-auto">
                  Query and manage patient information. Access appointments,
                  prescriptions, billing records, and patient profiles to
                  support healthcare operations.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl mx-auto pt-4">
                <Button
                  variant="outline"
                  className="h-auto py-3 px-2 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs sm:text-sm"
                  onClick={() =>
                    handleQuickAction(
                      "Show all upcoming appointments for today",
                    )
                  }
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className="font-medium">Appointments</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 px-2 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300 transition-all text-xs sm:text-sm"
                  onClick={() =>
                    handleQuickAction("List all active prescriptions")
                  }
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <div className="font-medium">Prescriptions</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 px-2 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all text-xs sm:text-sm"
                  onClick={() =>
                    handleQuickAction("Show pending billing records")
                  }
                >
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <div className="font-medium">Billing</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 px-2 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all text-xs sm:text-sm"
                  onClick={() =>
                    handleQuickAction(
                      "List all doctors with their specialization and consultation fees",
                    )
                  }
                >
                  <Users className="w-5 h-5 text-orange-600" />
                  <div className="font-medium">Doctors</div>
                </Button>
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    message.role === "user" ? "bg-blue-600" : "bg-white border"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-600" />
                  )}
                </div>

                {/* Bubble */}
                <Card
                  className={`p-4 shadow-sm border-0 transition-all hover:shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-none"
                      : "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200"
                  }`}
                >
                  <div
                    className={`prose prose-sm max-w-none leading-relaxed ${
                      message.role === "user" ? "prose-invert" : ""
                    }`}
                  >
                    {/* Render Content with Markdown */}
                    {message.role === "user" ? (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-4 mb-2" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-4 mb-2" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-semibold text-slate-900"
                              {...props}
                            />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              className="bg-slate-100 px-1 py-0.5 rounded text-sm"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}

                    {/* Render Tool Invocations (Loading States) */}
                    {message.toolInvocations?.map((tool) => {
                      // If the tool is still running (no result yet)
                      if (!("result" in tool)) {
                        return (
                          <div
                            key={tool.toolCallId}
                            className="mt-3 p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-2 text-xs text-slate-500"
                          >
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Accessing database...</span>
                          </div>
                        );
                      }
                      // Optional: Show tool result if you want debug info
                      return null;
                    })}
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {/* Loading indicator for streaming */}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-white border">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <Card className="p-4 shadow-sm bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Authentication Warning */}
          {status === "unauthenticated" && (
            <div className="flex justify-center">
              <Card className="p-4 bg-yellow-50 border-yellow-200 flex items-start gap-3 text-yellow-800 text-sm max-w-md">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Authentication Required</p>
                  <p className="text-xs mt-1">
                    Please log in with an admin or staff account to use this
                    feature.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Error State */}
          {(error || clientError) && (
            <div className="flex justify-center">
              <Card
                className={`p-4 flex items-start gap-3 text-sm max-w-md ${
                  clientError?.includes("quota") ||
                  clientError?.includes("Quota")
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">
                    {clientError?.includes("quota") ||
                    clientError?.includes("Quota")
                      ? "API Quota Limit Reached"
                      : "Unable to generate response"}
                  </p>
                  <p className="text-xs mt-1 opacity-90">
                    {clientError ||
                      (error instanceof Error
                        ? error.message
                        : "Please check your connection and try again.")}
                  </p>
                  {clientError?.includes("upgrade") ||
                  clientError?.includes("paid") ? (
                    <a
                      href="https://ai.google.dev/pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-xs font-semibold hover:underline"
                    >
                      Upgrade Plan →
                    </a>
                  ) : error ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reload()}
                      className="mt-2 text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  ) : null}
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white shadow-lg">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3 p-4">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about patient data, appointments, billing..."
                className="min-h-14 pr-16 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl text-base"
                disabled={isLoading || status === "unauthenticated"}
                maxLength={500}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {input.length}/500
              </div>
            </div>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !input.trim() ||
                status === "unauthenticated" ||
                !!clientError
              }
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
          {messages.length > 0 && (
            <div className="flex items-center justify-center gap-2 pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

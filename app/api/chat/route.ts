import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";
import { getHealthcareTools } from "@/lib/ai/tools";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Check if Google API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("[Chat API] Missing GOOGLE_GENERATIVE_AI_API_KEY");
      return new Response(
        JSON.stringify({
          error:
            "AI service not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const session = await auth().catch(() => null);

    // Check if user is authenticated and has appropriate role
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({
          error:
            "Authentication required. Please log in to use the chat feature.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Only allow admins and staff to use chat
    const userRole = session.user.role as string;
    if (!userRole || !["admin", "staff"].includes(userRole)) {
      return new Response(
        JSON.stringify({
          error: "Access denied. Only admins and staff can use this feature.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    const tools = getHealthcareTools(userId, userRole);

    const isAdmin = userRole === "admin";
    const roleContext = isAdmin
      ? "You have full access to all patient data in the system."
      : "You can view and manage patient data for staff operations.";

    const systemPrompt = `You are "HealthBot", an advanced medical assistant for healthcare staff.

CONTEXT:
- User ID: ${userId}
- User Role: ${userRole.toUpperCase()}
- Current Time: ${new Date().toLocaleString()}
- ${roleContext}

GUIDELINES:
- Use the provided tools to fetch real data. DO NOT hallucinate appointments or bills.
- When users ask for patient data, use the relevant tools (getPatientProfile, getAppointments, etc.)
- When listing doctors, include their consultation fees and specialization.
- Admins: You can access all patient records and system-wide data.
- Staff: You can access patient data for administrative and scheduling purposes.
- Tone: Professional, Empathetic, Concise.
- SAFETY: For medical concerns, direct users to appropriate healthcare providers.`;

    const coreMessages = convertToCoreMessages(messages);

    console.log(
      "[Chat API] Calling Google AI with",
      coreMessages.length,
      "messages",
    );

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: coreMessages,
      tools,
      maxSteps: 5,
      onFinish: ({ finishReason, usage }) => {
        console.log("[Chat API] Stream finished:", { finishReason, usage });
      },
      onError: (error) => {
        // Log the actual error on the server
        console.error("[Chat API] Stream error:", error);
      },
    });

    // Use toDataStreamResponse() with getErrorMessage to expose errors to client
    return result.toDataStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      getErrorMessage: (error) => {
        let errorMessage = "An error occurred while processing your request.";
        let errorCode = "UNKNOWN_ERROR";

        if (error instanceof Error) {
          console.error(
            "[Chat API] Error details:",
            error.message,
            error.stack,
          );
          errorMessage = error.message;

          // Check for quota exceeded errors
          if (
            error.message.includes("RESOURCE_EXHAUSTED") ||
            error.message.includes("quota") ||
            error.message.includes("Quota exceeded")
          ) {
            errorCode = "QUOTA_EXCEEDED";
            errorMessage =
              "API quota exceeded. The free tier limit (20 requests/day) has been reached. Please upgrade to a paid plan or try again tomorrow.";
          }
          // Check for rate limiting
          else if (
            error.message.includes("429") ||
            error.message.includes("Too Many Requests")
          ) {
            errorCode = "RATE_LIMITED";
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
          }
        }

        return JSON.stringify({ error: errorMessage, code: errorCode });
      },
    });
  } catch (err) {
    console.error("[Chat API] Error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Return proper JSON error response
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: err instanceof Error ? err.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

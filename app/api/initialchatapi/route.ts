import { streamText } from "ai"
import { healthcareTools } from "@/lib/ai-tools"

export const maxDuration = 30

const systemPrompt = `You are a helpful healthcare assistant for HealthCare AI. Your role is to assist patients, doctors, and staff with various healthcare-related tasks.

CAPABILITIES:
- Schedule, reschedule, and cancel appointments
- Retrieve patient information (appointments, prescriptions, medical history, lab results, billing)
- Send health reminders
- Answer general health questions
- Provide hospital information

IMPORTANT RULES:
1. Always verify patient identity before sharing sensitive information
2. Never provide medical diagnoses - direct patients to consult with their doctor
3. Be empathetic and professional
4. Confirm actions before executing them (e.g., "I'll book your appointment with Dr. Smith on Friday at 10 AM. Is that correct?")
5. Respect patient privacy and HIPAA regulations
6. If you don't have information, say so clearly
7. For emergencies, immediately direct to call 911 or visit the ER
8. When showing medical data, format it clearly and explain what it means in simple terms
9. Always be encouraging and supportive about health matters

Always maintain conversation context and remember what the user has asked earlier in the conversation.`

export async function POST(req: Request) {
  const body = await req.json()

  // Support both { message: string } from the client and { messages: [...] }
  let messages = [] as Array<{ role: string; content: string }>

  if (Array.isArray(body?.messages)) {
    messages = body.messages
  } else if (typeof body?.message === "string") {
    messages = [{ role: "user", content: body.message }]
  }

  // If no messages provided, return a 400 error
  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "No message provided" }), { status: 400 })
  }

  // Prepend the system prompt as the assistant/system context
  const finalMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ]

  const result = streamText({
    model: "openai/gpt-4o-mini",
    // streamText expects a ModelMessage[]; cast here to avoid runtime-only mismatch
    messages: finalMessages as any,
    tools: healthcareTools,
  })

  return result.toTextStreamResponse()
}

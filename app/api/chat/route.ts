import { NextRequest, NextResponse } from "next/server";
import { retrieveContextForQuery, buildGroundingContext } from "@/lib/copilot/contextEngine";
import type { UserProfile } from "@/types/university";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  userProfile?: UserProfile;
}

const SYSTEM_INSTRUCTION_BASE = `You are CampusCopilot, the elite autonomous admissions advisor for FindMyCampus.
Your mission: Provide authoritative, crystal-clear admissions guidance, program recommendations, and factual data for 600+ top global institutions (IN, US, GB, CA, DE, AU).

GUIDELINES:
1. FACTUAL QUESTIONS (fees, cutoffs, deadlines, placements, exams):
   - Always prioritize and cite the verified data provided in your context.
   - Never fabricate tuition numbers, rank floors, or placement metrics.
2. ADVISORY QUESTIONS ("What should I opt for?", "Where do I have a chance?"):
   - Analyze the candidate's provided profile (12th board %, entrance scores/ranks, budget, preferred branches/countries).
   - Categorize realistic options into: 'Reach School' (aspirational), 'Target Choice' (solid fit), and 'Competitive Fit / Safe' (high clearance probability).
   - Explain trade-offs clearly: tuition ROI, domestic vs. international packages, branch flexibility, and visa post-study support.
3. FORMATTING:
   - Use clean markdown with bullet points and bolding for readability.
   - When mentioning an institution from the dataset, include its country flag and current national/QS rank.
   - Keep answers concise, grounded, and free of unnecessary fluff.`;

const PLACEHOLDER_KEYS = [
  "YOUR_GEMINI_API_KEY_HERE",
  "your_gemini_api_key_here",
  "GEMINI_API_KEY_HERE",
  "",
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { messages, userProfile } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    // 1. Check for missing or placeholder Gemini API key
    if (!apiKey || PLACEHOLDER_KEYS.includes(apiKey)) {
      return NextResponse.json({
        role: "assistant",
        content: `⚠️ **Google Gemini API Key Required**\n\nTo activate **CampusCopilot AI** with Gemini 3.5 Flash-Lite:\n\n1. Open \`.env.local\` in the project root.\n2. Paste your Google Gemini API key:\n   \`\`\`env\n   GEMINI_API_KEY=AIzaSy...\n   \`\`\`\n3. Restart your development server or refresh the browser to ask real-time admissions questions!\n\n*(You can generate a free Gemini key in seconds at [Google AI Studio](https://aistudio.google.com/app/apikey))*`,
      });
    }

    // 2. Extract latest user query for context grounding
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // 3. RAG-lite retrieval from 600+ university dataset
    const { matchedUniversities, recommendedSets } = retrieveContextForQuery(
      lastUserMessage,
      userProfile
    );
    const groundingData = buildGroundingContext(
      matchedUniversities,
      userProfile,
      recommendedSets
    );

    // Combine system instructions with retrieved institutional groundings
    const fullSystemInstruction = `${SYSTEM_INSTRUCTION_BASE}

---
### VERIFIED FINDMYCAMPUS KNOWLEDGE BASE & CANDIDATE CONTEXT:
${groundingData}
---
Always answer grounded in the verified data above when available.`;

    // 4. Prepare message history formatted for Gemini API
    const formattedContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Primary requested model with fallback sequence if version alias is restricted
    const modelCandidates = [
      "gemini-3.5-flash-lite",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let responseData: any = null;
    let successfulModel = "";
    let lastErrorStatus = 0;
    let lastErrorText = "";

    for (const model of modelCandidates) {
      const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const res = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: fullSystemInstruction }],
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 2048,
              topP: 0.95,
            },
          }),
        });

        if (res.status === 200) {
          responseData = await res.json();
          successfulModel = model;
          break;
        }

        lastErrorStatus = res.status;
        lastErrorText = await res.text();

        // If rate limited, don't cascade, break and notify
        if (res.status === 429) {
          break;
        }

        // If 404 (model alias not found), continue to next model in candidate list
        if (res.status === 404) {
          continue;
        }

        // If invalid API key (400 or 403 with specific message)
        if (res.status === 400 || res.status === 403) {
          break;
        }
      } catch (err: any) {
        lastErrorText = err.message || "Network error";
      }
    }

    if (!responseData) {
      if (lastErrorStatus === 429) {
        return NextResponse.json({
          role: "assistant",
          content:
            "⚠️ **Rate Limit Exceeded**: Gemini API rate limit reached. Please wait a few moments and try your query again.",
        });
      }

      if (lastErrorStatus === 400 || lastErrorStatus === 403) {
        return NextResponse.json({
          role: "assistant",
          content: `⚠️ **Gemini API Error (${lastErrorStatus})**: Your \`GEMINI_API_KEY\` in \`.env.local\` appears invalid or unauthorized. Please verify your key at [Google AI Studio](https://aistudio.google.com/app/apikey).`,
        });
      }

      return NextResponse.json({
        role: "assistant",
        content: `⚠️ **Admissions Copilot Unavailable**: Unable to reach Gemini API (${lastErrorStatus || "Connection failure"}). Please check your network or try again shortly.\n\n*Error details: ${lastErrorText.slice(0, 140)}*`,
      });
    }

    const replyText =
      responseData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I evaluated your inquiry against FindMyCampus's verified institutional records, but no detailed response was generated. Please try rephrasing your question.";

    return NextResponse.json({
      role: "assistant",
      content: replyText,
      modelUsed: successfulModel,
      groundedInstitutionsCount: matchedUniversities.length,
    });
  } catch (err: any) {
    console.error("Admissions Copilot API error:", err);
    return NextResponse.json(
      {
        role: "assistant",
        content:
          "An unexpected error occurred while processing your admissions inquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}


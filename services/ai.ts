import OpenAI from "openai";
import { RelocationProfile, RelocationStep } from "../types";

// NOTE: In a real app, never expose API keys on the client.
// This is kept for the client-side demo only.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const TEXT_MODEL = "gpt-4o-mini";
const VISION_MODEL = "gpt-4o-mini";

type ChatHistoryItem = {
  role: "user" | "assistant" | "model";
  text?: string;
  content?: string;
  parts?: Array<{ text: string }>;
};

const parseJson = <T>(raw: string, fallback: T): T => {
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("AI JSON parse failed", err);
    return fallback;
  }
};

const mapHistory = (history: ChatHistoryItem[] = []) =>
  history
    .map((h) => {
      const content =
        h.content ||
        h.text ||
        (Array.isArray(h.parts) ? h.parts.map((p) => p.text).join("\n") : "");
      if (!content) return null;
      const role = h.role === "assistant" || h.role === "model" ? "assistant" : "user";
      return { role, content } as const;
    })
    .filter(Boolean) as { role: "assistant" | "user"; content: string }[];

export const AIService = {
  /**
   * Generates a relocation plan with concise steps and suggested questions.
   */
  async generateRelocationPlan(
    profile: RelocationProfile,
    language: string = "English"
  ): Promise<RelocationStep[]> {
    const isNotInDest = !profile.isAlreadyInDestination;
    const familyStatus = profile.familyStatus || "alone";
    const familyLabel =
      familyStatus === "with_partner"
        ? "moving with spouse/partner"
        : familyStatus === "with_children"
        ? "moving with children"
        : familyStatus === "with_partner_children"
        ? "moving with spouse/partner and children"
        : "moving alone";
    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a relocation assistant. Respond in ${language}. Keep steps concise. If the user is not already in the destination, the first step must be titled "Gather Required Documents" with type "checklist" and include concrete checklistItems. Account for who is relocating (alone, with spouse/partner, with children) and include dependent/family paperwork (e.g., marriage certificate, birth certificates, school enrollment). Always return a JSON object with a "steps" array only.`,
        },
        {
          role: "user",
          content: `
            Create a step-by-step relocation plan.
            CITIZENSHIP: ${profile.citizenship}
            CURRENT RESIDENCE: ${profile.currentResidence}
            MOVING TO: ${profile.toCountry}
            PURPOSE: ${profile.purpose}
            CURRENTLY IN DESTINATION: ${isNotInDest ? "No" : "Yes"}
            FAMILY STATUS: ${familyLabel}
            DESTINATION CITY: ${profile.destinationCity || "Not specified"}

            Rules:
            - 6-10 steps.
            - Each step must have suggestedQuestions (3-4 concise ideas).
            - type is either "default" or "checklist".
            - checklistItems only when type is "checklist".
            - Include optional officialLinks when relevant.
            - JSON shape: { "steps": [ { id, title, description, priority, type, checklistItems, officialLinks, suggestedQuestions } ] }
          `,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const data = parseJson<{ steps?: any[] }>(completion.choices[0].message?.content || "{}", {
      steps: [],
    });
    const stepsArray = Array.isArray(data.steps)
      ? data.steps
      : Array.isArray((data as any))
      ? (data as any)
      : [];

    return stepsArray.map((step, idx) => {
      const checklist = Array.isArray(step.checklistItems)
        ? step.checklistItems
            .map((item: any, itemIdx: number) => {
              const text =
                typeof item === "string"
                  ? item
                  : item?.text || item?.title || item?.name || "";

              return {
                id: item?.id || `${step.id || `step_${idx + 1}`}_item_${itemIdx + 1}`,
                text,
                checked:
                  typeof item === "object" && item !== null && "checked" in item
                    ? Boolean(item.checked)
                    : false,
              };
            })
            .filter((item: any) => Boolean(item.text?.trim()))
        : undefined;

      return {
        id: step.id || `step_${idx + 1}`,
        title: step.title || `Step ${idx + 1}`,
        description: step.description || "",
        priority: typeof step.priority === "number" ? step.priority : idx + 1,
        status: "not_started" as const,
        type: step.type === "checklist" ? "checklist" : "default",
        checklistItems: checklist,
        officialLinks: Array.isArray(step.officialLinks) ? step.officialLinks : [],
        suggestedQuestions: Array.isArray(step.suggestedQuestions) ? step.suggestedQuestions : [],
      };
    });
  },

  /**
   * Chat about a specific step or document.
   */
  async chatAboutStep(
    profile: RelocationProfile,
    contextText: string,
    message: string,
    history: ChatHistoryItem[] = [],
    language: string = "English"
  ): Promise<string> {
    const familyStatus = profile.familyStatus || "alone";
    const familyLabel =
      familyStatus === "with_partner"
        ? "with spouse/partner"
        : familyStatus === "with_children"
        ? "with children"
        : familyStatus === "with_partner_children"
        ? "with spouse/partner and children"
        : "alone";
    const messages = [
      {
        role: "system" as const,
        content: `You are a helpful relocation assistant. The user is moving from ${profile.currentResidence} (citizen of ${profile.citizenship}) to ${profile.toCountry}. They are relocating ${familyLabel}. Respond in ${language}. Keep answers concise and specific to the user's context.`,
      },
      ...mapHistory(history),
      {
        role: "user" as const,
        content: `Context: ${contextText}\nQuestion: ${message}`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages,
      temperature: 0.5,
    });

    return completion.choices[0].message?.content?.trim() || "I couldn't generate a response.";
  },

  /**
   * Explains a document from text or file (image/pdf).
   */
  async explainDocument(
    text?: string,
    fileBase64?: string,
    mimeType: string = "image/jpeg",
    language: string = "English"
  ): Promise<{ summary: string; actions: string[]; isDocument: boolean }> {
    const contentParts: any[] = [];

    if (text) {
      contentParts.push({ type: "text", text: `Provided text: ${text}` });
    }
    if (fileBase64) {
      contentParts.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${fileBase64}`,
        },
      });
    }
    contentParts.push({
      type: "text",
      text: `
        Analyze the provided content.
        1) Decide if this is a bureaucratic document/form/letter.
        2) If NOT a document, set isDocument=false and return a friendly summary telling the user to upload a document.
        3) If it IS a document, provide a two-sentence summary and 3-5 immediate action items.
        Respond in ${language}.
        Return JSON only: { "summary": string, "actions": string[], "isDocument": boolean }.
      `,
    });

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        { role: "system", content: "You help immigrants quickly understand documents." },
        { role: "user", content: contentParts },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return parseJson<{ summary: string; actions: string[]; isDocument: boolean }>(
      completion.choices[0].message?.content || "{}",
      { summary: "", actions: [], isDocument: false }
    );
  },

  /**
   * Suggests places in a city without external grounding.
   */
  async getCitySuggestions(
    city: string,
    budget: string,
    interests: string[],
    language: string = "English"
  ): Promise<any[]> {
    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: `Suggest 3 welcoming places for newcomers. Provide clear titles, short descriptions, and a link or address when possible. Respond in ${language}. Return a JSON object with "suggestions" array only.`,
        },
        {
          role: "user",
          content: `City: ${city}\nBudget: ${budget}\nInterests: ${interests.join(
            ", "
          )}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const data = parseJson<{ suggestions?: any[] }>(
      completion.choices[0].message?.content || "{}",
      { suggestions: [] }
    );
    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions
      : Array.isArray((data as any))
      ? (data as any)
      : [];

    if (suggestions.length === 0) {
      return [{ rawText: completion.choices[0].message?.content || "" }];
    }

    return suggestions.map((s: any, idx: number) => ({
      title: s.title || `Place ${idx + 1}`,
      description: s.description || "",
      address: s.address || s.link || "",
    }));
  },

  /**
   * Chat bot for general questions.
   */
  async chat(history: ChatHistoryItem[] = [], message: string, language: string = "English") {
    const messages = [
      { role: "system" as const, content: `You are a helpful relocation assistant. Respond in ${language}.` },
      ...mapHistory(history),
      { role: "user" as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages,
      temperature: 0.5,
    });

    return completion.choices[0].message?.content;
  },
};

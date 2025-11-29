import OpenAI from "openai";
import { RelocationProfile, RelocationStep } from "../types";

type RelocationPlanPayload = {
  steps: Array<{
    id?: string;
    title: string;
    description: string;
    priority: number;
    officialLinks?: string[];
  }>;
};

type DocAnalysisPayload = { summary: string; actions: string[] };
type CitySuggestionsPayload = {
  suggestions: Array<{ title: string; description: string; address: string; reason?: string }>;
};

let client: OpenAI | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OpenAI API key. Add OPENAI_API_KEY to your .env.local file.");
    }
    client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
};

const extractText = (content: string | Array<{ text?: string }> | null | undefined): string => {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content.map(part => part?.text ?? "").join(" ").trim();
};

const parseJson = <T>(value: string | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse AI JSON response", error, value);
    return fallback;
  }
};

export const AIService = {
  /**
   * Generates a relocation plan with structured JSON using OpenAI (gpt-4o-mini).
   */
  async generateRelocationPlan(profile: RelocationProfile, language: string = "en"): Promise<RelocationStep[]> {
    const prompt = `
      Create a detailed step-by-step relocation checklist for a person moving:
      FROM: ${profile.fromCountry}
      TO: ${profile.toCountry}
      PURPOSE: ${profile.purpose}
      CURRENTLY IN DESTINATION: ${profile.isAlreadyInDestination ? "Yes" : "No"}
      LANGUAGE: ${language}

      Focus on visa, residence permits, registration, insurance, and housing. Keep language simple.
      Write titles and descriptions in the specified LANGUAGE.
      Return a JSON object: { "steps": [...] } only.
      Each step should include: id (string, slug), title, description, priority (1 is highest), officialLinks (array of URLs or empty).
    `;

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert relocation assistant for newcomers in Europe. Respond with JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "relocation_plan",
          schema: {
            type: "object",
            properties: {
              steps: {
                type: "array",
                minItems: 5,
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "short slug-like id" },
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "integer", minimum: 1 },
                    officialLinks: { type: "array", items: { type: "string" } },
                  },
                  required: ["id", "title", "description", "priority", "officialLinks"],
                  additionalProperties: false,
                },
              },
            },
            required: ["steps"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    const content = extractText(completion.choices[0]?.message?.content);
    const parsed = parseJson<RelocationPlanPayload>(content, { steps: [] });

    return parsed.steps.map((step, idx) => ({
      id: step.id || `step-${idx + 1}`,
      title: step.title || `Step ${idx + 1}`,
      description: step.description || "",
      priority: Number.isInteger(step.priority) ? step.priority : idx + 1,
      officialLinks: Array.isArray(step.officialLinks) ? step.officialLinks : [],
      status: "not_started",
    }));
  },

  /**
   * Explains a document from text or image using OpenAI Vision.
   */
  async explainDocument(
    text?: string,
    imageBase64?: string,
    imageMimeType: string = "image/jpeg",
    language: string = "en"
  ): Promise<{ summary: string; actions: string[] }> {
    const userContent: any[] = [];

    if (text) {
      userContent.push({ type: "text", text });
    }
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
      });
    }

    userContent.push({
      type: "text",
      text: `Summarize in at most 2 sentences and list 3-5 action items. Use language: ${language}. Respond with JSON only.`,
    });

    const response = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You help newcomers understand bureaucratic documents. Be concise and actionable. Respond in the user's language.",
        },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "document_summary",
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              actions: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } },
            },
            required: ["summary", "actions"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    const content = extractText(response.choices[0]?.message?.content);
    const parsed = parseJson<DocAnalysisPayload>(content, { summary: "", actions: [] });

    return {
      summary: parsed.summary || "",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  },

  /**
   * Suggests places without Maps grounding (pure OpenAI suggestions).
   */
  async getCitySuggestions(city: string, budget: string, interests: string[], language: string = "en"): Promise<any[]> {
    const response = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Recommend inclusive places for immigrants (community centers, cafes, libraries, coworking, clubs). Include neighborhood hints. Respond in the requested language.",
        },
        {
          role: "user",
          content: `City: ${city}\nBudget: ${budget}\nInterests: ${interests.join(
            ", "
          )}\nLanguage: ${language}\nReturn 3 places with title, description, address/neighborhood, and optional reason.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "city_suggestions",
          schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    address: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["title", "description", "address", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["suggestions"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    const rawContent = extractText(response.choices[0]?.message?.content);
    const parsed = parseJson<CitySuggestionsPayload>(rawContent, {
      suggestions: [],
    });

    if (parsed.suggestions.length > 0) {
      return parsed.suggestions.map(item => ({
        ...item,
        address: item.address?.startsWith("http")
          ? item.address
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${item.title}, ${city} ${item.address ?? ""}`
            )}`,
      }));
    }

    return rawContent ? [{ rawText: rawContent }] : [];
  },

  /**
   * Lightweight chat helper for future chat UI.
   */
  async chat(
    history: { role: "user" | "model"; parts: [{ text: string }] }[],
    message: string
  ): Promise<string> {
    const mappedHistory = history.map(h => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts.map(p => p.text).join("\n"),
    }));

    const response = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly relocation assistant for newcomers in Europe." },
        ...mappedHistory,
        { role: "user", content: message },
      ],
    });

    return extractText(response.choices[0]?.message?.content);
  },
};

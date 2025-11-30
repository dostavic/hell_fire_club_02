import OpenAI from "openai";
import { ConsulateInfo, RelocationProfile, RelocationStep } from "../types";

// NOTE: In a real app, never expose API keys on the client.
// This is kept for the client-side demo only.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const TEXT_MODEL = "gpt-5";
const TEXT_MODEL_MINI = "gpt-5-nano";
const VISION_MODEL = "gpt-5-vision";

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

const tFallback = (language: string, english: string) => {
  if (language.startsWith("uk")) return "Перевірте, будь ласка, через пошук на карті; результат може відрізнятись.";
  if (language.startsWith("de")) return "Bitte prüfen Sie über die Kartensuche; das Ergebnis kann je nach Region variieren.";
  if (language.startsWith("ro")) return "Vă rugăm verificați prin căutarea pe hartă; rezultatul poate varia după regiune.";
  if (language.startsWith("cs")) return "Ověřte prosím pomocí vyhledávání na mapě; výsledek se může lišit podle regionu.";
  if (language.startsWith("sk")) return "Prosím overte cez vyhľadávanie na mape; výsledok sa môže líšiť podľa regiónu.";
  return english;
};

const mapLocales: Record<string, { hl?: string; gl?: string }> = {
  germany: { hl: "de", gl: "DE" },
  austria: { hl: "de", gl: "AT" },
  "czech republic": { hl: "cs", gl: "CZ" },
  slovakia: { hl: "sk", gl: "SK" },
  romania: { hl: "ro", gl: "RO" },
  ukraine: { hl: "uk", gl: "UA" },
  poland: { hl: "pl", gl: "PL" },
  hungary: { hl: "hu", gl: "HU" },
};

const makeMapLink = (query: string, country: string) => {
  const locale = mapLocales[country.toLowerCase()] || {};
  const params = [`query=${encodeURIComponent(query)}`];
  if (locale.hl) params.push(`hl=${locale.hl}`);
  if (locale.gl) params.push(`gl=${locale.gl}`);
  return `https://www.google.com/maps/search/?api=1&${params.join("&")}`;
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
    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a relocation assistant. Respond in ${language}. Keep steps concise. If the user is not already in the destination, the first step must be titled "Gather Required Documents" with type "checklist" and include concrete checklistItems. Always return a JSON object with a "steps" array only.`,
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
      temperature: 1,
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
    const messages = [
      {
        role: "system" as const,
        content: `You are a helpful relocation assistant. The user is moving from ${profile.currentResidence} (citizen of ${profile.citizenship}) to ${profile.toCountry}. Respond in ${language}. Keep answers concise and specific to the user's context.`,
      },
      ...mapHistory(history),
      {
        role: "user" as const,
        content: `Context: ${contextText}\nQuestion: ${message}`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL_MINI,
      messages,
      temperature: 1,
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
    if (fileBase64 && mimeType.startsWith("image/")) {
      contentParts.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${fileBase64}`,
        },
      });
    } else if (fileBase64) {
      // Avoid sending non-image blobs as image_url (e.g., PDFs cause API errors)
      contentParts.push({
        type: "text",
        text: `A file (${mimeType}) was provided. Use the text above to interpret its contents.`,
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
      temperature: 1,
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
    searchQuery: string = "",
    language: string = "English"
  ): Promise<any[]> {
    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL_MINI,
      messages: [
        {
          role: "system",
          content: `Suggest 3 welcoming places for newcomers. Provide clear titles, short descriptions, and a link to google maps or address. Respond in ${language}. Return a JSON object with "suggestions" array only.`,
        },
        {
          role: "user",
          content: `City: ${city}\nBudget: ${budget}\nInterests: ${interests.join(
            ", "
          )}${searchQuery ? `\nSpecific search: ${searchQuery}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 1,
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
   * Finds the nearest consulate based on profile data.
   */
  async findNearestConsulate(
    profile: RelocationProfile,
    language: string = "English"
  ): Promise<ConsulateInfo> {
    const consulateCountry = profile.citizenship;
    const locationCountry = profile.isAlreadyInDestination ? profile.toCountry : profile.currentResidence;
    const cityTarget = profile.isAlreadyInDestination
      ? profile.destinationCity?.trim() || profile.toCountry
      : profile.destinationCity?.trim() || locationCountry;
    const cityQuery = `${consulateCountry} consulate in ${cityTarget}, ${locationCountry}`;
    const countryQuery = `${consulateCountry} consulate in ${locationCountry}`;
    const nearQuery = `${consulateCountry} consulate near ${cityTarget || locationCountry}`;
    const fallbackMapLinkCity = makeMapLink(cityQuery, locationCountry);
    const fallbackMapLinkCountry = makeMapLink(countryQuery, locationCountry);
    const fallbackMapLinkNear = makeMapLink(nearQuery, locationCountry);

    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a relocation assistant. Respond in ${language}. Find a consulate/embassy of the traveler's citizenship located in the specified location country only. If unsure, prefer the main embassy in that country's capital. If you cannot provide a confident address in that location country, return a Google Maps search link only. Return JSON only: { "name": string, "address": string, "mapLink": string, "website": string, "note": string }.`,
        },
        {
          role: "user",
          content: `
            Find the nearest consulate for a traveler.
            Citizenship (whose consulate they need): ${consulateCountry}
            Location country where the consulate must be: ${locationCountry}
            Target city or area: ${cityTarget}
            Provide a precise name and address in the location country if known, a Google Maps link (or search link), and an official website if available.
          `,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const parsed = parseJson<Partial<ConsulateInfo>>(
      completion.choices[0].message?.content || "{}",
      {}
    );

    const address = parsed.address || "";
    const lowerAddress = address.toLowerCase();
    const locationLower = locationCountry.toLowerCase();
    const cityLower = cityTarget.toLowerCase();
    const lowerMap = (parsed.mapLink || "").toLowerCase();
    const mapMatches = lowerMap.includes(locationLower);
    const preciseQuery = `${consulateCountry} consulate, ${address || cityTarget}, ${locationCountry}`;
    const safeMapLink = makeMapLink(preciseQuery, locationCountry);
    const aiMapLink = mapMatches && parsed.mapLink ? parsed.mapLink : safeMapLink;
    const isConfident =
      lowerAddress.includes(locationLower) ||
      (cityLower ? lowerAddress.includes(cityLower) : false);

    if (!isConfident) {
      return {
        name: `${consulateCountry} consulate`,
        address:
          address ||
          tFallback(
            language,
            "Could not verify an exact consulate address in this country. Showing the closest option we could find."
          ),
        mapLink: fallbackMapLinkNear,
        website: parsed.website,
        note:
          parsed.note ||
          tFallback(
            language,
            "If there is no consulate in this country, this link points to the nearest one. Please confirm via the map search."
          ),
      };
    }

    return {
      name: parsed.name || `${consulateCountry} consulate`,
      address: parsed.address || "Look up the nearest consulate using the map link.",
      mapLink: aiMapLink,
      website: parsed.website,
      note: parsed.note,
    };
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
      model: TEXT_MODEL_MINI,
      messages,
      temperature: 1,
    });

    return completion.choices[0].message?.content;
  },
};

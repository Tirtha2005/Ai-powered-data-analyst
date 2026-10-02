/**
 * Bridge between the app's configuration system and the csv-charts-ai package.
 * All AI logic lives in the package — this file only handles:
 * - Registering AI providers (openai, anthropic, google, mistral, openai-compatible)
 * - Converting app settings (AIServiceConfig) to a LanguageModel via createAppModel
 * - Re-exporting types for backwards compatibility
 */

import {
  createAppModel,
  registerProvider,
  fromSDK,
  suggestCharts,
  suggestCustomChart,
  repairChart,
  summarizeData,
  detectAnomalies as pkgDetectAnomalies,
  streamAskAboutData,
  suggestQuestions as pkgSuggestQuestions,
} from "csv-charts-ai";
import type {
  ChartConfig,
  TabularData,
  DataSummaryResult,
  AnomalyResult,
  SuggestedQuestion,
} from "csv-charts-ai";
import { withRetry } from "./retry";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { type ModelId, type LanguageCode } from "./ai-models";

// ============ Register AI providers ============

registerProvider("openai", fromSDK(createOpenAI));
registerProvider("anthropic", (config) => {
  const anthropic = createAnthropic({
    apiKey: config.apiKey,
    headers: {
      ...config.headers,
      "anthropic-dangerous-direct-browser-access": "true",
    },
  });
  return anthropic(config.model);
});
registerProvider("google", fromSDK(createGoogleGenerativeAI));
registerProvider("mistral", fromSDK(createMistral));
const createOpenAICompatibleModel = (
  name: string,
  defaultBaseURL: string,
  config: any,
  extraHeaders?: Record<string, string>,
) => {
  return createOpenAICompatible({
    name,
    baseURL: config.baseURL || defaultBaseURL,
    apiKey: config.apiKey,
    headers: {
      ...extraHeaders,
      ...config.headers,
    },
    supportsStructuredOutputs: true,
    transformRequestBody: (body) => {
      const format = body.response_format as
        | { type: string; json_schema?: { schema: unknown } }
        | undefined;
      if (format?.type !== "json_schema" || !format.json_schema) return body;
      return {
        ...body,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Return only a JSON object matching this JSON schema: ${JSON.stringify(format.json_schema.schema)}`,
          },
          ...body.messages,
        ],
      };
    },
  }).chatModel(config.model);
};

const createGroqProvider = (config: any) =>
  createOpenAICompatibleModel(
    "groq",
    "https://api.groq.com/openai/v1",
    config,
  );

registerProvider("groq", createGroqProvider);
registerProvider("@ai-sdk/groq", createGroqProvider);

const createOpenRouterProvider = (config: any) =>
  createOpenAICompatibleModel(
    "openrouter",
    "https://openrouter.ai/api/v1",
    config,
    {
      "HTTP-Referer": "https://csv-ai-analyzer.com",
      "X-Title": "AI Data Analyst",
    },
  );

registerProvider("openrouter", createOpenRouterProvider);
registerProvider("@openrouter/ai-sdk-provider", createOpenRouterProvider);
registerProvider("@ai-sdk/openrouter", createOpenRouterProvider);

registerProvider("@ai-sdk/openai-compatible", (config) => {
  if (!config.baseURL)
    throw new Error(
      "This provider has no API URL. Select it again in API settings or configure a custom endpoint.",
    );
  return createOpenAICompatibleModel("openai-compatible", config.baseURL, config);
});

// ============ Re-exports from package ============

export type { ChartConfig as ChartSuggestion } from "csv-charts-ai";
export type { ChartType, AggregationType } from "csv-charts-ai";
export type {
  DataSummaryResult,
  AnomalyResult,
  SuggestedQuestion,
} from "csv-charts-ai";
export { getAIErrorMessage, createAppModel } from "csv-charts-ai";

export interface CustomAnalysisResult {
  response: string;
}

// ============ App-specific config ============

export interface AIServiceConfig {
  apiKey: string;
  signal?: AbortSignal;
  model?: ModelId;
  providerId?: string;
  providerNpm?: string;
  providerApi?: string;
  language?: LanguageCode;
  customEndpoint?: string;
  customModel?: string;
}

// ============ Language mapping ============

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  ja: "Japanese",
  zh: "Chinese",
};

// ============ Model Resolution ============

/**
 * Converts the app's AIServiceConfig to a LanguageModel
 * using the package's createAppModel.
 * Custom endpoints (Ollama, LM Studio, etc.) are called directly —
 * the user must enable CORS in the local server settings.
 */
export function getModel(config: AIServiceConfig) {
  let { apiKey, customEndpoint, model, providerNpm, providerApi, customModel } =
    config;

  // Fallback to proxy if no API key is provided by the user
  if (!apiKey && !customEndpoint) {
    apiKey = "proxy-key";
    if (providerNpm === "@ai-sdk/openai") {
      customEndpoint = "/api/proxy/openai/v1";
    } else if (providerNpm === "@ai-sdk/groq") {
      customEndpoint = "/api/proxy/groq/v1";
    } else if (providerNpm === "@ai-sdk/google") {
      customEndpoint = "/api/proxy/gemini/v1beta";
    } else {
      // Fallback for custom OpenAI compatible endpoints mapped via proxy
      customEndpoint = "/api/proxy/openai/v1";
    }
  }

  return createAppModel({
    apiKey,
    model,
    providerNpm,
    providerApi,
    customEndpoint,
    customModel,
  });
}

// ============ Thin wrappers (delegate to package) ============

export const generateChartSuggestions = async (
  config: AIServiceConfig,
  dataSummary: string,
  columns: string[],
): Promise<ChartConfig[]> => {
  const model = getModel(config);
  return withRetry(
    () =>
      suggestCharts({
        model,
        data: {
          headers: columns,
          rows: [],
          columns: columns.map((name, index) => ({
            name,
            type: "string" as const,
            index,
          })),
          rowCount: 0,
        },
        dataSummary,
        signal: config.signal,
        language: LANGUAGE_NAMES[config.language ?? "en"],
      }),
    2,
    1000,
    config.signal,
  );
};

export const generateCustomChart = async (
  config: AIServiceConfig,
  dataSummary: string,
  userPrompt: string,
  columns: string[],
): Promise<ChartConfig | null> => {
  const model = getModel(config);
  return withRetry(
    () =>
      suggestCustomChart({
        model,
        data: {
          headers: columns,
          rows: [],
          columns: columns.map((name, index) => ({
            name,
            type: "string" as const,
            index,
          })),
          rowCount: 0,
        },
        dataSummary,
        prompt: userPrompt,
        signal: config.signal,
        language: LANGUAGE_NAMES[config.language ?? "en"],
      }),
    2,
    1000,
    config.signal,
  );
};

export const repairChartSuggestion = async (
  config: AIServiceConfig,
  failedChart: ChartConfig,
  columns: string[],
  errorContext: string,
): Promise<ChartConfig | null> => {
  const model = getModel(config);
  return withRetry(
    () =>
      repairChart({
        model,
        failedChart,
        columns,
        errorContext,
        signal: config.signal,
        language: LANGUAGE_NAMES[config.language ?? "en"],
      }),
    2,
    1000,
    config.signal,
  );
};

export const generateDataSummary = async (
  config: AIServiceConfig,
  dataSummary: string,
): Promise<DataSummaryResult> => {
  const model = getModel(config);
  return withRetry(
    () =>
      summarizeData({
        model,
        data: {
          headers: ["_"],
          rows: [],
          columns: [{ name: "_", type: "string", index: 0 }],
          rowCount: 0,
        },
        dataSummary,
        signal: config.signal,
        language: LANGUAGE_NAMES[config.language ?? "en"],
      }),
    2,
    1000,
    config.signal,
  );
};

export const detectAnomalies = async (
  config: AIServiceConfig,
  dataSummary: string,
  data: TabularData,
): Promise<AnomalyResult[]> => {
  const model = getModel(config);
  return withRetry(
    () =>
      pkgDetectAnomalies({
        model,
        data,
        dataSummary,
        signal: config.signal,
        language: LANGUAGE_NAMES[config.language ?? "en"],
      }),
    2,
    1000,
    config.signal,
  );
};

export const streamCustomAnalysis = async (
  config: AIServiceConfig,
  customPrompt: string,
  dataSummary: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  conversationHistory: Array<{ prompt: string; response: string }> = [],
): Promise<void> => {
  const model = getModel(config);
  config.signal?.throwIfAborted();
  await streamAskAboutData({
    signal: config.signal,
    model,
    data: {
      headers: ["_"],
      rows: [],
      columns: [{ name: "_", type: "string", index: 0 }],
      rowCount: 0,
    },
    question: customPrompt,
    dataSummary,
    history: conversationHistory,
    language: LANGUAGE_NAMES[config.language ?? "en"],
    onChunk: (chunk) => {
      if (!config.signal?.aborted) onChunk(chunk);
    },
    onComplete: (text) => {
      if (!config.signal?.aborted) onComplete(text);
    },
  });
  config.signal?.throwIfAborted();
};

export const fetchSuggestedQuestions = async (
  config: AIServiceConfig,
  dataSummary: string,
): Promise<SuggestedQuestion[]> => {
  const model = getModel(config);
  return withRetry(
    () =>
      pkgSuggestQuestions({
        model,
        data: {
          headers: ["_"],
          rows: [],
          columns: [{ name: "_", type: "string", index: 0 }],
          rowCount: 0,
        },
        dataSummary,
        signal: config.signal,
        language: LANGUAGE_NAMES[config.language ?? "en"],
        count: 6,
      }),
    2,
    1000,
    config.signal,
  );
};

export const streamGroundedDatasetChat = async (
  config: AIServiceConfig,
  userPrompt: string,
  fileName: string | undefined,
  data: TabularData,
  dataSummary: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  conversationHistory: Array<{ prompt: string; response: string }> = [],
): Promise<void> => {
  const model = getModel(config);
  config.signal?.throwIfAborted();

  const language = LANGUAGE_NAMES[config.language ?? "en"];

  const systemPrompt = `You are a specialized Data Retrieval & Q&A Assistant dedicated EXCLUSIVELY to analyzing and retrieving information about the loaded dataset.

DATASET METADATA:
File Name: "${fileName || "dataset.csv"}"
Total Rows: ${data.rowCount}
Total Columns: ${data.headers.length}
Columns: (${data.columns.map((c) => `${c.name} [${c.type}]`).join(", ")})

STATISTICAL SUMMARY & SAMPLE DATA:
${dataSummary}

STRICT GUARDRAILS & RULES:
1. GROUNDING RULE: You must answer questions ONLY using facts, statistics, values, calculations, or descriptions present in or directly derived from the dataset summarized above.
2. REJECTION GUARDRAIL: If the user asks about ANY topic unrelated to this dataset (such as world news, general knowledge, creative writing, capital cities, general coding, sports, etc.), DECLINE IMMEDIATELY using this exact response wording:
   "I am your Dataset AI Assistant, strictly restricted to answering questions about the loaded dataset (**${fileName || "dataset.csv"}**). Your question appears to be unrelated to this dataset. Please ask a question related to the dataset columns: ${data.headers.join(", ")}."
3. NO HALLUCINATION: Do NOT invent, assume, or fabricate any data, columns, or metrics that do not exist in the dataset. If information is missing or not present, explicitly state that it is not available in the dataset.
4. LANGUAGE: Respond in ${language}. Use clear Markdown formatting with bolding, bullet points, or tables for maximum readability.`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  for (const item of conversationHistory) {
    messages.push({ role: "user", content: item.prompt });
    messages.push({ role: "assistant", content: item.response });
  }

  messages.push({ role: "user", content: userPrompt });

  const { streamText } = await import("ai");
  const result = streamText({
    model,
    messages,
    temperature: 0.2, // Low temperature for maximum factual accuracy & zero hallucination
    ...(config.signal && { abortSignal: config.signal }),
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    if (config.signal?.aborted) break;
    fullText += chunk;
    onChunk(chunk);
  }

  if (!config.signal?.aborted) {
    onComplete(fullText);
  }
};

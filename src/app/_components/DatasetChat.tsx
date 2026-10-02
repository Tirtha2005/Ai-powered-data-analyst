"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Bot,
  Send,
  Loader2,
  ShieldCheck,
  Copy,
  Check,
  Trash2,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  type CSVData,
  generateDataSummary as generateCSVSummary,
} from "~/lib/csv-parser";
import { streamGroundedDatasetChat } from "~/lib/ai-service";
import type { StoredSettings } from "~/lib/storage";

function useSpeechToText(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          onTranscriptRef.current(text);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSupported(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return { isListening, toggleListening, supported };
}

interface DatasetChatProps {
  data: CSVData;
  fileName?: string;
  apiSettings: StoredSettings | null;
  disabled?: boolean;
}

interface ChatMessage {
  prompt: string;
  response: string;
  timestamp?: string;
}

export function DatasetChat({
  data,
  fileName,
  apiSettings,
  disabled = false,
}: DatasetChatProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, toggleListening, supported: micSupported } =
    useSpeechToText((text) => {
      setPrompt((prev) => (prev ? prev + " " + text : text));
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamingResponse, isLoading]);

  // Generate dataset-specific question chips based on actual columns
  const generateSuggestedQuestions = (): string[] => {
    if (!data?.headers || data.headers.length === 0 || !data?.columns) return [];
    const questions: string[] = [];

    const numCol = data.columns.find((c) => c?.type === "number");
    const strCol = data.columns.find((c) => c?.type === "string");

    questions.push(`Summarize the dataset in 3 bullet points`);

    if (numCol && strCol) {
      questions.push(`What are the top 5 records by ${numCol.name}?`);
      questions.push(`Calculate average ${numCol.name} per ${strCol.name}`);
    } else if (numCol) {
      questions.push(`What is the min, max, and average of ${numCol.name}?`);
    } else if (strCol) {
      questions.push(`What are the most frequent values in ${strCol.name}?`);
    }

    questions.push(`List all available columns and their data types`);

    return questions.slice(0, 4);
  };

  const suggestedQuestions = generateSuggestedQuestions();

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? prompt).trim();
    if (!textToSend || isLoading) return;

    if (!apiSettings?.apiKey && !apiSettings?.customEndpoint) {
      toast.error("Configuration Required", {
        description: "Please configure your API settings first.",
      });
      return;
    }

    const currentPrompt = textToSend;
    setPrompt("");
    setIsLoading(true);
    setStreamingResponse("");

    const config = {
      apiKey: apiSettings.apiKey,
      model: apiSettings.model,
      providerId: apiSettings.providerId,
      providerNpm: apiSettings.providerNpm,
      providerApi: apiSettings.providerApi,
      language: apiSettings.language,
      customEndpoint: apiSettings.customEndpoint,
      customModel: apiSettings.customModel,
    };

    try {
      const dataSummary = generateCSVSummary(data);

      let currentAccumulator = "";
      await streamGroundedDatasetChat(
        config,
        currentPrompt,
        fileName,
        data,
        dataSummary,
        (chunk) => {
          currentAccumulator += chunk;
          setStreamingResponse(currentAccumulator);
        },
        (fullText) => {
          setChatHistory((prev) => [
            ...prev,
            {
              prompt: currentPrompt,
              response: fullText,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          setStreamingResponse("");
          setIsLoading(false);
        },
        chatHistory,
      );
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to retrieve dataset response";
      setChatHistory((prev) => [
        ...prev,
        {
          prompt: currentPrompt,
          response: `⚠️ **Error**: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setStreamingResponse("");
      setIsLoading(false);
      toast.error("Query Failed", { description: errorMsg });
    }
  };

  const handleCopy = (text: string, index: number) => {
    void navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setChatHistory([]);
    setStreamingResponse("");
    toast.info("Chat Cleared");
  };

  return (
    <div className="glass-card animate-fade-in flex flex-1 flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-3">
          <Bot className="h-6 w-6 text-violet-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">Dataset AI Assistant</h3>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Strictly Grounded
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Query stats, columns, and data insights about{" "}
            <span className="font-semibold text-gray-200">
              {fileName ?? "your dataset"}
            </span>{" "}
            ({data.rowCount} rows, {data.headers.length} columns)
          </p>
        </div>

        {chatHistory.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Body */}
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {/* Welcome Banner when history is empty */}
        {chatHistory.length === 0 && !streamingResponse && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-300">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Dataset Guardrails Active
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              This AI assistant is configured with strict guardrails to answer{" "}
              <strong className="text-white font-semibold">only</strong> questions directly grounded on your
              uploaded dataset. Unrelated general questions will be politely
              declined to avoid hallucinations.
            </p>
            {suggestedQuestions.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5 text-violet-400" />
                  Suggested Questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={`suggested-${idx}`}
                      type="button"
                      onClick={() => handleSend(q)}
                      disabled={disabled || isLoading}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white disabled:opacity-50 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat History Messages */}
        <div className="max-h-[450px] overflow-y-auto space-y-4 pr-1 scroll-smooth">
          {chatHistory.map((item, idx) => (
            <div key={`chat-msg-${idx}`} className="space-y-3">
              {/* User Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm text-white shadow-md">
                  <p className="whitespace-pre-wrap">{item.prompt}</p>
                  {item.timestamp && (
                    <span className="mt-1 block text-right text-[10px] text-violet-200/70">
                      {item.timestamp}
                    </span>
                  )}
                </div>
              </div>

              {/* Assistant Bubble */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-violet-500/20 p-2 shrink-0 border border-violet-500/30">
                  <Bot className="h-4 w-4 text-violet-400" />
                </div>
                <div className="relative group flex-1 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-gray-200 shadow-md">
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.response, idx)}
                      className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <MarkdownRenderer content={item.response} className="text-sm text-gray-200" />
                </div>
              </div>
            </div>
          ))}

          {/* Streaming Response Bubble */}
          {streamingResponse && (
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2 shrink-0 border border-emerald-500/30">
                <Bot className="h-4 w-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1 rounded-xl border border-emerald-500/30 bg-white/5 p-4 text-sm text-gray-200 shadow-md">
                <MarkdownRenderer content={streamingResponse} className="text-sm text-gray-200" isStreaming />
              </div>
            </div>
          )}

          {/* Loading state before first streaming chunk */}
          {isLoading && !streamingResponse && (
            <div className="flex items-center gap-3 text-sm text-violet-400 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing dataset & checking guardrails...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex gap-3 pt-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Ask a question about your dataset (e.g., 'What is the highest cost?')..."
            className="input-field flex-1"
            disabled={disabled || isLoading}
          />

          {micSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={disabled || isLoading}
              className={`btn-secondary px-4 transition-colors ${
                isListening
                  ? "border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : ""
              }`}
              title={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={disabled || isLoading || !prompt.trim()}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DatasetChat;



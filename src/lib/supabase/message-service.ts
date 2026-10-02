import { createClient } from "~/lib/supabase/client";
import type { ChatMessage } from "~/lib/chat-store";

export interface SaveMessageOptions {
  analysisId: string;
  prompt: string;
  response: string;
}

/**
 * Saves a user prompt and assistant response pair to the PostgreSQL 'messages' table.
 * Authenticated user ID is fetched from the server session.
 * Errors are caught and logged gracefully to prevent breaking the AI UI flow.
 */
export async function saveChatMessage(
  options: SaveMessageOptions,
): Promise<boolean> {
  const { analysisId, prompt, response } = options;
  if (!analysisId) return false;

  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn(
        "No authenticated user found while persisting chat message.",
      );
      return false;
    }

    // 1. Insert user message
    const { error: userMsgError } = await supabase.from("messages").insert({
      analysis_id: analysisId,
      user_id: user.id,
      role: "user",
      content: prompt,
    });

    if (userMsgError) {
      console.error("Failed to save user message to database:", userMsgError);
      return false;
    }

    // 2. Insert assistant response (only after complete)
    if (response) {
      const { error: assistantMsgError } = await supabase
        .from("messages")
        .insert({
          analysis_id: analysisId,
          user_id: user.id,
          role: "assistant",
          content: response,
        });

      if (assistantMsgError) {
        console.error(
          "Failed to save assistant message to database:",
          assistantMsgError,
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Unexpected error persisting chat message:", error);
    return false;
  }
}

/**
 * Fetches saved messages from PostgreSQL 'messages' table for the specified analysis ID
 * and converts them into ChatMessage pairs for the UI chat store.
 */
export async function loadAnalysisMessages(
  analysisId: string,
): Promise<ChatMessage[]> {
  if (!analysisId) return [];

  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return [];
    }

    const { data: rows, error: fetchError } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (fetchError || !rows) {
      console.error(
        "Failed to load analysis messages from database:",
        fetchError,
      );
      return [];
    }

    // Pair user and assistant messages into ChatMessage format
    const chatMessages: ChatMessage[] = [];
    let currentPrompt: string | null = null;

    for (const msg of rows) {
      if (msg.role === "user") {
        if (currentPrompt !== null) {
          // Unmatched user message
          chatMessages.push({ prompt: currentPrompt, response: "" });
        }
        currentPrompt = msg.content;
      } else if (msg.role === "assistant") {
        chatMessages.push({
          prompt: currentPrompt ?? "",
          response: msg.content,
        });
        currentPrompt = null;
      }
    }

    if (currentPrompt !== null) {
      chatMessages.push({ prompt: currentPrompt, response: "" });
    }

    return chatMessages;
  } catch (error) {
    console.error("Unexpected error loading analysis messages:", error);
    return [];
  }
}

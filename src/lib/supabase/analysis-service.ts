import { createClient } from "~/lib/supabase/client";

const ACTIVE_ANALYSIS_KEY = "csv_ai_active_analysis_id";

/**
 * Creates a new analysis session record in PostgreSQL 'analyses' table
 * and sets it as the active session in sessionStorage.
 */
export async function createAnalysisSession(
  title = "New Analysis",
): Promise<string | null> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn(
        "No authenticated user session found for analysis creation.",
      );
      return null;
    }

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        title,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to create analysis session:", error);
      return null;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(ACTIVE_ANALYSIS_KEY, data.id);
    }

    return data.id;
  } catch (error) {
    console.error("Unexpected error creating analysis session:", error);
    return null;
  }
}

/**
 * Retrieves the current active analysis ID from sessionStorage.
 */
export function getActiveAnalysisId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACTIVE_ANALYSIS_KEY);
}

/**
 * Sets the active analysis ID in sessionStorage.
 */
export function setActiveAnalysisId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) {
    sessionStorage.setItem(ACTIVE_ANALYSIS_KEY, id);
  } else {
    sessionStorage.removeItem(ACTIVE_ANALYSIS_KEY);
  }
}

/**
 * Ensures an active analysis ID exists. If none is found, creates a new one.
 */
export async function ensureActiveAnalysisId(
  title?: string,
): Promise<string | null> {
  const existing = getActiveAnalysisId();
  if (existing) return existing;
  return await createAnalysisSession(title);
}

/**
 * Renames an existing analysis title for the authenticated user.
 */
export async function renameAnalysis(
  analysisId: string,
  newTitle: string,
): Promise<boolean> {
  if (!analysisId || !newTitle.trim()) return false;

  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return false;

    const { error } = await supabase
      .from("analyses")
      .update({
        title: newTitle.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to rename analysis:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error renaming analysis:", error);
    return false;
  }
}

/**
 * Deletes an analysis, its Storage dataset file, and all cascading database records
 * (messages, analysis_results, datasets) for the authenticated user.
 */
export async function deleteAnalysis(analysisId: string): Promise<boolean> {
  if (!analysisId) return false;

  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return false;

    // 1. Get associated dataset storage path if available
    const { data: dataset } = await supabase
      .from("datasets")
      .select("storage_path")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (dataset?.storage_path) {
      // Delete dataset file from private Supabase Storage bucket 'datasets'
      const { error: storageError } = await supabase.storage
        .from("datasets")
        .remove([dataset.storage_path]);

      if (storageError) {
        console.warn("Storage deletion warning:", storageError);
      }
    }

    // 2. Delete analysis record (cascades to datasets, messages, analysis_results)
    const { error: deleteError } = await supabase
      .from("analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to delete analysis:", deleteError);
      return false;
    }

    // 3. Clear active analysis ID if it was the deleted analysis
    if (getActiveAnalysisId() === analysisId) {
      setActiveAnalysisId(null);
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting analysis:", error);
    return false;
  }
}

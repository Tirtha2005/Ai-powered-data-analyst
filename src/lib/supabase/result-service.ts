import { createClient } from "~/lib/supabase/client";
import type { Json } from "~/types/supabase";
import type {
  ChartSuggestion,
  DataSummaryResult,
  AnomalyResult,
} from "~/lib/ai-service";

export type AnalysisType =
  | "summary"
  | "chart"
  | "anomaly"
  | "question"
  | "python"
  | "custom";

export interface SaveResultOptions {
  analysisId: string;
  datasetId?: string | null;
  question?: string | null;
  answer?: string | null;
  analysisType: AnalysisType;
  chartData?: Json | null;
}

export interface AnalysisSessionSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface RestoredAnalysisResults {
  summary: DataSummaryResult | null;
  anomalies: AnomalyResult[] | null;
  charts: ChartSuggestion[];
}

/**
 * Persists an analysis result (summary, chart, anomaly, question, etc.) to PostgreSQL analysis_results table.
 * Automatically updates the parent analysis updated_at timestamp.
 */
export async function saveAnalysisResult(
  options: SaveResultOptions,
): Promise<boolean> {
  const {
    analysisId,
    datasetId = null,
    question = null,
    answer = null,
    analysisType,
    chartData = null,
  } = options;
  if (!analysisId) return false;

  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn(
        "No authenticated user found for persisting analysis result.",
      );
      return false;
    }

    // 1. Insert analysis result row
    const { error: insertError } = await supabase
      .from("analysis_results")
      .insert({
        analysis_id: analysisId,
        user_id: user.id,
        dataset_id: datasetId,
        question,
        answer,
        analysis_type: analysisType,
        chart_data: chartData,
      });

    if (insertError) {
      console.error("Failed to insert analysis result:", insertError);
      return false;
    }

    // 2. Touch parent analysis updated_at timestamp
    await supabase
      .from("analyses")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    return true;
  } catch (error) {
    console.error("Unexpected error in saveAnalysisResult:", error);
    return false;
  }
}

/**
 * Fetches all recent analyses for the currently authenticated user.
 */
export async function getUserAnalyses(): Promise<AnalysisSessionSummary[]> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return [];

    const { data, error } = await supabase
      .from("analyses")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error || !data) {
      console.error("Failed to fetch user analyses:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getUserAnalyses:", error);
    return [];
  }
}

/**
 * Loads all saved analysis_results for a specific analysis ID.
 */
export async function loadAnalysisResults(
  analysisId: string,
): Promise<RestoredAnalysisResults> {
  const supabase = createClient();

  const emptyResult: RestoredAnalysisResults = {
    summary: null,
    anomalies: null,
    charts: [],
  };

  if (!analysisId) return emptyResult;

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return emptyResult;

    const { data: rows, error: fetchError } = await supabase
      .from("analysis_results")
      .select("*")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (fetchError || !rows) {
      console.error("Failed to fetch analysis results:", fetchError);
      return emptyResult;
    }

    let summary: DataSummaryResult | null = null;
    let anomalies: AnomalyResult[] | null = null;
    const charts: ChartSuggestion[] = [];

    for (const row of rows) {
      if (row.analysis_type === "summary" && row.answer) {
        summary = { summary: row.answer, keyInsights: [], dataQuality: "Good" };
      } else if (row.analysis_type === "anomaly" && row.chart_data) {
        anomalies = row.chart_data as unknown as AnomalyResult[];
      } else if (row.analysis_type === "chart" && row.chart_data) {
        charts.push(row.chart_data as unknown as ChartSuggestion);
      }
    }

    return { summary, anomalies, charts };
  } catch (error) {
    console.error("Unexpected error in loadAnalysisResults:", error);
    return emptyResult;
  }
}

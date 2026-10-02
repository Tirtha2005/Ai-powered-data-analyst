import { createClient } from "~/lib/supabase/client";
import { setActiveAnalysisId } from "./analysis-service";
import { parseCSV, DEFAULT_CSV_SETTINGS, type CSVData } from "~/lib/csv-parser";
import { isXLSXFile, parseXLSX } from "~/lib/xlsx-parser";

export interface UploadDatasetOptions {
  file: File;
  fileName?: string;
  analysisTitle?: string;
}

export interface UploadDatasetResult {
  analysisId: string;
  datasetId: string;
  storagePath: string;
}

export interface RestoredDatasetResult {
  data: CSVData;
  fileName: string;
  file: File;
}

/**
 * Uploads a dataset file to the private Supabase Storage bucket 'datasets'
 * and records file metadata in the PostgreSQL 'analyses' and 'datasets' tables.
 */
export async function uploadDatasetToStorage(
  options: UploadDatasetOptions,
): Promise<UploadDatasetResult | null> {
  const { file, fileName = file.name, analysisTitle = fileName } = options;
  const supabase = createClient();

  // 1. Retrieve authenticated user (server session truth)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn("No authenticated user session found for Storage upload.");
    return null;
  }

  try {
    // 2. Create analysis session entry in PostgreSQL analyses table
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        title: analysisTitle,
      })
      .select("id")
      .single();

    if (analysisError || !analysis) {
      console.error(
        "Failed to create database analysis record:",
        analysisError,
      );
      return null;
    }

    setActiveAnalysisId(analysis.id);

    // 3. Define storage path: user_id/analysis_id/file_name
    const storagePath = `${user.id}/${analysis.id}/${fileName}`;

    // 4. Upload file to Supabase Storage 'datasets' bucket
    const { error: uploadError } = await supabase.storage
      .from("datasets")
      .upload(storagePath, file, {
        upsert: true,
        contentType:
          file.type ||
          (fileName.endsWith(".csv")
            ? "text/csv"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      });

    if (uploadError) {
      console.error("Failed to upload file to Supabase Storage:", uploadError);
      return null;
    }

    // 5. Store metadata in PostgreSQL datasets table
    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .insert({
        user_id: user.id,
        analysis_id: analysis.id,
        file_name: fileName,
        file_type:
          file.type ||
          (fileName.endsWith(".csv")
            ? "text/csv"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        file_size: file.size,
        storage_path: storagePath,
      })
      .select("id")
      .single();

    if (datasetError || !dataset) {
      console.error(
        "Failed to save dataset metadata to database:",
        datasetError,
      );
      return null;
    }

    return {
      analysisId: analysis.id,
      datasetId: dataset.id,
      storagePath,
    };
  } catch (error) {
    console.error("Unexpected error in uploadDatasetToStorage:", error);
    return null;
  }
}

/**
 * Downloads the original dataset file for an analysis session from the private
 * Supabase Storage bucket 'datasets' and parses it using existing CSV/XLSX parsers.
 */
export async function downloadAndParseDataset(
  analysisId: string,
): Promise<RestoredDatasetResult | null> {
  if (!analysisId) return null;

  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return null;

    // 1. Query dataset metadata from datasets table for this analysis
    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .select("file_name, storage_path, file_type")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (datasetError || !dataset || !dataset.storage_path) {
      return null;
    }

    // 2. Download original file from private Supabase Storage bucket 'datasets'
    const { data: blob, error: downloadError } = await supabase.storage
      .from("datasets")
      .download(dataset.storage_path);

    if (downloadError || !blob) {
      console.error(
        "Failed to download dataset file from Storage:",
        downloadError,
      );
      return null;
    }

    // 3. Convert Blob to File object
    const file = new File([blob], dataset.file_name, {
      type: dataset.file_type || blob.type || "application/octet-stream",
    });

    // 4. Parse using existing parsers (without uploading or duplicating records)
    let parsedData: CSVData;
    if (isXLSXFile(dataset.file_name)) {
      parsedData = await parseXLSX(file, DEFAULT_CSV_SETTINGS);
    } else {
      const text = await blob.text();
      parsedData = parseCSV(text, DEFAULT_CSV_SETTINGS);
    }

    return {
      data: parsedData,
      fileName: dataset.file_name,
      file,
    };
  } catch (error) {
    console.error("Unexpected error restoring original dataset:", error);
    return null;
  }
}

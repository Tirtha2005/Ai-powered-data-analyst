import Together from "together-ai";
import type { CodeInterpreterExecuteParams } from "together-ai/resources/code-interpreter.mjs";

export interface CodeInterpreterOutput {
  type: string;
  data: string;
}

export interface CodeInterpreterError {
  message: string;
}

export interface TogetherCodeInterpreterResponseData {
  session_id: string;
  status: string;
  outputs: CodeInterpreterOutput[];
  errors?: CodeInterpreterError[];
}

export interface RunPythonResult {
  session_id: string | null;
  status: string;
  outputs: CodeInterpreterOutput[];
  errors?: CodeInterpreterError[];
  error_message?: string;
}

/**
 * Executes Python code using Together Code Interpreter and returns the result.
 * @param code The Python code to execute
 * @param apiKey The Together AI API Key passed from the frontend
 * @param session_id Optional session ID to maintain state between executions
 * @param files Optional list of files to upload to the code interpreter
 * @returns The output of the executed code as a JSON
 */
export async function runPython(
  code: string,
  apiKey: string,
  session_id?: string,
  files?: Array<{ name: string; encoding: string; content: string }>,
): Promise<RunPythonResult> {
  try {
    const together = new Together({ apiKey });

    const kwargs: CodeInterpreterExecuteParams = { code, language: "python" };

    if (session_id) {
      kwargs.session_id = session_id;
    }

    if (files) {
      // kwargs.files = files; // If needed by Together
    }

    const response = await together.codeInterpreter.execute(kwargs);
    const data = response.data as TogetherCodeInterpreterResponseData;

    const result: RunPythonResult = {
      session_id: data.session_id || null,
      status: data.status || "unknown",
      outputs: [],
    };

    if (data.outputs) {
      for (const output of data.outputs) {
        result.outputs.push({ type: output.type, data: output.data });
      }
    }

    if (data.errors) {
      result.errors = data.errors;
    }

    return result;
  } catch (e: any) {
    const error_result: RunPythonResult = {
      status: "error",
      error_message: e.message || String(e),
      session_id: null,
      outputs: [],
    };
    return error_result;
  }
}

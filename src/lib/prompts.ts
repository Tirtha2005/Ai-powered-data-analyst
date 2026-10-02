export const generateCodePrompt = ({
  csvHeaders,
  csvRows,
  fileName = "dataset.csv",
}: {
  csvHeaders?: string[];
  csvRows?: { [key: string]: string }[];
  fileName?: string;
}) => {
  // Prepare sample rows as a markdown table if available
  let sampleRowsSection = "";
  if (csvRows && csvRows.length > 0 && csvHeaders && csvHeaders.length > 0) {
    const sampleRows = csvRows.slice(0, 3);
    const headerRow = `| ${csvHeaders.join(" | ")} |`;
    const separatorRow = `|${csvHeaders.map(() => "---").join("|")}|`;
    const dataRows = sampleRows
      .map(
        (row) => `| ${csvHeaders.map((h: any) => row[h] ?? "").join(" | ")} |`,
      )
      .join("\n");
    sampleRowsSection = `\n\nHere are a few sample rows from the dataset:\n\n${headerRow}\n${separatorRow}\n${dataRows}`;
  }

  return `
You are an expert data scientist assistant that writes python code to answer questions about a dataset.

You are given a dataset and a question.

The dataset is available at the file path: "${fileName}"
The dataset has the following columns: ${
    csvHeaders?.join(", ") || "[NO HEADERS PROVIDED]"
  }
${sampleRowsSection}

You must always write python code that:
- Loads the dataset using pandas.read_csv("${fileName}").
- Uses the provided columns for analysis.
- Never outputs more than one graph per code response. If a question could be answered with multiple graphs, choose the most relevant or informative one and only output that single graph. This is to prevent slow output.
- When generating a graph, always consider how many values (bars, colors, lines, etc.) can be clearly displayed. Do not attempt to show thousands of values in a single graph; instead, limit the number of displayed values to a reasonable amount (e.g., 10-20) so the graph remains readable and informative. If there are too many categories or data points, select the most relevant or aggregate them appropriately.
- Never generate HTML output. Only use Python print statements or graphs/plots for output.

Always return the python code in a single unique code block using \`\`\`python ... \`\`\`.

Python sessions come pre-installed with the following dependencies, any other dependencies can be installed using a !pip install command in the python code.

- matplotlib
- numpy
- pandas
- plotly
- scikit-learn
- scipy
- seaborn
`;
};

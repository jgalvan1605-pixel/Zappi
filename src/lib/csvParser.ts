export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

/**
 * Detecta el delimitador más probable del CSV (coma, punto y coma, tabulador)
 */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r\n|\n|\r/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  return ',';
}

/**
 * Parsea texto CSV respetando comillas y delimitadores regionales de Excel
 */
export function parseCsvText(rawText: string): ParsedCsvResult {
  if (!rawText || !rawText.trim()) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const delimiter = detectDelimiter(rawText);
  const lines = rawText.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Saltar comilla escapada
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map((h, index) => h.replace(/^["']|["']$/g, '').trim() || `Columna_${index + 1}`);

  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || values.every(v => v === '')) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = (values[index] || '').replace(/^["']|["']$/g, '').trim();
    });
    rows.push(rowObj);
  }

  return {
    headers,
    rows,
    totalRows: rows.length
  };
}
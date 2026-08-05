export interface ParsedTempleRow {
  rowNumber: number;
  temple_name: string;
  district_name_en: string;
  address_text?: string;
  latitude?: number | null;
  longitude?: number | null;
  source_note?: string;
  isValid: boolean;
  validationError?: string;
}

export interface RowValidationError {
  rowNumber: number;
  templeName: string;
  reason: string;
}

/**
 * Robust zero-dependency CSV parser handling quotes, line breaks, and whitespace trimming.
 */
export function parseTempleCsv(csvText: string): {
  rows: ParsedTempleRow[];
  totalRows: number;
  validRows: ParsedTempleRow[];
  invalidRows: ParsedTempleRow[];
} {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], totalRows: 0, validRows: [], invalidRows: [] };
  }

  // Helper to split CSV line respecting quotes
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  
  const templeNameIdx = headers.indexOf("temple_name");
  const districtIdx = headers.indexOf("district_name_en");
  const addressIdx = headers.indexOf("address_text");
  const latIdx = headers.indexOf("latitude");
  const lngIdx = headers.indexOf("longitude");
  const sourceIdx = headers.indexOf("source_note");

  const parsedRows: ParsedTempleRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const rowNum = i + 1;

    const temple_name = values[templeNameIdx !== -1 ? templeNameIdx : 0] || "";
    const district_name_en = values[districtIdx !== -1 ? districtIdx : 1] || "";
    const address_text = values[addressIdx !== -1 ? addressIdx : 2] || "";
    const rawLat = values[latIdx !== -1 ? latIdx : 3];
    const rawLng = values[lngIdx !== -1 ? lngIdx : 4];
    const source_note = values[sourceIdx !== -1 ? sourceIdx : 5] || "";

    const lat = rawLat && !isNaN(parseFloat(rawLat)) ? parseFloat(rawLat) : null;
    const lng = rawLng && !isNaN(parseFloat(rawLng)) ? parseFloat(rawLng) : null;

    let isValid = true;
    let validationError = "";

    if (!temple_name.trim()) {
      isValid = false;
      validationError = "Missing required 'temple_name'";
    } else if (!district_name_en.trim()) {
      isValid = false;
      validationError = "Missing required 'district_name_en'";
    }

    parsedRows.push({
      rowNumber: rowNum,
      temple_name: temple_name.replace(/^"|"$/g, "").trim(),
      district_name_en: district_name_en.replace(/^"|"$/g, "").trim(),
      address_text: address_text.replace(/^"|"$/g, "").trim(),
      latitude: lat,
      longitude: lng,
      source_note: source_note.replace(/^"|"$/g, "").trim(),
      isValid,
      validationError,
    });
  }

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  return {
    rows: parsedRows,
    totalRows: parsedRows.length,
    validRows,
    invalidRows,
  };
}

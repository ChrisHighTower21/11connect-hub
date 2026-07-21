export type ParsedScreenshotStats = {
  playerName: string | null;
  rating: number | null;

  goals: number | null;
  assists: number | null;
  shots: number | null;
  shotAccuracy: number | null;

  passes: number | null;
  passAccuracy: number | null;

  dribbles: number | null;
  dribbleSuccessRate: number | null;

  tackles: number | null;
  tackleSuccessRate: number | null;

  offsides: number | null;
  foulsCommitted: number | null;

  possessionWon: number | null;
  possessionLost: number | null;

  minutesPlayed: number | null;
  distanceKm: number | null;
  sprintDistanceKm: number | null;
};

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[|]/g, "I")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function parseNumber(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function matchPlayerColumn(
  text: string,
  labelPatterns: string[]
): number | null {
  for (const labelPattern of labelPatterns) {
    const pattern = new RegExp(
      `${labelPattern}[^\\d\\n]{0,30}(\\d+(?:[.,]\\d+)?)\\s+(\\d+(?:[.,]\\d+)?)`,
      "i"
    );

    const match = text.match(pattern);

    if (match?.[1]) {
      return parseNumber(match[1]);
    }
  }

  return null;
}

function matchSingleNumber(
  text: string,
  patterns: RegExp[]
): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return parseNumber(match[1]);
    }
  }

  return null;
}

function extractPlayerName(text: string): string | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(
      /^\d{1,3}\s+([A-ZÄÖÜ][A-Za-zÄÖÜäöüß .'-]{2,30})$/
    );

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export function parseScreenshotText(
  rawText: string
): ParsedScreenshotStats {
  const text = normalizeText(rawText);

  return {
    playerName: extractPlayerName(text),

    rating: matchSingleNumber(text, [
      /gesamtwert[^0-9]{0,20}(\d{1,2}[.,]\d)/i,
      /bewertung[^0-9]{0,20}(\d{1,2}[.,]\d)/i,
    ]),

    goals: matchPlayerColumn(text, [
      "tore",
    ]),

    assists: matchPlayerColumn(text, [
      "torvorlagen",
    ]),

    shots: matchPlayerColumn(text, [
      "schüsse",
      "schusse",
    ]),

    shotAccuracy: matchPlayerColumn(text, [
      "schussgenauigkeit(?:\\s*\\(%\\))?",
    ]),

    passes: matchPlayerColumn(text, [
      "pässe",
      "passe",
    ]),

    passAccuracy: matchPlayerColumn(text, [
      "passgenauigkeit(?:\\s*\\(%\\))?",
    ]),

    dribbles: matchPlayerColumn(text, [
      "dribblings",
    ]),

    dribbleSuccessRate: matchPlayerColumn(text, [
      "dribbling[- ]?erfolgsquote(?:\\s*\\(%\\))?",
    ]),

    tackles: matchPlayerColumn(text, [
      "zweikämpfe",
      "zweikampfe",
    ]),

    tackleSuccessRate: matchPlayerColumn(text, [
      "zweikampf[- ]?erfolgsquote(?:\\s*\\(%\\))?",
    ]),

    offsides: matchPlayerColumn(text, [
      "abseits",
    ]),

    foulsCommitted: matchPlayerColumn(text, [
      "begangene fouls",
    ]),

    possessionWon: matchPlayerColumn(text, [
      "ballbesitz erobert",
    ]),

    possessionLost: matchPlayerColumn(text, [
      "ballverlust",
      "ballverluste",
    ]),

    minutesPlayed: matchPlayerColumn(text, [
      "gespielte minuten(?:\\/teamschnitt)?",
    ]),

    distanceKm: matchPlayerColumn(text, [
      "laufwege?(?:\\/teamschnitt)?(?:\\s*\\(km\\))?",
    ]),

    sprintDistanceKm: matchPlayerColumn(text, [
      "sprintdistanz(?:\\/teamschnitt)?(?:\\s*\\(km\\))?",
    ]),
  };
}
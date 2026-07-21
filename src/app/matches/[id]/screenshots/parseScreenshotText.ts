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

function normalizeOcrNumberToken(token: string): number | null {
  const normalized = token
    .trim()
    .replace(/[OoQ]/g, "0")
    .replace(/[Il|]/g, "1")
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
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const labelPattern of labelPatterns) {
    const labelRegex = new RegExp(labelPattern, "i");

    for (const line of lines) {
      const labelMatch = line.match(labelRegex);

      if (!labelMatch || labelMatch.index === undefined) {
        continue;
      }

      const valueArea = line.slice(
        labelMatch.index + labelMatch[0].length
      );

      const tokens =
        valueArea.match(
          /[0-9OoQIl|]+(?:[.,][0-9OoQIl|]+)?/g
        ) ?? [];

      if (tokens.length === 0) {
        continue;
      }

      const firstToken = tokens[0];

if (!firstToken) {
  continue;
}

const normalizedToken = firstToken
  .replace(/[OoQ]/g, "0")
  .replace(/[Il|]/g, "1");

      /*
       * OCR verbindet gelegentlich beide Spalten:
       *
       * Torvorlagen 04
       *
       * Das bedeutet:
       * Spielerwert 0, Teamwert 4.
       */
      if (
        tokens.length === 1 &&
        !normalizedToken.includes(",") &&
        !normalizedToken.includes(".") &&
        normalizedToken.length >= 2 &&
        normalizedToken.startsWith("0")
      ) {
        return 0;
      }

      const value = normalizeOcrNumberToken(firstToken);

      if (value !== null) {
        return value;
      }
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
      "\\btore\\b",
    ]),

    assists: matchPlayerColumn(text, [
      "\\btorvorlagen?\\b",
    ]),

    shots: matchPlayerColumn(text, [
      "\\bschüsse\\b",
      "\\bschusse\\b",
    ]),

    shotAccuracy: matchPlayerColumn(text, [
      "schussgenauigkeit(?:\\s*\\(%\\))?",
    ]),

    passes: matchPlayerColumn(text, [
      "\\bpässe\\b",
      "\\bpasse\\b",
    ]),

    passAccuracy: matchPlayerColumn(text, [
      "passgenauigkeit(?:\\s*\\(%\\))?",
    ]),

    dribbles: matchPlayerColumn(text, [
      "\\bdribblings?\\b",
    ]),

    dribbleSuccessRate: matchPlayerColumn(text, [
      "dribbling[- ]?erfolgsquote(?:\\s*\\(%\\))?",
    ]),

    tackles: matchPlayerColumn(text, [
      "\\bzweikämpfe\\b",
      "\\bzweikampfe\\b",
    ]),

    tackleSuccessRate: matchPlayerColumn(text, [
      "zweikampf[- ]?erfolgsquote(?:\\s*\\(%\\))?",
    ]),

    offsides: matchPlayerColumn(text, [
      "\\babseits\\b",
    ]),

    foulsCommitted: matchPlayerColumn(text, [
      "begangene\\s+fouls",
    ]),

    possessionWon: matchPlayerColumn(text, [
      "ballbesitz\\s+erobert",
    ]),

    possessionLost: matchPlayerColumn(text, [
      "\\bballverlust(?:e)?\\b",
    ]),

    minutesPlayed: matchPlayerColumn(text, [
      "gespielte\\s+minuten(?:\\/teamschnitt)?",
    ]),

    distanceKm: matchPlayerColumn(text, [
      "laufwege?(?:\\/teamschnitt)?(?:\\s*\\(km\\))?",
    ]),

    sprintDistanceKm: matchPlayerColumn(text, [
      "sprintdistanz(?:\\/teamschnitt)?(?:\\s*\\(km\\))?",
    ]),
  };
}
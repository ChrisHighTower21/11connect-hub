export type ParsedScreenshotStats = {
  playerEaId: string | null;
  rating: number | null;

  goals: number | null;
  assists: number | null;

  shotAccuracy: number | null;
  passesCompleted: number | null;
  passesAttempted: number | null;
  passAccuracy: number | null;

  dribblesCompleted: number | null;
  dribblesAttempted: number | null;
  dribbleSuccessRate: number | null;

  tacklesCompleted: number | null;
  tacklesAttempted: number | null;

  possessionWon: number | null;
  possessionLost: number | null;

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
    .replace(/(\d),(\d)/g, "$1.$2")
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

function matchNumber(
  text: string,
  patterns: RegExp[]
): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const value = parseNumber(match[1]);

      if (value !== null) {
        return value;
      }
    }
  }

  return null;
}

function matchPair(
  text: string,
  patterns: RegExp[]
): {
  completed: number | null;
  attempted: number | null;
} {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1] && match?.[2]) {
      return {
        completed: parseNumber(match[1]),
        attempted: parseNumber(match[2]),
      };
    }
  }

  return {
    completed: null,
    attempted: null,
  };
}

function calculatePercentage(
  completed: number | null,
  attempted: number | null
): number | null {
  if (
    completed === null ||
    attempted === null ||
    attempted <= 0
  ) {
    return null;
  }

  return Math.round((completed / attempted) * 100);
}

function extractPlayerEaId(text: string): string | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ignoredTerms = [
    "spielerleistung",
    "übersicht",
    "schussverhalten",
    "player of the match",
    "gesamtwert",
    "tore",
    "torvorlagen",
    "pässe",
    "passgenauigkeit",
    "laufleistung",
  ];

  for (const line of lines) {
    const directMatch = line.match(
      /^\d{1,3}\s+([A-ZÄÖÜ][A-Za-zÄÖÜäöüß .'-]{2,30})$/
    );

    if (directMatch?.[1]) {
      return directMatch[1].trim();
    }

    const cleaned = line
      .replace(/^\d{1,3}\s+/, "")
      .replace(/\s+\d+(?:[.,]\d+)?$/, "")
      .trim();

    const lower = cleaned.toLowerCase();

    const looksLikeName =
      cleaned.length >= 3 &&
      cleaned.length <= 35 &&
      /^[A-Za-zÄÖÜäöüß .'-]+$/.test(cleaned) &&
      !ignoredTerms.some((term) => lower.includes(term));

    if (looksLikeName) {
      return cleaned;
    }
  }

  return null;
}

export function parseScreenshotText(
  rawText: string
): ParsedScreenshotStats {
  const text = normalizeText(rawText);

  const passes = matchPair(text, [
    /pässe?\s+(\d+)\s*[/|von]+\s*(\d+)/i,
    /pässe?\s+(\d+)\s+(\d+)/i,
    /passe?\s+(\d+)\s+(\d+)/i,
  ]);

  const dribbles = matchPair(text, [
    /dribbling[- ]?erfolgsquote.*?(\d+)\s*[/|von]+\s*(\d+)/i,
    /dribblings?\s+(\d+)\s*[/|von]+\s*(\d+)/i,
    /dribblings?\s+(\d+)\s+(\d+)/i,
  ]);

  const tackles = matchPair(text, [
    /zweikämpfe?\s+(\d+)\s*[/|von]+\s*(\d+)/i,
    /zweikampf.*?(\d+)\s+(\d+)/i,
    /tacklings?\s+(\d+)\s*[/|von]+\s*(\d+)/i,
  ]);

  const explicitPassAccuracy = matchNumber(text, [
    /passgenauigkeit[^0-9]{0,20}(\d{1,3})\s*%/i,
    /passgenauigkeit[^0-9]{0,20}(\d{1,3})/i,
  ]);

  const explicitDribbleRate = matchNumber(text, [
    /dribbling[- ]?erfolgsquote[^0-9]{0,20}(\d{1,3})\s*%/i,
    /dribbling[- ]?erfolgsquote[^0-9]{0,20}(\d{1,3})/i,
  ]);

  return {
    playerEaId: extractPlayerEaId(text),

    rating: matchNumber(text, [
      /gesamtwert[^0-9]{0,20}(\d{1,2}[.,]\d)/i,
      /bewertung[^0-9]{0,20}(\d{1,2}[.,]\d)/i,
      /note[^0-9]{0,20}(\d{1,2}[.,]\d)/i,
    ]),

    goals: matchNumber(text, [
      /(?:^|\n)\s*tore?[^0-9]{0,15}(\d+)/im,
      /(?:^|\n)\s*goals?[^0-9]{0,15}(\d+)/im,
    ]),

    assists: matchNumber(text, [
      /torvorlagen?[^0-9]{0,15}(\d+)/i,
      /assists?[^0-9]{0,15}(\d+)/i,
    ]),

    shotAccuracy: matchNumber(text, [
      /schussgenauigkeit[^0-9]{0,20}(\d{1,3})\s*%/i,
      /schussgenauigkeit[^0-9]{0,20}(\d{1,3})/i,
    ]),

    passesCompleted: passes.completed,
    passesAttempted: passes.attempted,

    passAccuracy:
      explicitPassAccuracy ??
      calculatePercentage(
        passes.completed,
        passes.attempted
      ),

    dribblesCompleted: dribbles.completed,
    dribblesAttempted: dribbles.attempted,

    dribbleSuccessRate:
      explicitDribbleRate ??
      calculatePercentage(
        dribbles.completed,
        dribbles.attempted
      ),

    tacklesCompleted: tackles.completed,
    tacklesAttempted: tackles.attempted,

    possessionWon: matchNumber(text, [
      /ballbesitz\s+erobert[^0-9]{0,20}(\d+)/i,
      /erobert[^0-9]{0,20}(\d+)/i,
      /possession\s+won[^0-9]{0,20}(\d+)/i,
    ]),

    possessionLost: matchNumber(text, [
      /ballverlust(?:e)?[^0-9]{0,20}(\d+)/i,
      /possession\s+lost[^0-9]{0,20}(\d+)/i,
    ]),

    distanceKm: matchNumber(text, [
      /laufweg(?:e)?[^0-9]{0,25}(\d{1,3}[.,]\d+)\s*km/i,
      /team[s]?chnitt[^0-9]{0,20}(\d{1,3}[.,]\d+)/i,
      /distanz[^0-9]{0,20}(\d{1,3}[.,]\d+)\s*km/i,
    ]),

    sprintDistanceKm: matchNumber(text, [
      /sprintdistanz[^0-9]{0,25}(\d{1,3}[.,]\d+)\s*km/i,
      /sprintdistanz[^0-9]{0,25}(\d{1,3}[.,]\d+)/i,
    ]),
  };
}

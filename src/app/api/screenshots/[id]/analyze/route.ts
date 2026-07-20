import OpenAI from "openai";
import { get } from "@vercel/blob";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: {
    id: string;
  };
};

const EaFcScreenshotSchema = z.object({
  playerName: z.string().nullable(),
  position: z.string().nullable(),

  rating: z.number().min(0).max(10).nullable(),
  goals: z.number().int().min(0).nullable(),
  assists: z.number().int().min(0).nullable(),

  shots: z.number().int().min(0).nullable(),
  shotsOnTarget: z.number().int().min(0).nullable(),
  shotAccuracy: z.number().min(0).max(100).nullable(),

  passes: z.number().int().min(0).nullable(),
  successfulPasses: z.number().int().min(0).nullable(),
  passAccuracy: z.number().min(0).max(100).nullable(),

  dribbles: z.number().int().min(0).nullable(),
  successfulDribbles: z.number().int().min(0).nullable(),
  dribbleAccuracy: z.number().min(0).max(100).nullable(),

  duels: z.number().int().min(0).nullable(),
  successfulDuels: z.number().int().min(0).nullable(),
  duelAccuracy: z.number().min(0).max(100).nullable(),

  tackles: z.number().int().min(0).nullable(),
  successfulTackles: z.number().int().min(0).nullable(),
  interceptions: z.number().int().min(0).nullable(),

  possessionWon: z.number().int().min(0).nullable(),
  possessionLost: z.number().int().min(0).nullable(),

  fouls: z.number().int().min(0).nullable(),
  offsides: z.number().int().min(0).nullable(),

  minutesPlayed: z.number().int().min(0).nullable(),
  distanceKm: z.number().min(0).nullable(),
  sprintDistanceKm: z.number().min(0).nullable(),

  saves: z.number().int().min(0).nullable(),
  goalsConceded: z.number().int().min(0).nullable(),
  savePercentage: z.number().min(0).max(100).nullable(),

  isPlayerOfTheMatch: z.boolean().nullable(),

  screenshotCategory: z.enum([
    "OVERVIEW",
    "POSSESSION",
    "SHOOTING",
    "PASSING",
    "DEFENDING",
    "GOALKEEPER",
    "OTHER",
  ]),

  extractionConfidence: z.number().min(0).max(1),

  warnings: z.array(z.string()),
});

type EaFcScreenshotData = z.infer<typeof EaFcScreenshotSchema>;

function normalizePlayerName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function calculateNameSimilarity(a: string, b: string) {
  const left = normalizePlayerName(a);
  const right = normalizePlayerName(b);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  if (left.includes(right) || right.includes(left)) {
    return 0.9;
  }

  const maxLength = Math.max(left.length, right.length);
  const distance = levenshteinDistance(left, right);

  return Math.max(0, 1 - distance / maxLength);
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from(
    { length: b.length + 1 },
    () => Array<number>(a.length + 1).fill(0)
  );

  for (let i = 0; i <= b.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= a.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

function findMatchingPlayer(
  extractedName: string | null,
  players: Array<{
    id: string;
    name: string;
    eaId: string | null;
  }>
) {
  if (!extractedName) {
    return null;
  }

  const candidates = players
    .flatMap((player) => {
      const names = [
        {
          value: player.name,
          source: "name",
        },
        ...(player.eaId
          ? [
              {
                value: player.eaId,
                source: "eaId",
              },
            ]
          : []),
      ];

      return names.map((candidate) => ({
        player,
        source: candidate.source,
        similarity: calculateNameSimilarity(
          extractedName,
          candidate.value
        ),
      }));
    })
    .sort((a, b) => b.similarity - a.similarity);

  const bestCandidate = candidates[0];

  if (!bestCandidate || bestCandidate.similarity < 0.72) {
    return null;
  }

  return bestCandidate;
}

async function blobToDataUrl(
  filePath: string,
  fallbackContentType: string | null
) {
  const blobResult = await get(filePath, {
    access: "private",
  });

  if (
    !blobResult ||
    blobResult.statusCode !== 200 ||
    !blobResult.stream
  ) {
    throw new Error("Der private Screenshot konnte nicht geladen werden.");
  }

  const response = new Response(blobResult.stream);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const contentType =
    blobResult.blob.contentType ||
    fallbackContentType ||
    "image/jpeg";

  return `data:${contentType};base64,${base64}`;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  let analysisId: string | null = null;

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY fehlt in den Umgebungsvariablen.",
        },
        {
          status: 500,
        }
      );
    }

    const screenshot = await prisma.matchScreenshot.findUnique({
      where: {
        id: params.id,
      },
      include: {
        match: {
          include: {
            squad: {
              include: {
                player: {
                  select: {
                    id: true,
                    name: true,
                    eaId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!screenshot) {
      return NextResponse.json(
        {
          error: "Screenshot nicht gefunden.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.matchScreenshot.update({
      where: {
        id: screenshot.id,
      },
      data: {
        status: "ANALYZING",
      },
    });

    const analysis = await prisma.screenshotAnalysis.create({
      data: {
        screenshotId: screenshot.id,
        status: "ANALYZING",
      },
    });

    analysisId = analysis.id;

    const imageDataUrl = await blobToDataUrl(
      screenshot.filePath,
      screenshot.fileType
    );

    const squadPlayers = screenshot.match.squad.map(
      (entry) => entry.player
    );

    const availablePlayersText =
      squadPlayers.length > 0
        ? squadPlayers
            .map(
              (player) =>
                `- ${player.name}${
                  player.eaId ? ` | EA-ID: ${player.eaId}` : ""
                }`
            )
            .join("\n")
        : "Für dieses Match wurde noch kein Kader hinterlegt.";

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.parse({
      model: "gpt-4.1-mini",

      input: [
        {
          role: "system",
          content:
            "Du extrahierst ausschließlich sichtbare EA-FC-Pro-Clubs-Spielerstatistiken aus Screenshots. Erfinde keine Werte. Nicht sichtbare oder nicht eindeutig lesbare Werte müssen null sein. Prozentwerte werden als Zahl von 0 bis 100 ausgegeben. Distanzen werden in Kilometer ausgegeben. extractionConfidence liegt zwischen 0 und 1.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analysiere diesen EA-FC-Spielerleistungs-Screenshot.

Aufgaben:

1. Lies den sichtbaren Spielernamen beziehungsweise die EA-ID.
2. Ermittle die sichtbare Position.
3. Extrahiere alle eindeutig sichtbaren Leistungswerte.
4. Erkenne automatisch die Screenshot-Kategorie.
5. Nutze ausschließlich Werte, die im Bild tatsächlich erkennbar sind.
6. Nutze null für nicht sichtbare oder unsichere Felder.
7. Verwende warnings für Unklarheiten.

Spieler im aktuellen Match-Kader:

${availablePlayersText}

Die Kaderliste dient nur als Zuordnungshilfe. Übernimm keinen Namen aus der Liste, wenn er nicht plausibel zum sichtbaren Namen im Screenshot passt.
              `.trim(),
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
              detail: "high",
            },
          ],
        },
      ],

      text: {
        format: zodTextFormat(
          EaFcScreenshotSchema,
          "ea_fc_player_statistics"
        ),
      },
    });

    const extracted = response.output_parsed as
      | EaFcScreenshotData
      | null;

    if (!extracted) {
      throw new Error(
        "Die KI hat kein strukturiertes Ergebnis zurückgegeben."
      );
    }

    const playerMatch = findMatchingPlayer(
      extracted.playerName,
      squadPlayers
    );

    const enrichedResult = {
      ...extracted,

      suggestedPlayerId: playerMatch?.player.id ?? null,
      suggestedPlayerName: playerMatch?.player.name ?? null,
      playerMatchSource: playerMatch?.source ?? null,
      playerMatchConfidence:
        playerMatch?.similarity ?? 0,

      analyzedAt: new Date().toISOString(),
    };

    const shouldAssignPlayer =
      playerMatch !== null &&
      playerMatch.similarity >= 0.86;

    await prisma.$transaction([
      prisma.screenshotAnalysis.update({
        where: {
          id: analysis.id,
        },
        data: {
          status: "DONE",
          rawText: JSON.stringify(enrichedResult, null, 2),
          structuredData:
            enrichedResult as unknown as Prisma.InputJsonValue,
          confidence: extracted.extractionConfidence,
          errorMessage: null,
        },
      }),

      prisma.matchScreenshot.update({
        where: {
          id: screenshot.id,
        },
        data: {
          status: "REVIEW",
          category: extracted.screenshotCategory,
          playerId: shouldAssignPlayer
            ? playerMatch.player.id
            : null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      screenshotId: screenshot.id,
      result: enrichedResult,
      playerAssignedAutomatically: shouldAssignPlayer,
    });
  } catch (error) {
    console.error("Screenshot-Analyse fehlgeschlagen:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler bei der Screenshot-Analyse.";

    if (analysisId) {
      await prisma.screenshotAnalysis
        .update({
          where: {
            id: analysisId,
          },
          data: {
            status: "FAILED",
            errorMessage,
          },
        })
        .catch((databaseError) => {
          console.error(
            "Analyse-Fehlerstatus konnte nicht gespeichert werden:",
            databaseError
          );
        });
    }

    await prisma.matchScreenshot
  .updateMany({
    where: {
      id: params.id,
    },
    data: {
      status: "FAILED",
    },
  })
  .catch((databaseError) => {
    console.error(
      "Screenshot-Fehlerstatus konnte nicht gespeichert werden:",
      databaseError
    );
  });

    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { calculateMatchResult } from "@/lib/calculations";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        season: {
          include: {
            competition: true,
          },
        },
      },
      orderBy: {
        matchDate: "desc",
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/matches failed:", error);

    return NextResponse.json(
      {
        error: "Spiele konnten nicht geladen werden.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const seasonId =
      typeof body.seasonId === "string"
        ? body.seasonId.trim()
        : "";

    const opponent =
      typeof body.opponent === "string"
        ? body.opponent.trim()
        : "";

    const homeAway =
      body.homeAway === "AWAY"
        ? "AWAY"
        : "HOME";

    const matchday =
      typeof body.matchday === "string" && body.matchday.trim()
        ? body.matchday.trim()
        : null;

    const teamGoals = Number(body.teamGoals);
    const opponentGoals = Number(body.opponentGoals);

    if (!seasonId) {
      return NextResponse.json(
        {
          error: "Bitte wähle eine Saison aus.",
        },
        {
          status: 400,
        }
      );
    }

    if (!opponent) {
      return NextResponse.json(
        {
          error: "Bitte gib einen Gegner an.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.matchDate) {
      return NextResponse.json(
        {
          error: "Bitte gib ein Spieldatum an.",
        },
        {
          status: 400,
        }
      );
    }

    const matchDate = new Date(body.matchDate);

    if (Number.isNaN(matchDate.getTime())) {
      return NextResponse.json(
        {
          error: "Das Spieldatum ist ungültig.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(teamGoals) ||
      teamGoals < 0 ||
      !Number.isInteger(opponentGoals) ||
      opponentGoals < 0
    ) {
      return NextResponse.json(
        {
          error: "Bitte gib gültige Torwerte ein.",
        },
        {
          status: 400,
        }
      );
    }

    const season = await prisma.season.findUnique({
      where: {
        id: seasonId,
      },
      select: {
        id: true,
      },
    });

    if (!season) {
      return NextResponse.json(
        {
          error: "Die ausgewählte Saison wurde nicht gefunden.",
        },
        {
          status: 404,
        }
      );
    }

    const match = await prisma.match.create({
      data: {
        seasonId,
        matchDate,
        opponent,
        homeAway,
        matchday,
        teamGoals,
        opponentGoals,
        result: calculateMatchResult(teamGoals, opponentGoals),
        status: "DRAFT",
      },
      include: {
        season: {
          include: {
            competition: true,
          },
        },
      },
    });

    revalidatePath("/matches");
    revalidatePath("/");
    revalidatePath("/team");
    revalidatePath("/stats");

    return NextResponse.json(match, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/matches failed:", error);

    return NextResponse.json(
      {
        error: "Spiel konnte nicht gespeichert werden.",
      },
      {
        status: 500,
      }
    );
  }
}
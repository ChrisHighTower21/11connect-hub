import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("GET /api/players failed:", error);

    return NextResponse.json(
      {
        error: "Spieler konnten nicht geladen werden.",
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error: "Der Spielername ist erforderlich.",
        },
        {
          status: 400,
        }
      );
    }

    const shirtNumber = parseShirtNumber(body.shirtNumber);

    if (shirtNumber === undefined) {
      return NextResponse.json(
        {
          error: "Die Trikotnummer muss zwischen 1 und 99 liegen.",
        },
        {
          status: 400,
        }
      );
    }

    let joinedAt: Date | null = null;

    if (body.joinedAt) {
      joinedAt = new Date(body.joinedAt);

      if (Number.isNaN(joinedAt.getTime())) {
        return NextResponse.json(
          {
            error: "Das Eintrittsdatum ist ungültig.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const player = await prisma.player.create({
      data: {
        name,
        eaId:
          typeof body.eaId === "string" && body.eaId.trim()
            ? body.eaId.trim()
            : null,
        shirtNumber,
        mainPosition:
          typeof body.mainPosition === "string" &&
          body.mainPosition.trim()
            ? body.mainPosition.trim()
            : null,
        secondaryPosition:
          typeof body.secondaryPosition === "string" &&
          body.secondaryPosition.trim()
            ? body.secondaryPosition.trim()
            : null,
        discordName:
          typeof body.discordName === "string" &&
          body.discordName.trim()
            ? body.discordName.trim()
            : null,
        joinedAt,
        isActive: true,
      },
    });

    return NextResponse.json(player, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/players failed:", error);

    return NextResponse.json(
      {
        error: "Spieler konnte nicht gespeichert werden.",
      },
      {
        status: 500,
      }
    );
  }
}

function parseShirtNumber(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 99
    ? parsed
    : undefined;
}
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const playerId =
      typeof body.playerId === "string"
        ? body.playerId.trim()
        : "";

    if (!playerId) {
      return NextResponse.json(
        {
          error: "Keine Spieler-ID übergeben.",
        },
        {
          status: 400,
        }
      );
    }

    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        {
          error: `Spieler mit der ID ${playerId} wurde nicht gefunden.`,
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction([
      prisma.playerMatchStat.deleteMany({
        where: {
          playerId,
        },
      }),

      prisma.matchSquad.deleteMany({
        where: {
          playerId,
        },
      }),

      prisma.player.delete({
        where: {
          id: playerId,
        },
      }),
    ]);
revalidatePath("/players");
revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `${player.name} wurde gelöscht.`,
    });
  } catch (error) {
    console.error("DELETE /api/players failed:", error);

    return NextResponse.json(
      {
        error: "Spieler konnte nicht gelöscht werden.",
      },
      {
        status: 500,
      }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const player = await prisma.player.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!player) {
      return NextResponse.json(
        {
          error: "Spieler wurde nicht gefunden.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("GET /api/players/[id] failed:", error);

    return NextResponse.json(
      {
        error: "Spieler konnte nicht geladen werden.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
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

    const player = await prisma.player.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        eaId:
          typeof body.eaId === "string" && body.eaId.trim()
            ? body.eaId.trim()
            : null,
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
        isActive:
          typeof body.isActive === "boolean"
            ? body.isActive
            : true,
      },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error("PATCH /api/players/[id] failed:", error);

    return NextResponse.json(
      {
        error: "Spieler konnte nicht aktualisiert werden.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const player = await prisma.player.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        {
          error: "Spieler wurde nicht gefunden.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction([
      prisma.playerMatchStat.deleteMany({
        where: {
          playerId: params.id,
        },
      }),

      prisma.matchSquad.deleteMany({
        where: {
          playerId: params.id,
        },
      }),

      prisma.player.delete({
        where: {
          id: params.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `${player.name} wurde gelöscht.`,
    });
  } catch (error) {
    console.error("DELETE /api/players/[id] failed:", error);

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
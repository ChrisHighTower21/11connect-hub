import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const body = await request.json();

  const player = await prisma.player.create({
    data: {
      name: body.name,
      eaId: body.eaId || null,
      mainPosition: body.mainPosition || null,
      secondaryPosition: body.secondaryPosition || null,
      discordName: body.discordName || null,
      joinedAt: body.joinedAt ? new Date(body.joinedAt) : null,
      isActive: true,
    },
  });

  return NextResponse.json(player);
}
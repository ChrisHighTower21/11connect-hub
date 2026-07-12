import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateMatchResult } from "@/lib/calculations";

export async function GET() {
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
}

export async function POST(request: Request) {
  const body = await request.json();

  const teamGoals = Number(body.teamGoals);
  const opponentGoals = Number(body.opponentGoals);

  const match = await prisma.match.create({
    data: {
      seasonId: body.seasonId,
      matchDate: new Date(body.matchDate),
      opponent: body.opponent,
      homeAway: body.homeAway,
      matchday: body.matchday || null,
      teamGoals,
      opponentGoals,
      result: calculateMatchResult(teamGoals, opponentGoals),
      status: "DRAFT",
    },
  });

  return NextResponse.json(match);
}
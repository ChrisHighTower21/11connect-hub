import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const playerIds: string[] = body.playerIds ?? [];

  await prisma.matchSquad.deleteMany({
    where: {
      matchId: params.id,
    },
  });

  if (playerIds.length > 0) {
    await prisma.matchSquad.createMany({
      data: playerIds.map((playerId) => ({
        matchId: params.id,
        playerId,
      })),
    });
  }

  const squadCount = await prisma.matchSquad.count({
  where: {
    matchId: params.id,
  },
});

const statsCount = await prisma.playerMatchStat.count({
  where: {
    matchId: params.id,
  },
});

let status = "DRAFT";

if (squadCount > 0 && statsCount === 0) {
  status = "DRAFT";
}

if (squadCount > 0 && statsCount > 0 && statsCount < squadCount) {
  status = "IN_PROGRESS";
}

if (squadCount > 0 && statsCount >= squadCount) {
  status = "COMPLETED";
}

await prisma.match.update({
  where: {
    id: params.id,
  },
  data: {
    status,
  },
});

  return NextResponse.json({
    success: true,
  });
}
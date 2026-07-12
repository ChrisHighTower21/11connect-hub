import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateSuccessfulValue } from "@/lib/calculations";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const shots = Number(body.shots);
  const shotAccuracy = Number(body.shotAccuracy);

  const passes = Number(body.passes);
  const passAccuracy = Number(body.passAccuracy);

  const dribbles = Number(body.dribbles);
  const dribbleSuccessRate = Number(body.dribbleSuccessRate);

  const duels = Number(body.duels);
  const duelSuccessRate = Number(body.duelSuccessRate);

  const stat = await prisma.playerMatchStat.upsert({
    where: {
      matchId_playerId: {
        matchId: params.id,
        playerId: body.playerId,
      },
    },
    update: {
      position: body.position || null,
      rating: Number(body.rating),
      isPotm: Boolean(body.isPotm),

      goals: Number(body.goals),
      assists: Number(body.assists),

      shots,
      shotAccuracy,
      shotsOnTarget: calculateSuccessfulValue(shots, shotAccuracy),

      passes,
      passAccuracy,
      successfulPasses: calculateSuccessfulValue(passes, passAccuracy),

      dribbles,
      dribbleSuccessRate,
      successfulDribbles: calculateSuccessfulValue(
        dribbles,
        dribbleSuccessRate
      ),

      duels,
      duelSuccessRate,
      successfulDuels: calculateSuccessfulValue(duels, duelSuccessRate),

      offsides: Number(body.offsides),
      fouls: Number(body.fouls),

      possessionWon: Number(body.possessionWon),
      possessionLost: Number(body.possessionLost),

      minutesPlayed: Number(body.minutesPlayed),
      distanceKm: Number(body.distanceKm),
      sprintDistanceKm: Number(body.sprintDistanceKm),
    },
    create: {
      matchId: params.id,
      playerId: body.playerId,

      position: body.position || null,
      rating: Number(body.rating),
      isPotm: Boolean(body.isPotm),

      goals: Number(body.goals),
      assists: Number(body.assists),

      shots,
      shotAccuracy,
      shotsOnTarget: calculateSuccessfulValue(shots, shotAccuracy),

      passes,
      passAccuracy,
      successfulPasses: calculateSuccessfulValue(passes, passAccuracy),

      dribbles,
      dribbleSuccessRate,
      successfulDribbles: calculateSuccessfulValue(
        dribbles,
        dribbleSuccessRate
      ),

      duels,
      duelSuccessRate,
      successfulDuels: calculateSuccessfulValue(duels, duelSuccessRate),

      offsides: Number(body.offsides),
      fouls: Number(body.fouls),

      possessionWon: Number(body.possessionWon),
      possessionLost: Number(body.possessionLost),

      minutesPlayed: Number(body.minutesPlayed),
      distanceKm: Number(body.distanceKm),
      sprintDistanceKm: Number(body.sprintDistanceKm),
    },
  });

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

  return NextResponse.json(stat);
}
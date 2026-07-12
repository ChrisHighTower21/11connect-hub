import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const seasons = await prisma.season.findMany({
    include: {
      competition: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(seasons);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.isActive) {
    await prisma.season.updateMany({
      data: {
        isActive: false,
      },
    });
  }

  const season = await prisma.season.create({
    data: {
      competitionId: body.competitionId,
      eafcCycle: body.eafcCycle,
      name: body.name,
      isActive: body.isActive ?? false,
    },
  });

  return NextResponse.json(season);
}
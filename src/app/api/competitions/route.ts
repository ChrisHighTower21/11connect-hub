import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const competitions = await prisma.competition.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(competitions);
}

export async function POST(request: Request) {
  const body = await request.json();

  const competition = await prisma.competition.create({
    data: {
      name: body.name,
      type: body.type,
    },
  });

  return NextResponse.json(competition);
}
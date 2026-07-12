import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const player = await prisma.player.update({
    where: {
      id: params.id,
    },
    data: {
      name: body.name,
      eaId: body.eaId || null,
      mainPosition: body.mainPosition || null,
      secondaryPosition: body.secondaryPosition || null,
      discordName: body.discordName || null,
      joinedAt: body.joinedAt ? new Date(body.joinedAt) : null,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(player);
}
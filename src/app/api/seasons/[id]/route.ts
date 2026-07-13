import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Keine Saison-ID übergeben.",
        },
        {
          status: 400,
        }
      );
    }

    const season = await prisma.season.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            matches: true,
          },
        },
      },
    });

    if (!season) {
      return NextResponse.json({
        success: true,
        message: "Die Saison war bereits gelöscht.",
      });
    }

    if (season._count.matches > 0) {
      return NextResponse.json(
        {
          error:
            "Diese Saison enthält bereits Spiele und kann deshalb nicht gelöscht werden.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.season.delete({
      where: {
        id,
      },
    });

    revalidatePath("/seasons");
    revalidatePath("/");
    revalidatePath("/matches");

    return NextResponse.json({
      success: true,
      message: `${season.name} wurde gelöscht.`,
    });
  } catch (error) {
    console.error("DELETE /api/seasons/[id] failed:", error);

    return NextResponse.json(
      {
        error: "Die Saison konnte nicht gelöscht werden.",
      },
      {
        status: 500,
      }
    );
  }
}
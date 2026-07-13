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
          error: "Keine Wettbewerbs-ID übergeben.",
        },
        {
          status: 400,
        }
      );
    }

    const competition = await prisma.competition.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            seasons: true,
          },
        },
      },
    });

    if (!competition) {
      return NextResponse.json({
        success: true,
        message: "Der Wettbewerb war bereits gelöscht.",
      });
    }

    if (competition._count.seasons > 0) {
      return NextResponse.json(
        {
          error:
            "Dieser Wettbewerb enthält noch Saisons. Lösche zuerst die zugehörigen Saisons.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.competition.delete({
      where: {
        id,
      },
    });

    revalidatePath("/seasons");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `${competition.name} wurde gelöscht.`,
    });
  } catch (error) {
    console.error("DELETE /api/competitions/[id] failed:", error);

    return NextResponse.json(
      {
        error: "Der Wettbewerb konnte nicht gelöscht werden.",
      },
      {
        status: 500,
      }
    );
  }
}
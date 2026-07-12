import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const screenshot = await prisma.matchScreenshot.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!screenshot) {
    return NextResponse.json(
      { error: "Screenshot nicht gefunden." },
      { status: 404 }
    );
  }

  const analysis = await prisma.screenshotAnalysis.create({
    data: {
      screenshotId: screenshot.id,
      status: "DONE",
      rawText:
        "OCR ist vorbereitet. Die echte Texterkennung wird später über eine stabilere OCR-Lösung eingebunden.",
    },
  });

  return NextResponse.json(analysis);
}
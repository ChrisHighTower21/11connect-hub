import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
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

  try {
    const fullPath = path.join(
      process.cwd(),
      "public",
      screenshot.filePath
    );

    await unlink(fullPath);
  } catch {
    // Datei existiert evtl. nicht mehr
  }

  await prisma.screenshotAnalysis.deleteMany({
    where: {
      screenshotId: screenshot.id,
    },
  });

  await prisma.matchScreenshot.delete({
    where: {
      id: screenshot.id,
    },
  });

  return NextResponse.json({ success: true });
}
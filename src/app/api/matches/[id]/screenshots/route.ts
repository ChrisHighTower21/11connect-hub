import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteParams) {
  const formData = await request.formData();

  const file = formData.get("file") as File | null;
const category =
  (formData.get("category") as string | null) ?? "OVERVIEW";

  if (!file) {
    return NextResponse.json(
      { error: "Keine Datei hochgeladen." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}_${safeFileName}`;

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "matches"
  );

  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  const publicPath = `/uploads/matches/${fileName}`;

  const screenshot = await prisma.matchScreenshot.create({
  data: {
    matchId: params.id,
    fileName: file.name,
    filePath: publicPath,
    fileType: file.type || null,
    fileSize: file.size,
    category,
  },
});

  return NextResponse.json(screenshot);
}
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type RouteParams = {
  params: {
    id: string;
  };
};

const ALLOWED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

export async function POST(
  request: Request,
  { params }: RouteParams
) {
  try {
    const match = await prisma.match.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Spiel nicht gefunden." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const categoryEntry = formData.get("category");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: "Keine gültige Datei hochgeladen." },
        { status: 400 }
      );
    }

    const file = fileEntry;

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Erlaubt sind PNG, JPG und WebP." },
        { status: 415 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "Die Datei ist leer." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Die Datei darf maximal 10 MB groß sein." },
        { status: 413 }
      );
    }

    const category =
      typeof categoryEntry === "string"
        ? categoryEntry
        : "OVERVIEW";

    const safeFileName = sanitizeFileName(file.name);
    const blobPath =
      `matches/${params.id}/screenshots/` +
      `${crypto.randomUUID()}-${safeFileName}`;

    const blob = await put(blobPath, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: file.type,
    });

    const screenshot = await prisma.matchScreenshot.create({
      data: {
        matchId: params.id,
        fileName: file.name,
        filePath: blob.url,
        fileType: file.type,
        fileSize: file.size,
        category,
        status: "UPLOADED",
      },
    });

    return NextResponse.json(
      { screenshot },
      { status: 201 }
    );
  } catch (error) {
    console.error("Screenshot-Upload fehlgeschlagen:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unbekannter Uploadfehler.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
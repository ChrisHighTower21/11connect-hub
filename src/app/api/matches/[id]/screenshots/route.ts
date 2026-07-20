import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: {
    id: string;
  };
};

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: RouteContext
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
        { error: "Spiel wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const fileValue = formData.get("file");
    const categoryValue = formData.get("category");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        { error: "Es wurde keine gültige Datei übermittelt." },
        { status: 400 }
      );
    }

    const category =
      typeof categoryValue === "string" && categoryValue.trim()
        ? categoryValue.trim()
        : "OVERVIEW";

    if (!ALLOWED_TYPES.has(fileValue.type)) {
      return NextResponse.json(
        {
          error: "Erlaubt sind ausschließlich PNG-, JPG- und WebP-Dateien.",
        },
        { status: 400 }
      );
    }

    if (fileValue.size <= 0) {
      return NextResponse.json(
        { error: "Die Datei ist leer." },
        { status: 400 }
      );
    }

    if (fileValue.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Die Datei darf maximal 10 MB groß sein." },
        { status: 400 }
      );
    }

    const safeFileName = sanitizeFileName(fileValue.name);

    const pathname = [
      "match-screenshots",
      params.id,
      `${crypto.randomUUID()}-${safeFileName}`,
    ].join("/");

    const blob = await put(pathname, fileValue, {
      access: "private",
      contentType: fileValue.type,
      addRandomSuffix: false,
    });

    try {
      const screenshot = await prisma.matchScreenshot.create({
        data: {
          matchId: params.id,
          fileName: fileValue.name,
          filePath: blob.url,
          fileType: fileValue.type,
          fileSize: fileValue.size,
          category,
          status: "UPLOADED",
        },
      });

      return NextResponse.json(
        {
          screenshot: {
            id: screenshot.id,
            fileName: screenshot.fileName,
            category: screenshot.category,
            createdAt: screenshot.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (databaseError) {
      console.error(
        "Blob wurde gespeichert, aber der Datenbankeintrag ist fehlgeschlagen:",
        databaseError
      );

      return NextResponse.json(
        {
          error:
            "Die Datei wurde hochgeladen, konnte aber nicht in der Datenbank gespeichert werden.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Screenshot-Upload fehlgeschlagen:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Screenshot konnte nicht hochgeladen werden.",
      },
      { status: 500 }
    );
  }
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  const sanitized = normalized
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "screenshot";
}
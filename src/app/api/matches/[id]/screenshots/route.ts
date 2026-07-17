import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

const ALLOWED_CATEGORIES = new Set([
  "OVERVIEW",
  "POSSESSION",
  "SHOOTING",
  "PASSING",
  "DEFENDING",
  "GOALKEEPER",
  "OTHER",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

export async function POST(request: Request, { params }: RouteParams) {
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
        {
          error: "Das ausgewählte Spiel wurde nicht gefunden.",
        },
        {
          status: 404,
        }
      );
    }

    const formData = await request.formData();

    const fileEntry = formData.get("file");
    const categoryEntry = formData.get("category");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        {
          error: "Keine gültige Datei hochgeladen.",
        },
        {
          status: 400,
        }
      );
    }

    const file = fileEntry;

    const requestedCategory =
      typeof categoryEntry === "string"
        ? categoryEntry.toUpperCase()
        : "OVERVIEW";

    const category = ALLOWED_CATEGORIES.has(requestedCategory)
      ? requestedCategory
      : "OVERVIEW";

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "Erlaubt sind ausschließlich PNG-, JPG- und WebP-Bilder.",
        },
        {
          status: 415,
        }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          error: "Die hochgeladene Datei ist leer.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Der Screenshot darf höchstens 10 MB groß sein.",
        },
        {
          status: 413,
        }
      );
    }

    const safeFileName = sanitizeFileName(file.name);
    const uniqueFileName = `${crypto.randomUUID()}-${safeFileName}`;

    const blobPath = [
      "matches",
      params.id,
      "screenshots",
      uniqueFileName,
    ].join("/");

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    try {
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
        {
          screenshot,
        },
        {
          status: 201,
        }
      );
    } catch (databaseError) {
      console.error(
        "Screenshot wurde gespeichert, aber der Datenbankeintrag ist fehlgeschlagen:",
        databaseError
      );

      return NextResponse.json(
        {
          error:
            "Das Bild wurde hochgeladen, konnte aber nicht in der Datenbank gespeichert werden.",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Screenshot-Upload fehlgeschlagen:", error);

    return NextResponse.json(
      {
        error: "Der Screenshot konnte nicht hochgeladen werden.",
      },
      {
        status: 500,
      }
    );
  }
}
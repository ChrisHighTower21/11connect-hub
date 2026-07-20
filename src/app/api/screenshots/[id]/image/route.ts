import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    // TODO: Hier dieselbe Benutzer-/Team-Autorisierung wie auf der Match-Seite prüfen.
    const screenshot = await prisma.matchScreenshot.findUnique({
      where: { id: params.id },
      select: { filePath: true },
    });

    if (!screenshot) {
      return NextResponse.json(
        { error: "Screenshot wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const result = await get(screenshot.filePath, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Blob wurde nicht gefunden." },
        { status: 404 }
      );
    }

    if (result.statusCode === 304) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "X-Content-Type-Options": "nosniff",
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Screenshot konnte nicht ausgeliefert werden:", error);

    return NextResponse.json(
      { error: "Screenshot konnte nicht geladen werden." },
      { status: 500 }
    );
  }
}

import { FormationEditor } from "@/components/tactics/FormationEditor";
import { prisma } from "@/lib/prisma";
import type { TacticPlayer } from "@/components/tactics/types";

export const dynamic = "force-dynamic";

export default async function TacticsPage() {
  const rawPlayers =
    await prisma.player.findMany();

  const players: TacticPlayer[] = rawPlayers
  .map((player, index) => {
    const record =
      player as unknown as Record<string, unknown>;

    const eaId = readString(record, [
      "eaId",
      "eaID",
      "ea_id",
      "gamertag",
      "gameTag",
    ]);

    const directName = readString(record, [
      "name",
      "displayName",
      "fullName",
      "playerName",
    ]);

    const firstName = readString(record, [
      "firstName",
      "firstname",
      "givenName",
    ]);

    const lastName = readString(record, [
      "lastName",
      "lastname",
      "surname",
      "familyName",
    ]);

    const composedName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      id: String(
        record.id ?? `player-${index}`
      ),

      eaId:
        eaId ??
        `EA-ID fehlt ${index + 1}`,

      name:
        directName ??
        composedName ??
        null,

      position: readString(record, [
        "mainPosition",
        "primaryPosition",
        "position",
        "preferredPosition",
        "role",
      ]),

      shirtNumber: readNumber(record, [
        "shirtNumber",
        "jerseyNumber",
        "number",
      ]),
    };
  })
  .sort((first, second) =>
    first.eaId.localeCompare(
      second.eaId,
      "de",
      {
        numeric: true,
        sensitivity: "base",
      }
    )
  );

  return (
    <main
      style={{
        display: "grid",
        gap: 24,
      }}
    >
      <header>
        <div className="kpi-label">
          Taktikzentrum
        </div>

        <h1 style={{ marginTop: 8 }}>
          Aufstellung
        </h1>

        <p
          className="muted"
          style={{
            marginTop: 8,
            maxWidth: 720,
          }}
        >
          Ziehe deine Spieler auf die gewünschten
          Positionen und stelle deine Formation
          zusammen.
        </p>
      </header>

      <FormationEditor players={players} />
    </main>
  );
}

function readString(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return null;
}

function readNumber(
  record: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}
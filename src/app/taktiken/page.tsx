import { FormationEditor } from "@/components/tactics/FormationEditor";
import type { TacticPlayer } from "@/components/tactics/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TacticsPage() {
  const rawPlayers = await prisma.player.findMany({
    orderBy: {
      eaId: "asc",
    },
  });

  const players: TacticPlayer[] = rawPlayers.map((player) => ({
    id: player.id,
    eaId: player.eaId,
    position: player.mainPosition,
    shirtNumber: player.shirtNumber,
  }));

  return (
    <main
      style={{
        display: "grid",
        gap: 24,
      }}
    >
      <header>
        <div className="kpi-label">Taktikzentrum</div>

        <h1 style={{ marginTop: 8 }}>Aufstellung</h1>

        <p
          className="muted"
          style={{
            marginTop: 8,
            maxWidth: 720,
          }}
        >
          Ziehe deine Spieler auf die gewünschten Positionen und stelle deine
          Formation zusammen.
        </p>
      </header>

      <FormationEditor players={players} />
    </main>
  );
}

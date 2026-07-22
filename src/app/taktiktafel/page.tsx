import { TacticalBoard } from "@/components/tactical-board/TacticalBoard";
import type { TacticPlayer } from "@/components/tactics/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TacticalBoardPage() {
  const rawPlayers = await prisma.player.findMany({
    orderBy: {
      eaId: "asc",
    },
  });

  const players: TacticPlayer[] = rawPlayers.map((player) => ({
    id: player.id,
    eaId: player.eaId,
    position: player.mainPosition,
    secondaryPosition: player.secondaryPosition,
    shirtNumber: player.shirtNumber,
  }));

  return (
    <main className="tactical-board-page">
      <header className="tactical-board-header">
        <div>
          <div className="kpi-label">Trainerwerkzeug</div>
          <h1>Taktiktafel</h1>
          <p className="muted">
            Spielzüge planen, Laufwege einzeichnen und Varianten für Besprechungen speichern.
          </p>
        </div>
        <div className="tactical-board-header-badge">Live-Taktik</div>
      </header>

      <TacticalBoard players={players} />
    </main>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { PlayerActions } from "./PlayerActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    include: {
      stats: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Spieler</h1>
          <p className="page-description">Spielerstamm verwalten.</p>
        </div>

        <Link className="button button-primary" href="/players/new">
          + Spieler anlegen
        </Link>
      </header>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>EA-ID</th>
              <th>Hauptposition</th>
              <th>Nebenposition</th>
              <th>Discord</th>
              <th>Status</th>
              <th>Spiele</th>
              <th>Tore</th>
              <th>Vorlagen</th>
              <th>Ø Bewertung</th>
              <th>Aktionen</th>
            </tr>
          </thead>

          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={11}>Noch keine Spieler angelegt.</td>
              </tr>
            ) : (
              players.map((player) => {
                const games = player.stats.length;

                const goals = player.stats.reduce(
                  (sum, stat) => sum + stat.goals,
                  0
                );

                const assists = player.stats.reduce(
                  (sum, stat) => sum + stat.assists,
                  0
                );

                const ratingSum = player.stats.reduce(
                  (sum, stat) => sum + stat.rating,
                  0
                );

                const averageRating =
                  games > 0 ? (ratingSum / games).toFixed(2) : "-";

                return (
                  <tr key={player.id}>
                    <td>
                      <Link href={`/players/${player.id}`}>
                        {player.name}
                      </Link>
                    </td>

                    <td>{player.eaId || "-"}</td>
                    <td>{player.mainPosition || "-"}</td>
                    <td>{player.secondaryPosition || "-"}</td>
                    <td>{player.discordName || "-"}</td>

                    <td>
                      <span
                        className={
                          player.isActive
                            ? "badge badge-success"
                            : "badge badge-muted"
                        }
                      >
                        {player.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>

                    <td>{games}</td>
                    <td>{goals}</td>
                    <td>{assists}</td>
                    <td>{averageRating}</td>

                    <td>
                      <PlayerActions
                        playerId={player.id}
                        playerName={player.name}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
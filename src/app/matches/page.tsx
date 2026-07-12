import Link from "next/link";
import { prisma } from "@/lib/db";

function getResultLabel(result: string) {
  if (result === "WIN") return "Sieg";
  if (result === "DRAW") return "Remis";
  if (result === "LOSS") return "Niederlage";
  return result;
}

function getResultClass(result: string) {
  if (result === "WIN") return "badge badge-win";
  if (result === "DRAW") return "badge badge-draw";
  if (result === "LOSS") return "badge badge-loss";
  return "badge badge-muted";
}

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    include: {
      season: {
        include: {
          competition: true,
        },
      },
    },
    orderBy: {
      matchDate: "desc",
    },
  });

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Spiele</h1>
          <p className="page-description">
            Spiele anlegen, bearbeiten und abschließen.
          </p>
        </div>
        <Link className="button button-primary" href="/matches/new">
          + Neues Spiel
        </Link>
      </header>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Gegner</th>
              <th>Ergebnis</th>
              <th>Resultat</th>
              <th>Wettbewerb</th>
              <th>Saison</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={7}>Noch keine Spiele angelegt.</td>
              </tr>
            ) : (
              matches.map((match) => (
                <tr key={match.id}>
                  <td>{match.matchDate.toLocaleDateString("de-DE")}</td>
                  <td>
  <Link href={`/matches/${match.id}`}>
    {match.opponent}
  </Link>
</td>
                  <td>
                    {match.teamGoals}:{match.opponentGoals}
                  </td>
                  <td>
                    <span className={getResultClass(match.result)}>
                      {getResultLabel(match.result)}
                    </span>
                  </td>
                  <td>{match.season.competition.name}</td>
                  <td>{match.season.name}</td>
                  <td>{match.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
import { prisma } from "@/lib/db";
import { TeamSeasonFilter } from "./TeamSeasonFilter";

function getResultLabel(result: string) {
  if (result === "WIN") return "Sieg";
  if (result === "DRAW") return "Remis";
  if (result === "LOSS") return "Niederlage";
  return result;
}

export default async function TeamStatsPage({
  searchParams,
}: {
  searchParams: {
    seasonId?: string;
  };
}) {
  const seasons = await prisma.season.findMany({
    include: { competition: true },
    orderBy: { createdAt: "desc" },
  });

  const activeSeason = searchParams.seasonId
    ? await prisma.season.findUnique({
        where: { id: searchParams.seasonId },
        include: { competition: true },
      })
    : await prisma.season.findFirst({
        where: { isActive: true },
        include: { competition: true },
      });

  const matches = await prisma.match.findMany({
    where: activeSeason ? { seasonId: activeSeason.id } : undefined,
    orderBy: { matchDate: "asc" },
  });

  const totalMatches = matches.length;
  const wins = matches.filter((m) => m.result === "WIN").length;
  const draws = matches.filter((m) => m.result === "DRAW").length;
  const losses = matches.filter((m) => m.result === "LOSS").length;

  const goalsFor = matches.reduce((sum, m) => sum + m.teamGoals, 0);
  const goalsAgainst = matches.reduce((sum, m) => sum + m.opponentGoals, 0);
  const points = wins * 3 + draws;
  const goalDifference = goalsFor - goalsAgainst;

  const pointsPerGame =
    totalMatches > 0 ? (points / totalMatches).toFixed(2) : "0.00";

  const winRate =
    totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const homeMatches = matches.filter((m) => m.homeAway === "HOME");
  const awayMatches = matches.filter((m) => m.homeAway === "AWAY");

  const homeWins = homeMatches.filter((m) => m.result === "WIN").length;
  const homeDraws = homeMatches.filter((m) => m.result === "DRAW").length;
  const homeLosses = homeMatches.filter((m) => m.result === "LOSS").length;

  const awayWins = awayMatches.filter((m) => m.result === "WIN").length;
  const awayDraws = awayMatches.filter((m) => m.result === "DRAW").length;
  const awayLosses = awayMatches.filter((m) => m.result === "LOSS").length;

  const homeGoals = homeMatches.reduce((sum, m) => sum + m.teamGoals, 0);
  const homeAgainst = homeMatches.reduce((sum, m) => sum + m.opponentGoals, 0);

  const awayGoals = awayMatches.reduce((sum, m) => sum + m.teamGoals, 0);
  const awayAgainst = awayMatches.reduce((sum, m) => sum + m.opponentGoals, 0);

  const form = matches.slice(-5).map((m) => {
    if (m.result === "WIN") return "W";
    if (m.result === "DRAW") return "D";
    return "L";
  });
const biggestWin = [...matches]
  .filter((m) => m.result === "WIN")
  .sort(
    (a, b) =>
      b.teamGoals -
      b.opponentGoals -
      (a.teamGoals - a.opponentGoals)
  )[0];

const biggestLoss = [...matches]
  .filter((m) => m.result === "LOSS")
  .sort(
    (a, b) =>
      b.opponentGoals -
      b.teamGoals -
      (a.opponentGoals - a.teamGoals)
  )[0];

const cleanSheets = matches.filter((m) => m.opponentGoals === 0).length;

const mostGoalsMatch = [...matches].sort(
  (a, b) => b.teamGoals - a.teamGoals
)[0];
  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Teamstatistik</h1>
          <p className="page-description">
            {activeSeason
              ? `${activeSeason.eafcCycle} • ${activeSeason.competition.name} • ${activeSeason.name}`
              : "Keine Saison ausgewählt."}
          </p>
        </div>

        {seasons.length > 0 && activeSeason ? (
          <TeamSeasonFilter
  seasons={seasons}
  currentSeasonId={activeSeason.id}
/>
        ) : null}
      </header>

      <section className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Spiele</div>
          <div className="kpi-value">{totalMatches}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Siege</div>
          <div className="kpi-value">{wins}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Remis</div>
          <div className="kpi-value">{draws}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Niederlagen</div>
          <div className="kpi-value">{losses}</div>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Punkte</div>
          <div className="kpi-value">{points}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Punkte/Spiel</div>
          <div className="kpi-value">{pointsPerGame}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Siegquote</div>
          <div className="kpi-value">{winRate}%</div>
        </div>
        <div className="card">
          <div className="kpi-label">Form</div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, fontSize: 28, fontWeight: 800 }}>
            {form.length === 0 ? "-" : form.map((r, i) => <span key={i}>{r}</span>)}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Tore</div>
          <div className="kpi-value">{goalsFor}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Gegentore</div>
          <div className="kpi-value">{goalsAgainst}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Tordifferenz</div>
          <div className="kpi-value">
            {goalDifference > 0 ? "+" : ""}
            {goalDifference}
          </div>
        </div>
        <div className="card">
          <div className="kpi-label">Torverhältnis</div>
          <div className="kpi-value" style={{ fontSize: 28 }}>
            {goalsFor}:{goalsAgainst}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid grid-2">
        <div className="card">
          <h2>Heimbilanz</h2>
          <p className="page-description">
            {homeWins}S • {homeDraws}U • {homeLosses}N
          </p>
          <div style={{ marginTop: 16, fontWeight: 700 }}>
            Tore: {homeGoals}:{homeAgainst}
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            {homeMatches.length} Heimspiele
          </div>
        </div>

        <div className="card">
          <h2>Auswärtsbilanz</h2>
          <p className="page-description">
            {awayWins}S • {awayDraws}U • {awayLosses}N
          </p>
          <div style={{ marginTop: 16, fontWeight: 700 }}>
            Tore: {awayGoals}:{awayAgainst}
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            {awayMatches.length} Auswärtsspiele
          </div>
        </div>
      </section>
<section style={{ marginTop: 24 }} className="grid grid-4">
  <div className="card">
    <div className="kpi-label">Höchster Sieg</div>
    <div className="kpi-value" style={{ fontSize: 24 }}>
      {biggestWin
        ? `${biggestWin.teamGoals}:${biggestWin.opponentGoals}`
        : "-"}
    </div>
    <div className="muted">
      {biggestWin ? `vs ${biggestWin.opponent}` : "Noch kein Sieg"}
    </div>
  </div>

  <div className="card">
    <div className="kpi-label">Höchste Niederlage</div>
    <div className="kpi-value" style={{ fontSize: 24 }}>
      {biggestLoss
        ? `${biggestLoss.teamGoals}:${biggestLoss.opponentGoals}`
        : "-"}
    </div>
    <div className="muted">
      {biggestLoss ? `vs ${biggestLoss.opponent}` : "Noch keine Niederlage"}
    </div>
  </div>

  <div className="card">
    <div className="kpi-label">Zu Null</div>
    <div className="kpi-value">{cleanSheets}</div>
  </div>

  <div className="card">
    <div className="kpi-label">Meiste Tore</div>
    <div className="kpi-value" style={{ fontSize: 24 }}>
      {mostGoalsMatch ? mostGoalsMatch.teamGoals : "-"}
    </div>
    <div className="muted">
      {mostGoalsMatch ? `vs ${mostGoalsMatch.opponent}` : "Noch kein Spiel"}
    </div>
  </div>
</section>
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Spiele</h2>
        </div>

        {matches.length === 0 ? (
          <p className="page-description">Noch keine Spiele vorhanden.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Gegner</th>
                <th>Heim/Auswärts</th>
                <th>Ergebnis</th>
                <th>Resultat</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td>{match.matchDate.toLocaleDateString("de-DE")}</td>
                  <td>{match.opponent}</td>
                  <td>{match.homeAway === "HOME" ? "Heim" : "Auswärts"}</td>
                  <td>{match.teamGoals}:{match.opponentGoals}</td>
                  <td>{getResultLabel(match.result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
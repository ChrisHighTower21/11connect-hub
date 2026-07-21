import { DashboardSeasonFilter } from "../DashboardSeasonFilter";
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    seasonId?: string;
  };
}) {
  const seasons = await prisma.season.findMany({
    include: {
      competition: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPlayers = await prisma.player.count();

  const activeSeason = searchParams.seasonId
    ? await prisma.season.findUnique({
        where: {
          id: searchParams.seasonId,
        },
        include: {
          competition: true,
        },
      })
    : await prisma.season.findFirst({
        where: {
          isActive: true,
        },
        include: {
          competition: true,
        },
      });

  const matches = await prisma.match.findMany({
    where: activeSeason
      ? {
          seasonId: activeSeason.id,
        }
      : undefined,
  });

  const latestMatches = await prisma.match.findMany({
    where: activeSeason
      ? {
          seasonId: activeSeason.id,
        }
      : undefined,
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
    take: 5,
  });

  const totalMatches = matches.length;
  const wins = matches.filter((match) => match.result === "WIN").length;
  const draws = matches.filter((match) => match.result === "DRAW").length;
  const losses = matches.filter((match) => match.result === "LOSS").length;

  const goalsFor = matches.reduce((sum, match) => sum + match.teamGoals, 0);
  const goalsAgainst = matches.reduce(
    (sum, match) => sum + match.opponentGoals,
    0
  );

  const goalDifference = goalsFor - goalsAgainst;
  const points = wins * 3 + draws;

  const winRate =
    totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const recentForm = latestMatches
    .slice(0, 5)
    .map((match) => {
      if (match.result === "WIN") return "W";
      if (match.result === "DRAW") return "D";
      return "L";
    })
    .reverse();

  const playersWithStats = await prisma.player.findMany({
    include: {
      stats: {
        where: activeSeason
          ? {
              match: {
                seasonId: activeSeason.id,
              },
            }
          : undefined,
      },
    },
  });

  const playerSummaries = playersWithStats.map((player) => {
    const goals = player.stats.reduce((sum, stat) => sum + stat.goals, 0);
    const assists = player.stats.reduce((sum, stat) => sum + stat.assists, 0);
    const games = player.stats.length;
    const ratingSum = player.stats.reduce((sum, stat) => sum + stat.rating, 0);

    return {
      id: player.id,
      eaId: player.eaId,
      goals,
      assists,
      games,
      averageRating: games > 0 ? ratingSum / games : 0,
    };
  });

  const topScorer = [...playerSummaries].sort((a, b) => b.goals - a.goals)[0];

  const topAssist = [...playerSummaries].sort(
    (a, b) => b.assists - a.assists
  )[0];

  const topRating = [...playerSummaries]
    .filter((player) => player.games > 0)
    .sort((a, b) => b.averageRating - a.averageRating)[0];

  const allStats = playersWithStats.flatMap((player) => player.stats);

  const averageTeamRating =
    allStats.length > 0
      ? (
          allStats.reduce((sum, stat) => sum + stat.rating, 0) /
          allStats.length
        ).toFixed(2)
      : "-";

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Übersicht über den aktuellen Vereinsstand.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {seasons.length > 0 && activeSeason ? (
            <DashboardSeasonFilter
              seasons={seasons}
              currentSeasonId={activeSeason.id}
            />
          ) : null}

          <Link className="button button-primary" href="/players/new">
            + Spieler anlegen
          </Link>
        </div>
      </header>

      <div
        className="card"
        style={{
          marginBottom: 24,
          padding: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div>
            <div className="kpi-label">Aktuelle Saison</div>

            <h2 style={{ margin: "8px 0", fontSize: 34 }}>
              {activeSeason?.competition.name ?? "Keine Saison"}
            </h2>

            <div className="page-description">
              {activeSeason
                ? `${activeSeason.eafcCycle} • ${activeSeason.name}`
                : "Keine Saison ausgewählt"}
            </div>

            <div
              style={{
                marginTop: 18,
                height: 10,
                width: 360,
                maxWidth: "100%",
                background: "#162235",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${winRate}%`,
                  background: "#38bdf8",
                  height: "100%",
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="kpi-label">Siegquote</div>

            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#38bdf8",
              }}
            >
              {winRate}%
            </div>

            <div className="page-description">Form</div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
                fontWeight: 800,
              }}
            >
              {recentForm.length === 0
                ? "-"
                : recentForm.map((result, index) => (
                    <span key={index}>{result}</span>
                  ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: 24,
          }}
        >
          <div>
            <div className="kpi-label">Spiele</div>
            <div className="kpi-value">{totalMatches}</div>
          </div>

          <div>
            <div className="kpi-label">Punkte</div>
            <div className="kpi-value">{points}</div>
          </div>

          <div>
            <div className="kpi-label">Siege</div>
            <div className="kpi-value">{wins}</div>
          </div>

          <div>
            <div className="kpi-label">Remis</div>
            <div className="kpi-value">{draws}</div>
          </div>

          <div>
            <div className="kpi-label">Niederlagen</div>
            <div className="kpi-value">{losses}</div>
          </div>

          <div>
            <div className="kpi-label">Tordifferenz</div>
            <div className="kpi-value">
              {goalDifference > 0 ? "+" : ""}
              {goalDifference}
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Tore</div>
          <div className="kpi-value">{goalsFor}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Gegentore</div>
          <div className="kpi-value">{goalsAgainst}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Ø Teambewertung</div>
          <div className="kpi-value">{averageTeamRating}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Spieler gesamt</div>
          <div className="kpi-value">{totalPlayers}</div>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid grid-4">
        <div className="card">
          <div className="section-title">
            <h2>Letzte Spiele</h2>
          </div>

          {latestMatches.length === 0 ? (
            <p className="page-description">Noch keine Spiele erfasst.</p>
          ) : (
            <div className="squad-list-compact">
              {latestMatches.map((match) => (
                <Link
  className="squad-row"
  key={match.id}
  href={`/matches/${match.id}`}
  style={{ textDecoration: "none", color: "inherit" }}
>
                  <div>
                    <strong>vs {match.opponent}</strong>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {match.matchDate.toLocaleDateString("de-DE")} •{" "}
                      {match.season.competition.name}
                    </div>
                  </div>

                  <div className="match-summary">
                    <span className="score-pill" style={{ fontSize: 16 }}>
                      {match.teamGoals}:{match.opponentGoals}
                    </span>

                    <span className={getResultClass(match.result)}>
                      {getResultLabel(match.result)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Top Bewertung</h2>

          <p className="page-description">
            {topRating
              ? `${topRating.eaId} • ${topRating.averageRating.toFixed(2)}`
              : "Noch keine Bewertungen erfasst."}
          </p>
        </div>

        <div className="card">
          <h2>Top Scorer</h2>

          <p className="page-description">
            {topScorer && topScorer.goals > 0
              ? `${topScorer.eaId} • ${topScorer.goals} Tore`
              : "Noch keine Tore erfasst."}
          </p>
        </div>

        <div className="card">
          <h2>Top Vorlagengeber</h2>

          <p className="page-description">
            {topAssist && topAssist.assists > 0
              ? `${topAssist.eaId} • ${topAssist.assists} Vorlagen`
              : "Noch keine Vorlagen erfasst."}
          </p>
        </div>
      </section>
    </>
  );
}

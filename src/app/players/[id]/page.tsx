import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PlayerSeasonFilter } from "./PlayerSeasonFilter";
import { PlayerRatingChart } from "@/components/charts/PlayerRatingChart";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: {
    id: string;
  };
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

  const player = await prisma.player.findUnique({
    where: {
      id: params.id,
    },
    include: {
      stats: {
        include: {
          match: {
            include: {
              season: {
                include: {
                  competition: true,
                },
              },
            },
          },
        },
        orderBy: {
          match: {
            matchDate: "desc",
          },
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  const filteredStats = activeSeason
    ? player.stats.filter((stat) => stat.match.seasonId === activeSeason.id)
    : player.stats;

  const careerGames = player.stats.length;
  const careerGoals = player.stats.reduce((sum, stat) => sum + stat.goals, 0);
  const careerAssists = player.stats.reduce(
    (sum, stat) => sum + stat.assists,
    0
  );
  const careerScorer = careerGoals + careerAssists;
  const careerRatingSum = player.stats.reduce(
    (sum, stat) => sum + stat.rating,
    0
  );
  const careerAverageRating =
    careerGames > 0 ? (careerRatingSum / careerGames).toFixed(2) : "-";

  const games = filteredStats.length;
  const goals = filteredStats.reduce((sum, stat) => sum + stat.goals, 0);
  const assists = filteredStats.reduce((sum, stat) => sum + stat.assists, 0);
  const scorer = goals + assists;

  const ratingSum = filteredStats.reduce((sum, stat) => sum + stat.rating, 0);
  const averageRating = games > 0 ? (ratingSum / games).toFixed(2) : "-";

  const bestRating =
    filteredStats.length > 0
      ? Math.max(...filteredStats.map((stat) => stat.rating)).toFixed(1)
      : "-";

  const potm = filteredStats.filter((stat) => stat.isPotm).length;

  const totalPasses = filteredStats.reduce((sum, stat) => sum + stat.passes, 0);
  const successfulPasses = filteredStats.reduce(
    (sum, stat) => sum + stat.successfulPasses,
    0
  );

  const passAccuracy =
    totalPasses > 0
      ? ((successfulPasses / totalPasses) * 100).toFixed(1)
      : "-";

  const totalDistance = filteredStats.reduce(
    (sum, stat) => sum + stat.distanceKm,
    0
  );

  const totalSprintDistance = filteredStats.reduce(
    (sum, stat) => sum + stat.sprintDistanceKm,
    0
  );

  const averageDistance =
    games > 0 ? (totalDistance / games).toFixed(2) : "-";

  const averageSprintDistance =
    games > 0 ? (totalSprintDistance / games).toFixed(2) : "-";

  const positionCounts = filteredStats.reduce<Record<string, number>>(
    (acc, stat) => {
      const position = stat.position || player.mainPosition || "Unbekannt";
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    },
    {}
  );

  const mainUsedPosition =
    Object.entries(positionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  const mostGoalsInMatch =
    filteredStats.length > 0
      ? Math.max(...filteredStats.map((stat) => stat.goals))
      : 0;

  const mostAssistsInMatch =
    filteredStats.length > 0
      ? Math.max(...filteredStats.map((stat) => stat.assists))
      : 0;

  const highestDistance =
    filteredStats.length > 0
      ? Math.max(...filteredStats.map((stat) => stat.distanceKm))
      : 0;

  const highestSprintDistance =
    filteredStats.length > 0
      ? Math.max(...filteredStats.map((stat) => stat.sprintDistanceKm))
      : 0;
const opponentStats = Object.values(
  player.stats.reduce((acc, stat) => {
    const opponent = stat.match.opponent;

    if (!acc[opponent]) {
      acc[opponent] = {
        opponent,
        games: 0,
        goals: 0,
        assists: 0,
        ratingSum: 0,
        potm: 0,
      };
    }

    acc[opponent].games++;
    acc[opponent].goals += stat.goals;
    acc[opponent].assists += stat.assists;
    acc[opponent].ratingSum += stat.rating;

    if (stat.isPotm) {
      acc[opponent].potm++;
    }

    return acc;
  }, {} as Record<string, {
    opponent: string;
    games: number;
    goals: number;
    assists: number;
    ratingSum: number;
    potm: number;
  }>)
).map((item) => ({
  ...item,
  averageRating: item.ratingSum / item.games,
  scorer: item.goals + item.assists,
}));
  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">{player.eaId}</h1>
          <p className="page-description">
            {player.mainPosition ?? "Keine Position"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {seasons.length > 0 && activeSeason ? (
            <PlayerSeasonFilter
              playerId={player.id}
              seasons={seasons}
              currentSeasonId={activeSeason.id}
            />
          ) : null}

          <Link className="button" href="/players">
            Zurück
          </Link>
        </div>
      </header>

      <div className="card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "rgba(56,189,248,.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 900,
            }}
          >
            {player.shirtNumber ?? player.eaId.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="kpi-label">Spielerprofil</div>
            <h2 style={{ fontSize: 34, margin: "8px 0" }}>{player.eaId}</h2>
            <p className="page-description">
              {activeSeason
                ? `${activeSeason.eafcCycle} • ${activeSeason.competition.name} • ${activeSeason.name}`
                : "Karriere"}{" "}
              • {player.discordName ?? "Kein Discord"} •{" "}
              {player.isActive ? "Aktiv" : "Inaktiv"}
            </p>
          </div>

          <div>
            <div className="kpi-label">Ø Bewertung</div>
            <div className="kpi-value">{averageRating}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">
          <h2>Karriere</h2>
        </div>

        <div className="grid grid-4">
          <div>
            <div className="kpi-label">Spiele</div>
            <div className="kpi-value">{careerGames}</div>
          </div>

          <div>
            <div className="kpi-label">Tore</div>
            <div className="kpi-value">{careerGoals}</div>
          </div>

          <div>
            <div className="kpi-label">Scorer</div>
            <div className="kpi-value">{careerScorer}</div>
          </div>

          <div>
            <div className="kpi-label">Ø Bewertung</div>
            <div className="kpi-value">{careerAverageRating}</div>
          </div>
        </div>
      </div>
<PerformanceAnalysis>
  <PlayerRatingChart
    matches={filteredStats
      .slice()
      .reverse()
      .map((stat) => ({
        date: stat.match.matchDate.toLocaleDateString("de-DE"),
        rating: stat.rating,
      }))}
  />
</PerformanceAnalysis>
      <section className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Spiele</div>
          <div className="kpi-value">{games}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Tore</div>
          <div className="kpi-value">{goals}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Vorlagen</div>
          <div className="kpi-value">{assists}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Scorer</div>
          <div className="kpi-value">{scorer}</div>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid grid-4">
        <div className="card">
          <div className="kpi-label">POTM</div>
          <div className="kpi-value">{potm}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Beste Bewertung</div>
          <div className="kpi-value">{bestRating}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Passquote</div>
          <div className="kpi-value">
            {passAccuracy === "-" ? "-" : `${passAccuracy}%`}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Meiste Position</div>
          <div className="kpi-value" style={{ fontSize: 24 }}>
            {mainUsedPosition}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Ø Laufweg</div>
          <div className="kpi-value">
            {averageDistance === "-" ? "-" : `${averageDistance} km`}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Ø Sprintdistanz</div>
          <div className="kpi-value">
            {averageSprintDistance === "-"
              ? "-"
              : `${averageSprintDistance} km`}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Gesamtpässe</div>
          <div className="kpi-value">{totalPasses}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Laufdistanz gesamt</div>
          <div className="kpi-value" style={{ fontSize: 26 }}>
            {totalDistance.toFixed(1)} km
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }} className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Meiste Tore</div>
          <div className="kpi-value">{mostGoalsInMatch}</div>
          <div className="page-description">in einem Spiel</div>
        </div>

        <div className="card">
          <div className="kpi-label">Meiste Vorlagen</div>
          <div className="kpi-value">{mostAssistsInMatch}</div>
          <div className="page-description">in einem Spiel</div>
        </div>

        <div className="card">
          <div className="kpi-label">Längster Laufweg</div>
          <div className="kpi-value">{highestDistance.toFixed(2)} km</div>
        </div>

        <div className="card">
          <div className="kpi-label">Sprintrekord</div>
          <div className="kpi-value">{highestSprintDistance.toFixed(2)} km</div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>Letzte Einsätze</h2>

        {filteredStats.length === 0 ? (
          <p className="page-description">
            Noch keine Leistungsdaten für diese Saison vorhanden.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Gegner</th>
                <th>Wettbewerb</th>
                <th>Saison</th>
                <th>Ergebnis</th>
                <th>Bewertung</th>
                <th>Tore</th>
                <th>Vorlagen</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat) => (
                <tr key={stat.id}>
                  <td>{stat.match.matchDate.toLocaleDateString("de-DE")}</td>
                  <td>{stat.match.opponent}</td>
                  <td>{stat.match.season.competition.name}</td>
                  <td>{stat.match.season.name}</td>
                  <td>
                    {stat.match.teamGoals}:{stat.match.opponentGoals}
                  </td>
                  <td>{stat.rating.toFixed(1)}</td>
                  <td>{stat.goals}</td>
                  <td>{stat.assists}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
<div className="card" style={{ marginTop: 24 }}>
  <h2>Gegnerstatistik</h2>

  <table className="table">
    <thead>
      <tr>
        <th>Gegner</th>
        <th>Spiele</th>
        <th>Tore</th>
        <th>Vorlagen</th>
        <th>Scorer</th>
        <th>Ø Bewertung</th>
        <th>POTM</th>
      </tr>
    </thead>

    <tbody>
      {opponentStats.map((opponent) => (
        <tr key={opponent.opponent}>
          <td>{opponent.opponent}</td>
          <td>{opponent.games}</td>
          <td>{opponent.goals}</td>
          <td>{opponent.assists}</td>
          <td>{opponent.scorer}</td>
          <td>{opponent.averageRating.toFixed(2)}</td>
          <td>{opponent.potm}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </>
  );
}

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SquadManager } from "./SquadManager";
import { StatsForm } from "./StatsForm";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { DeleteScreenshotButton } from "./DeleteScreenshotButton";
import { AnalyzeScreenshotButton } from "./AnalyzeScreenshotButton";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { CollapsibleCard } from "@/components/CollapsibleCard";

function getScreenshotCategoryLabel(category: string) {
  if (category === "OVERVIEW") return "Übersicht";
  if (category === "POSSESSION") return "Ballbesitz";
  if (category === "SHOOTING") return "Schussverhalten";
  if (category === "PASSING") return "Pässe";
  if (category === "DEFENDING") return "Abwehr";
  if (category === "GOALKEEPER") return "TW-Spiel";
  if (category === "OTHER") return "Sonstiges";
  return category;
}

function getStatusLabel(status: string) {
  if (status === "DRAFT") return "Entwurf";
  if (status === "IN_PROGRESS") return "In Bearbeitung";
  if (status === "COMPLETED") return "Abgeschlossen";
  return status;
}

type MatchPageProps = {
  params: {
    id: string;
  };
};

export default async function MatchPage({ params }: MatchPageProps) {
  const match = await prisma.match.findUnique({
    where: {
      id: params.id,
    },
    include: {
      season: {
        include: {
          competition: true,
        },
      },
      squad: {
        include: {
          player: true,
        },
      },
      playerStats: {
        include: {
          player: true,
        },
      },
      screenshots: {
        include: {
          analyses: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!match) {
    notFound();
  }

  const players = await prisma.player.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const selectedPlayerIds = match.squad.map((entry) => entry.playerId);

  const squadCount = match.squad.length;
  const statsCount = match.playerStats.length;
  const missingStats = squadCount - statsCount;

  const playerStatsWithPlayers = match.playerStats.map((stat) => ({
    ...stat,
    playerName: stat.player?.name ?? "Unbekannt",
  }));

  const matchRanking = [...playerStatsWithPlayers].sort(
    (a, b) => b.rating - a.rating
  );

  const matchMvp = matchRanking[0];

  const topScorer = [...playerStatsWithPlayers]
    .filter((stat) => stat.goals > 0)
    .sort((a, b) => b.goals - a.goals)[0];

  const topAssist = [...playerStatsWithPlayers]
    .filter((stat) => stat.assists > 0)
    .sort((a, b) => b.assists - a.assists)[0];

  const distanceLeader = [...playerStatsWithPlayers].sort(
    (a, b) => b.distanceKm - a.distanceKm
  )[0];

  const sprintLeader = [...playerStatsWithPlayers].sort(
    (a, b) => b.sprintDistanceKm - a.sprintDistanceKm
  )[0];

  const possessionLeader = [...playerStatsWithPlayers].sort(
    (a, b) => b.possessionWon - a.possessionWon
  )[0];

  const potm =
    match.playerStats.find((stat) => stat.isPotm) ?? matchMvp ?? null;

  const averageTeamRating =
    match.playerStats.length > 0
      ? (
          match.playerStats.reduce((sum, stat) => sum + stat.rating, 0) /
          match.playerStats.length
        ).toFixed(2)
      : "-";

  const totalGoals = match.playerStats.reduce(
    (sum, stat) => sum + stat.goals,
    0
  );

  const totalAssists = match.playerStats.reduce(
    (sum, stat) => sum + stat.assists,
    0
  );

  const totalShots = match.playerStats.reduce(
    (sum, stat) => sum + stat.shots,
    0
  );

  const totalPasses = match.playerStats.reduce(
    (sum, stat) => sum + stat.passes,
    0
  );

  const totalSuccessfulPasses = match.playerStats.reduce(
    (sum, stat) => sum + stat.successfulPasses,
    0
  );

  const teamPassAccuracy =
    totalPasses > 0
      ? Math.round((totalSuccessfulPasses / totalPasses) * 100)
      : 0;

  const totalDuels = match.playerStats.reduce(
    (sum, stat) => sum + stat.duels,
    0
  );

  const totalSuccessfulDuels = match.playerStats.reduce(
    (sum, stat) => sum + stat.successfulDuels,
    0
  );

  const teamDuelRate =
    totalDuels > 0 ? Math.round((totalSuccessfulDuels / totalDuels) * 100) : 0;

  const totalPossessionWon = match.playerStats.reduce(
    (sum, stat) => sum + stat.possessionWon,
    0
  );

  const totalPossessionLost = match.playerStats.reduce(
    (sum, stat) => sum + stat.possessionLost,
    0
  );

  const totalDistance = match.playerStats.reduce(
    (sum, stat) => sum + stat.distanceKm,
    0
  );

  const totalSprintDistance = match.playerStats.reduce(
    (sum, stat) => sum + stat.sprintDistanceKm,
    0
  );

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">vs {match.opponent}</h1>
          <p className="page-description">
            {match.season.competition.name} • {match.season.name} •{" "}
            {match.matchDate.toLocaleDateString("de-DE")}
          </p>
        </div>

        <div className="match-summary">
          <div className="score-pill">
            {match.teamGoals}:{match.opponentGoals}
          </div>

          <span className="badge badge-status">
            {getStatusLabel(match.status)}
          </span>
        </div>
      </header>

      <div className="card match-report-card">
        <div className="match-report-layout">
          <div>
            <div className="kpi-label">{match.season.competition.name}</div>

            <div className="match-team-name">Flutlicht-Helden Hub</div>

            <div className="match-score-big">
              {match.teamGoals}:{match.opponentGoals}
            </div>

            <div className="match-team-name">{match.opponent}</div>

            <div
              className={
                match.result === "WIN"
                  ? "match-result-win"
                  : match.result === "LOSS"
                  ? "match-result-loss"
                  : "match-result-draw"
              }
            >
              {match.result === "WIN"
                ? "🟢 Sieg"
                : match.result === "LOSS"
                ? "🔴 Niederlage"
                : "🟡 Remis"}
            </div>

            <div className="match-meta">
              {match.matchDate.toLocaleDateString("de-DE")}
              <br />
              Spieltag {match.matchday ?? "-"}
              <br />
              {match.season.name}
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <div className="kpi-label">⭐ MVP</div>
              <div className="kpi-value" style={{ fontSize: 22 }}>
                {potm ? potm.player.name : "-"}
              </div>
              <div className="muted">
                {potm ? `${potm.rating.toFixed(1)} Bewertung` : "Noch keine Stats"}
              </div>
            </div>

            <div className="card">
              <div className="kpi-label">📈 Teamrating</div>
              <div className="kpi-value">{averageTeamRating}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Top Torschütze</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {topScorer ? topScorer.playerName : "-"}
          </div>
          <div className="muted">
            {topScorer ? `${topScorer.goals} Tore` : "Keine Tore"}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Top Assist</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {topAssist ? topAssist.playerName : "-"}
          </div>
          <div className="muted">
            {topAssist ? `${topAssist.assists} Vorlagen` : "Keine Vorlagen"}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Kader</div>
          <div className="kpi-value">{squadCount}</div>
        </div>

        <div className="card">
          <div className="kpi-label">Erfassung</div>
          <div className="kpi-value">
            {squadCount > 0
              ? `${Math.round((statsCount / squadCount) * 100)}%`
              : "0%"}
          </div>
          <div className="muted">
            {statsCount} erfasst • {missingStats} offen
          </div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Match Awards</h2>
        </div>

        {playerStatsWithPlayers.length === 0 ? (
          <p className="page-description">
            Noch keine Spielerleistungen für dieses Spiel erfasst.
          </p>
        ) : (
          <section className="grid grid-4">
            <div className="card">
              <div className="kpi-label">⭐ MVP</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>
                {matchMvp?.playerName ?? "-"}
              </div>
              <div className="page-description">
                {matchMvp ? `${matchMvp.rating.toFixed(1)} Bewertung` : "-"}
              </div>
            </div>

            <div className="card">
              <div className="kpi-label">⚽ Top Scorer</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>
                {topScorer ? topScorer.playerName : "-"}
              </div>
              <div className="page-description">
                {topScorer ? `${topScorer.goals} Tore` : "Keine Tore erfasst"}
              </div>
            </div>

            <div className="card">
              <div className="kpi-label">🎯 Playmaker</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>
                {topAssist ? topAssist.playerName : "-"}
              </div>
              <div className="page-description">
                {topAssist
                  ? `${topAssist.assists} Vorlagen`
                  : "Keine Vorlagen erfasst"}
              </div>
            </div>

            <div className="card">
              <div className="kpi-label">🏃 Laufmaschine</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>
                {distanceLeader && distanceLeader.distanceKm > 0
                  ? distanceLeader.playerName
                  : "-"}
              </div>
              <div className="page-description">
                {distanceLeader && distanceLeader.distanceKm > 0
                  ? `${distanceLeader.distanceKm.toFixed(2)} km`
                  : "Keine Laufdaten"}
              </div>
            </div>

            <div className="card">
              <div className="kpi-label">⚡ Sprintkönig</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>
                {sprintLeader && sprintLeader.sprintDistanceKm > 0
                  ? sprintLeader.playerName
                  : "-"}
              </div>
              <div className="page-description">
                {sprintLeader && sprintLeader.sprintDistanceKm > 0
                  ? `${sprintLeader.sprintDistanceKm.toFixed(2)} km`
                  : "Keine Sprintdaten"}
              </div>
            </div>

            <div className="card">
              <div className="kpi-label">🛡 Ballgewinne</div>
              <div className="kpi-value" style={{ fontSize: 24 }}>
                {possessionLeader && possessionLeader.possessionWon > 0
                  ? possessionLeader.playerName
                  : "-"}
              </div>
              <div className="page-description">
                {possessionLeader && possessionLeader.possessionWon > 0
                  ? `${possessionLeader.possessionWon} Ballgewinne`
                  : "Keine Defensivdaten"}
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Team Performance</h2>
        </div>

        <section className="grid grid-4">
          <div className="card">
            <div className="kpi-label">⚽ Tore</div>
            <div className="kpi-value">{totalGoals}</div>
          </div>

          <div className="card">
            <div className="kpi-label">🎯 Vorlagen</div>
            <div className="kpi-value">{totalAssists}</div>
          </div>

          <div className="card">
            <div className="kpi-label">🥅 Schüsse</div>
            <div className="kpi-value">{totalShots}</div>
          </div>

          <div className="card">
            <div className="kpi-label">📈 Passquote</div>
            <div className="kpi-value">
              {totalPasses > 0 ? `${teamPassAccuracy}%` : "-"}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 16 }} className="grid grid-4">
          <div className="card">
            <div className="kpi-label">📨 Pässe</div>
            <div className="kpi-value">{totalPasses}</div>
          </div>

          <div className="card">
            <div className="kpi-label">🛡 Ballgewinne</div>
            <div className="kpi-value">{totalPossessionWon}</div>
          </div>

          <div className="card">
            <div className="kpi-label">⚔ Zweikampfquote</div>
            <div className="kpi-value">
              {totalDuels > 0 ? `${teamDuelRate}%` : "-"}
            </div>
          </div>

          <div className="card">
            <div className="kpi-label">🏃 Laufdistanz</div>
            <div className="kpi-value" style={{ fontSize: 28 }}>
              {totalDistance.toFixed(2)} km
            </div>
          </div>
        </section>
      </div>

      <section style={{ marginTop: 24 }} className="grid grid-4">
        <div className="card">
          <div className="kpi-label">Datum</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {match.matchDate.toLocaleDateString("de-DE")}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Wettbewerb</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {match.season.competition.name}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Saison</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {match.season.name}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Spieltag</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {match.matchday ?? "-"}
          </div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Match Ranking</h2>
        </div>

        {matchRanking.length === 0 ? (
          <p className="page-description">Noch keine Bewertungen erfasst.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Spieler</th>
                <th>Position</th>
                <th>Bewertung</th>
                <th>Tore</th>
                <th>Vorlagen</th>
                <th>POTM</th>
              </tr>
            </thead>
            <tbody>
              {matchRanking.map((stat, index) => (
                <tr key={stat.id}>
                  <td>{index + 1}</td>
                  <td>{stat.playerName}</td>
                  <td>{stat.position ?? stat.player.mainPosition ?? "-"}</td>
                  <td>{stat.rating.toFixed(1)}</td>
                  <td>{stat.goals}</td>
                  <td>{stat.assists}</td>
                  <td>{stat.isPotm ? "Ja" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Spielerkarten</h2>
        </div>

        {matchRanking.length === 0 ? (
          <p className="page-description">
            Noch keine Spielerleistungen erfasst.
          </p>
        ) : (
          <section className="grid grid-3">
            {matchRanking.map((stat) => (
              <div key={stat.id} className="card">
                <div className="section-title">
                  <div>
                    <h2>{stat.playerName}</h2>
                    <p className="page-description">
                      {stat.position ?? stat.player.mainPosition ?? "Keine Position"}
                    </p>
                  </div>

                  <div className="score-pill">{stat.rating.toFixed(1)}</div>
                </div>

                <div className="grid grid-2">
                  <div>
                    <div className="kpi-label">Tore</div>
                    <div className="kpi-value">{stat.goals}</div>
                  </div>

                  <div>
                    <div className="kpi-label">Vorlagen</div>
                    <div className="kpi-value">{stat.assists}</div>
                  </div>

                  <div>
                    <div className="kpi-label">Pässe</div>
                    <div className="kpi-value" style={{ fontSize: 24 }}>
                      {stat.passes}
                    </div>
                  </div>

                  <div>
                    <div className="kpi-label">Laufweg</div>
                    <div className="kpi-value" style={{ fontSize: 24 }}>
                      {stat.distanceKm.toFixed(2)} km
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <span
                    className={stat.isPotm ? "badge badge-win" : "badge badge-muted"}
                  >
                    {stat.isPotm ? "POTM" : "Kein POTM"}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      <CollapsibleCard
  title="📷 Screenshots"
  defaultOpen={false}
>
  <ScreenshotUpload matchId={match.id} />

  {match.screenshots.length === 0 ? (
    <p className="page-description" style={{ marginTop: 16 }}>
      Noch keine Screenshots hochgeladen.
    </p>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
        gap: 16,
        marginTop: 16,
      }}
    >
      {match.screenshots.map((screenshot) => (
        <div key={screenshot.id} className="card">
          <ScreenshotPreview
            src={screenshot.filePath}
            alt={screenshot.fileName}
          />

          <div
            className="badge badge-status"
            style={{ marginTop: 8, marginBottom: 8 }}
          >
            {getScreenshotCategoryLabel(screenshot.category)}
          </div>

          <div className="muted" style={{ fontSize: 13 }}>
            {screenshot.fileName}
          </div>

          <div
            className="muted"
            style={{ fontSize: 12, marginTop: 4 }}
          >
            {new Date(screenshot.createdAt).toLocaleString("de-DE")}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
            }}
          >
            <AnalyzeScreenshotButton screenshotId={screenshot.id} />
            <DeleteScreenshotButton screenshotId={screenshot.id} />
          </div>

          {screenshot.analyses.length > 0 ? (
            <div
              className="card"
              style={{
                marginTop: 12,
                background: "#111827",
              }}
            >
              <div className="kpi-label">Analyse-Ergebnis</div>

              <p
                className="page-description"
                style={{ marginTop: 8 }}
              >
                {screenshot.analyses[0].rawText}
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )}
</CollapsibleCard>
        
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Kaderübersicht</h2>
        </div>

        {match.squad.length === 0 ? (
          <p className="page-description">Noch keine Spieler zugeordnet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Spieler</th>
                <th>Position</th>
                <th>Bewertung</th>
                <th>Tore</th>
                <th>Vorlagen</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {match.squad.map((entry) => {
                const stat =
                  match.playerStats.find(
                    (playerStat) => playerStat.playerId === entry.player.id
                  ) ?? null;

                return (
                  <tr key={entry.id}>
                    <td>{entry.player.name}</td>
                    <td>{stat?.position ?? entry.player.mainPosition ?? "-"}</td>
                    <td>{stat ? stat.rating.toFixed(1) : "-"}</td>
                    <td>{stat ? stat.goals : "-"}</td>
                    <td>{stat ? stat.assists : "-"}</td>
                    <td>
                      <span
                        className={
                          stat ? "badge badge-win" : "badge badge-muted"
                        }
                      >
                        {stat ? "Erfasst" : "Offen"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <SquadManager
        matchId={match.id}
        players={players}
        selectedPlayerIds={selectedPlayerIds}
      />

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Spielerleistungen bearbeiten</h2>
        </div>

        {match.squad.length === 0 ? (
          <p className="page-description">
            Lege zuerst den Kader für dieses Spiel fest.
          </p>
        ) : (
          match.squad.map((entry) => (
            <StatsForm
              key={entry.player.id}
              matchId={match.id}
              player={entry.player}
              existingStat={
                match.playerStats.find(
                  (stat) => stat.playerId === entry.player.id
                ) ?? null
              }
            />
          ))
        )}
      </div>
    </>
  );
}
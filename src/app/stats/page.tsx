import Link from "next/link";
import { prisma } from "@/lib/db";
import { SeasonFilter } from "./SeasonFilter";

type PlayerRanking = {
  playerId: string;
  name: string;
  mainPosition: string | null;
  games: number;
  goals: number;
  assists: number;
  averageRating: number;
};

function sortByGoals(players: PlayerRanking[]) {
  return [...players]
    .filter((player) => player.games > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);
}

function sortByAssists(players: PlayerRanking[]) {
  return [...players]
    .filter((player) => player.games > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10);
}

function sortByRating(players: PlayerRanking[]) {
  return [...players]
    .filter((player) => player.games > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);
}

function RankingTable({
  title,
  players,
  valueLabel,
  valueRenderer,
}: {
  title: string;
  players: PlayerRanking[];
  valueLabel: string;
  valueRenderer: (player: PlayerRanking) => string | number;
}) {
  return (
    <div className="card">
      <div className="section-title">
        <h2>{title}</h2>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Spieler</th>
            <th>Position</th>
            <th>Spiele</th>
            <th>{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan={5}>Noch keine Daten vorhanden.</td>
            </tr>
          ) : (
            players.map((player, index) => (
              <tr key={player.playerId}>
                <td>{index + 1}</td>
                <td>
                  <Link href={`/players/${player.playerId}`}>
                    {player.name}
                  </Link>
                </td>
                <td>{player.mainPosition ?? "-"}</td>
                <td>{player.games}</td>
                <td>{valueRenderer(player)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function StatsPage({
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

  const players = await prisma.player.findMany({
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
    orderBy: {
      name: "asc",
    },
  });

  const rankings: PlayerRanking[] = players.map((player) => {
    const games = player.stats.length;
    const goals = player.stats.reduce((sum, stat) => sum + stat.goals, 0);
    const assists = player.stats.reduce((sum, stat) => sum + stat.assists, 0);
    const ratingSum = player.stats.reduce((sum, stat) => sum + stat.rating, 0);
    const averageRating = games > 0 ? ratingSum / games : 0;

    return {
      playerId: player.id,
      name: player.name,
      mainPosition: player.mainPosition,
      games,
      goals,
      assists,
      averageRating,
    };
  });

  const tablePlayers = [...rankings].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    return b.averageRating - a.averageRating;
  });

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Statistiken</h1>

          <p className="page-description">
            {activeSeason
              ? `Rankings für ${activeSeason.eafcCycle} • ${activeSeason.competition.name} • ${activeSeason.name}`
              : "Rankings und Leistungsübersichten aus den erfassten Spielerwerten."}
          </p>
        </div>

        {seasons.length > 0 && activeSeason ? (
          <SeasonFilter seasons={seasons} currentSeasonId={activeSeason.id} />
        ) : null}
      </header>

      <section className="grid grid-3">
        <RankingTable
          title="Top Tore"
          players={sortByGoals(rankings)}
          valueLabel="Tore"
          valueRenderer={(player) => player.goals}
        />

        <RankingTable
          title="Top Vorlagen"
          players={sortByAssists(rankings)}
          valueLabel="Vorlagen"
          valueRenderer={(player) => player.assists}
        />

        <RankingTable
          title="Beste Bewertung"
          players={sortByRating(rankings)}
          valueLabel="Ø Bewertung"
          valueRenderer={(player) => player.averageRating.toFixed(2)}
        />
      </section>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Gesamtranking</h2>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Spieler</th>
              <th>Position</th>
              <th>Spiele</th>
              <th>Tore</th>
              <th>Vorlagen</th>
              <th>Scorer</th>
              <th>Ø Bewertung</th>
            </tr>
          </thead>
          <tbody>
            {tablePlayers.length === 0 ? (
              <tr>
                <td colSpan={7}>Noch keine Daten vorhanden.</td>
              </tr>
            ) : (
              tablePlayers.map((player) => (
                <tr key={player.playerId}>
                  <td>
                    <Link href={`/players/${player.playerId}`}>
                      {player.name}
                    </Link>
                  </td>
                  <td>{player.mainPosition ?? "-"}</td>
                  <td>{player.games}</td>
                  <td>{player.goals}</td>
                  <td>{player.assists}</td>
                  <td>{player.goals + player.assists}</td>
                  <td>
                    {player.games > 0 ? player.averageRating.toFixed(2) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
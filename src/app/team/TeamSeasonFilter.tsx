"use client";

export function TeamSeasonFilter({
  seasons,
  currentSeasonId,
}: {
  seasons: {
    id: string;
    name: string;
    eafcCycle: string;
    competition: {
      name: string;
    };
  }[];
  currentSeasonId: string;
}) {
  return (
    <select
      value={currentSeasonId}
      onChange={(event) => {
        window.location.href = `/team?seasonId=${event.target.value}`;
      }}
    >
      {seasons.map((season) => (
        <option key={season.id} value={season.id}>
          {season.eafcCycle} • {season.competition.name} • {season.name}
        </option>
      ))}
    </select>
  );
}
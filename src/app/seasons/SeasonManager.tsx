"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Competition = {
  id: string;
  name: string;
  type: string;
};

type Season = {
  id: string;
  name: string;
  eafcCycle: string;
  isActive: boolean;
  competition: Competition;
};

type SeasonManagerProps = {
  competitions: Competition[];
  seasons: Season[];
};

export function SeasonManager({ competitions, seasons }: SeasonManagerProps) {
  const router = useRouter();

  const [competitionName, setCompetitionName] = useState("");
  const [competitionType, setCompetitionType] = useState("LEAGUE");

  const [seasonName, setSeasonName] = useState("");
  const [eafcCycle, setEafcCycle] = useState("EA FC 26");
  const [competitionId, setCompetitionId] = useState(
    competitions[0]?.id ?? ""
  );
  const [isActive, setIsActive] = useState(false);

  async function createCompetition(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await fetch("/api/competitions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: competitionName,
        type: competitionType,
      }),
    });

    setCompetitionName("");
    setCompetitionType("LEAGUE");
    router.refresh();
  }

  async function createSeason(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await fetch("/api/seasons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: seasonName,
        eafcCycle,
        competitionId,
        isActive,
      }),
    });

    setSeasonName("");
    setEafcCycle("EA FC 26");
    setIsActive(false);
    router.refresh();
  }

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="grid grid-2">
        <div className="card">
          <h2>Wettbewerb anlegen</h2>

          <form className="form" onSubmit={createCompetition}>
            <label>
              Name
              <input
                placeholder="z. B. ProLeague"
                value={competitionName}
                onChange={(event) => setCompetitionName(event.target.value)}
                required
              />
            </label>

            <label>
              Typ
              <select
                value={competitionType}
                onChange={(event) => setCompetitionType(event.target.value)}
              >
                <option value="LEAGUE">Liga</option>
                <option value="CUP">Pokal</option>
                <option value="FRIENDLY">Friendly</option>
                <option value="TOURNAMENT">Turnier</option>
              </select>
            </label>

            <button className="button button-primary" type="submit">
              Wettbewerb speichern
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Saison anlegen</h2>

          <form className="form" onSubmit={createSeason}>
            <label>
              EA FC Zyklus
              <input
                value={eafcCycle}
                onChange={(event) => setEafcCycle(event.target.value)}
                required
              />
            </label>

            <label>
              Saisonname
              <input
                placeholder="z. B. ProLeague Season 36"
                value={seasonName}
                onChange={(event) => setSeasonName(event.target.value)}
                required
              />
            </label>

            <label>
              Wettbewerb
              <select
                value={competitionId}
                onChange={(event) => setCompetitionId(event.target.value)}
                required
              >
                <option value="">Bitte auswählen</option>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Aktive Saison?
              <select
                value={isActive ? "yes" : "no"}
                onChange={(event) => setIsActive(event.target.value === "yes")}
              >
                <option value="no">Nein</option>
                <option value="yes">Ja</option>
              </select>
            </label>

            <button className="button button-primary" type="submit">
              Saison speichern
            </button>
          </form>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2>Wettbewerbe</h2>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Typ</th>
              </tr>
            </thead>
            <tbody>
              {competitions.length === 0 ? (
                <tr>
                  <td colSpan={2}>Noch keine Wettbewerbe angelegt.</td>
                </tr>
              ) : (
                competitions.map((competition) => (
                  <tr key={competition.id}>
                    <td>{competition.name}</td>
                    <td>{competition.type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Saisons</h2>

          <table className="table">
            <thead>
              <tr>
                <th>EA FC</th>
                <th>Name</th>
                <th>Wettbewerb</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {seasons.length === 0 ? (
                <tr>
                  <td colSpan={4}>Noch keine Saisons angelegt.</td>
                </tr>
              ) : (
                seasons.map((season) => (
                  <tr key={season.id}>
                    <td>{season.eafcCycle}</td>
                    <td>{season.name}</td>
                    <td>{season.competition.name}</td>
                    <td>
                      <span
                        className={
                          season.isActive
                            ? "badge badge-success"
                            : "badge badge-muted"
                        }
                      >
                        {season.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
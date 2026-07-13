"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteEntityButton } from "./DeleteEntityButton";

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

export function SeasonManager({
  competitions,
  seasons,
}: SeasonManagerProps) {
  const router = useRouter();

  const [competitionName, setCompetitionName] = useState("");
  const [competitionType, setCompetitionType] = useState("LEAGUE");

  const [seasonName, setSeasonName] = useState("");
  const [eafcCycle, setEafcCycle] = useState("EA FC 26");
  const [competitionId, setCompetitionId] = useState(
    competitions[0]?.id ?? ""
  );
  const [isActive, setIsActive] = useState(false);

  const [competitionError, setCompetitionError] = useState("");
  const [seasonError, setSeasonError] = useState("");
  const [isSavingCompetition, setIsSavingCompetition] = useState(false);
  const [isSavingSeason, setIsSavingSeason] = useState(false);

  useEffect(() => {
    if (
      competitions.length > 0 &&
      !competitions.some(
        (competition) => competition.id === competitionId
      )
    ) {
      setCompetitionId(competitions[0].id);
    }

    if (competitions.length === 0) {
      setCompetitionId("");
    }
  }, [competitions, competitionId]);

  async function createCompetition(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!competitionName.trim()) {
      setCompetitionError("Bitte gib einen Namen ein.");
      return;
    }

    setCompetitionError("");
    setIsSavingCompetition(true);

    try {
      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: competitionName.trim(),
          type: competitionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Wettbewerb konnte nicht gespeichert werden."
        );
      }

      setCompetitionName("");
      setCompetitionType("LEAGUE");
      router.refresh();
    } catch (error) {
      setCompetitionError(
        error instanceof Error
          ? error.message
          : "Beim Speichern ist ein Fehler aufgetreten."
      );
    } finally {
      setIsSavingCompetition(false);
    }
  }

  async function createSeason(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!seasonName.trim()) {
      setSeasonError("Bitte gib einen Saisonnamen ein.");
      return;
    }

    if (!competitionId) {
      setSeasonError("Bitte wähle einen Wettbewerb aus.");
      return;
    }

    setSeasonError("");
    setIsSavingSeason(true);

    try {
      const response = await fetch("/api/seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: seasonName.trim(),
          eafcCycle: eafcCycle.trim(),
          competitionId,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Saison konnte nicht gespeichert werden."
        );
      }

      setSeasonName("");
      setEafcCycle("EA FC 26");
      setIsActive(false);
      router.refresh();
    } catch (error) {
      setSeasonError(
        error instanceof Error
          ? error.message
          : "Beim Speichern ist ein Fehler aufgetreten."
      );
    } finally {
      setIsSavingSeason(false);
    }
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
                onChange={(event) =>
                  setCompetitionName(event.target.value)
                }
                disabled={isSavingCompetition}
                required
              />
            </label>

            <label>
              Typ
              <select
                value={competitionType}
                onChange={(event) =>
                  setCompetitionType(event.target.value)
                }
                disabled={isSavingCompetition}
              >
                <option value="LEAGUE">Liga</option>
                <option value="CUP">Pokal</option>
                <option value="FRIENDLY">Friendly</option>
                <option value="TOURNAMENT">Turnier</option>
              </select>
            </label>

            {competitionError ? (
              <div className="entity-delete__error">
                {competitionError}
              </div>
            ) : null}

            <button
              className="button button-primary"
              type="submit"
              disabled={isSavingCompetition}
            >
              {isSavingCompetition
                ? "Speichert..."
                : "Wettbewerb speichern"}
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
                onChange={(event) =>
                  setEafcCycle(event.target.value)
                }
                disabled={isSavingSeason}
                required
              />
            </label>

            <label>
              Saisonname
              <input
                placeholder="z. B. ProLeague Season 36"
                value={seasonName}
                onChange={(event) =>
                  setSeasonName(event.target.value)
                }
                disabled={isSavingSeason}
                required
              />
            </label>

            <label>
              Wettbewerb
              <select
                value={competitionId}
                onChange={(event) =>
                  setCompetitionId(event.target.value)
                }
                disabled={
                  isSavingSeason || competitions.length === 0
                }
                required
              >
                <option value="">Bitte auswählen</option>

                {competitions.map((competition) => (
                  <option
                    key={competition.id}
                    value={competition.id}
                  >
                    {competition.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Aktive Saison?
              <select
                value={isActive ? "yes" : "no"}
                onChange={(event) =>
                  setIsActive(event.target.value === "yes")
                }
                disabled={isSavingSeason}
              >
                <option value="no">Nein</option>
                <option value="yes">Ja</option>
              </select>
            </label>

            {seasonError ? (
              <div className="entity-delete__error">
                {seasonError}
              </div>
            ) : null}

            <button
              className="button button-primary"
              type="submit"
              disabled={
                isSavingSeason || competitions.length === 0
              }
            >
              {isSavingSeason
                ? "Speichert..."
                : "Saison speichern"}
            </button>

            {competitions.length === 0 ? (
              <p className="page-description">
                Lege zuerst einen Wettbewerb an.
              </p>
            ) : null}
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
                <th>Aktionen</th>
              </tr>
            </thead>

            <tbody>
              {competitions.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    Noch keine Wettbewerbe angelegt.
                  </td>
                </tr>
              ) : (
                competitions.map((competition) => (
                  <tr key={competition.id}>
                    <td>{competition.name}</td>
                    <td>{competition.type}</td>

                    <td>
                      <DeleteEntityButton
                        id={competition.id}
                        name={competition.name}
                        type="competition"
                      />
                    </td>
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
                <th>Aktionen</th>
              </tr>
            </thead>

            <tbody>
              {seasons.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    Noch keine Saisons angelegt.
                  </td>
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

                    <td>
                      <DeleteEntityButton
                        id={season.id}
                        name={season.name}
                        type="season"
                      />
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
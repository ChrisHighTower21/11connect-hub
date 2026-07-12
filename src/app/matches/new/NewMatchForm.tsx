"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Season = {
  id: string;
  name: string;
  eafcCycle: string;
  isActive: boolean;
  competition: {
    id: string;
    name: string;
    type: string;
  };
};

type NewMatchFormProps = {
  seasons: Season[];
};

export function NewMatchForm({ seasons }: NewMatchFormProps) {
  const router = useRouter();

  const activeSeason = seasons.find((season) => season.isActive);

  const [seasonId, setSeasonId] = useState(
    activeSeason?.id ?? seasons[0]?.id ?? ""
  );
  const [matchDate, setMatchDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [homeAway, setHomeAway] = useState("HOME");
  const [matchday, setMatchday] = useState("");
  const [teamGoals, setTeamGoals] = useState("");
  const [opponentGoals, setOpponentGoals] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seasonId,
          matchDate,
          opponent,
          homeAway,
          matchday,
          teamGoals,
          opponentGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Spiel konnte nicht gespeichert werden.");
      }

      router.push("/matches");
      router.refresh();
    } catch (err) {
      setError("Beim Speichern ist ein Fehler aufgetreten.");
    } finally {
      setIsSaving(false);
    }
  }

  if (seasons.length === 0) {
    return (
      <div className="card">
        <h2>Keine Saison vorhanden</h2>
        <p className="page-description">
          Bitte lege zuerst unter Wettbewerbe & Saisons eine Saison an.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Saison
          <select
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
            required
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.eafcCycle} / {season.competition.name} / {season.name}
              </option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label>
            Datum
            <input
              type="date"
              value={matchDate}
              onChange={(event) => setMatchDate(event.target.value)}
              required
            />
          </label>

          <label>
            Gegner
            <input
              placeholder="z. B. DMK eSports"
              value={opponent}
              onChange={(event) => setOpponent(event.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Heim/Auswärts
            <select
              value={homeAway}
              onChange={(event) => setHomeAway(event.target.value)}
            >
              <option value="HOME">Heim</option>
              <option value="AWAY">Auswärts</option>
            </select>
          </label>

          <label>
            Spieltag/Runde
            <input
              placeholder="z. B. Spieltag 4"
              value={matchday}
              onChange={(event) => setMatchday(event.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Eigene Tore
            <input
              type="number"
              min="0"
              value={teamGoals}
              onChange={(event) => setTeamGoals(event.target.value)}
              required
            />
          </label>

          <label>
            Gegner Tore
            <input
              type="number"
              min="0"
              value={opponentGoals}
              onChange={(event) => setOpponentGoals(event.target.value)}
              required
            />
          </label>
        </div>

        {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

        <button className="button button-primary" type="submit">
          {isSaving ? "Speichert..." : "Spiel speichern"}
        </button>
      </form>
    </div>
  );
}
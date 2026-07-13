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

    if (!seasonId) {
      setError("Bitte wähle eine Saison aus.");
      return;
    }

    if (!matchDate) {
      setError("Bitte gib ein Spieldatum an.");
      return;
    }

    if (!opponent.trim()) {
      setError("Bitte gib einen Gegner an.");
      return;
    }

    const parsedTeamGoals = Number(teamGoals);
    const parsedOpponentGoals = Number(opponentGoals);

    if (
      !Number.isInteger(parsedTeamGoals) ||
      parsedTeamGoals < 0 ||
      !Number.isInteger(parsedOpponentGoals) ||
      parsedOpponentGoals < 0
    ) {
      setError("Bitte gib gültige Torwerte ein.");
      return;
    }

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
          opponent: opponent.trim(),
          homeAway,
          matchday: matchday.trim() || null,
          teamGoals: parsedTeamGoals,
          opponentGoals: parsedOpponentGoals,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let message = "Spiel konnte nicht gespeichert werden.";

        try {
          const data = JSON.parse(responseText);

          if (typeof data?.error === "string") {
            message = data.error;
          }
        } catch {
          if (responseText) {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      router.push("/matches");
      router.refresh();
    } catch (error) {
      console.error("Fehler beim Speichern des Spiels:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Beim Speichern ist ein unbekannter Fehler aufgetreten."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (seasons.length === 0) {
    return (
      <div className="card">
        <h2>Keine Saison vorhanden</h2>

        <p className="page-description">
          Bitte lege zuerst unter Wettbewerbe &amp; Saisons eine Saison an.
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
            disabled={isSaving}
            required
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.eafcCycle} / {season.competition.name} /{" "}
                {season.name}
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
              disabled={isSaving}
              required
            />
          </label>

          <label>
            Gegner
            <input
              type="text"
              placeholder="z. B. Gegnername"
              value={opponent}
              onChange={(event) => setOpponent(event.target.value)}
              disabled={isSaving}
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
              disabled={isSaving}
            >
              <option value="HOME">Heim</option>
              <option value="AWAY">Auswärts</option>
            </select>
          </label>

          <label>
            Spieltag/Runde
            <input
              type="text"
              placeholder="z. B. Spieltag 4"
              value={matchday}
              onChange={(event) => setMatchday(event.target.value)}
              disabled={isSaving}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Eigene Tore
            <input
              type="number"
              min="0"
              step="1"
              value={teamGoals}
              onChange={(event) => setTeamGoals(event.target.value)}
              disabled={isSaving}
              required
            />
          </label>

          <label>
            Gegner-Tore
            <input
              type="number"
              min="0"
              step="1"
              value={opponentGoals}
              onChange={(event) => setOpponentGoals(event.target.value)}
              disabled={isSaving}
              required
            />
          </label>
        </div>

        {error ? (
          <div
            style={{
              padding: "12px 14px",
              border: "1px solid rgba(239,68,68,.35)",
              borderRadius: 12,
              background: "rgba(239,68,68,.1)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          className="button button-primary"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Speichert..." : "Spiel speichern"}
        </button>
      </form>
    </div>
  );
}
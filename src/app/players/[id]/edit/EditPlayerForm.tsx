"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EditPlayerFormProps = {
  player: {
    id: string;
    name: string;
    eaId: string | null;
    mainPosition: string | null;
    secondaryPosition: string | null;
    discordName: string | null;
    joinedAt: string;
    isActive: boolean;
  };
};

export function EditPlayerForm({ player }: EditPlayerFormProps) {
  const router = useRouter();

  const [name, setName] = useState(player.name);
  const [eaId, setEaId] = useState(player.eaId ?? "");
  const [mainPosition, setMainPosition] = useState(player.mainPosition ?? "");
  const [secondaryPosition, setSecondaryPosition] = useState(
    player.secondaryPosition ?? ""
  );
  const [discordName, setDiscordName] = useState(player.discordName ?? "");
  const [joinedAt, setJoinedAt] = useState(player.joinedAt);
  const [isActive, setIsActive] = useState(player.isActive);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          eaId,
          mainPosition,
          secondaryPosition,
          discordName,
          joinedAt,
          isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Spieler konnte nicht gespeichert werden.");
      }

      router.push(`/players/${player.id}`);
      router.refresh();
    } catch (err) {
      setError("Beim Speichern ist ein Fehler aufgetreten.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="card">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Spielername
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            EA-ID
            <input
              value={eaId}
              onChange={(event) => setEaId(event.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Hauptposition
            <input
              value={mainPosition}
              onChange={(event) => setMainPosition(event.target.value)}
            />
          </label>

          <label>
            Nebenposition
            <input
              value={secondaryPosition}
              onChange={(event) => setSecondaryPosition(event.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Discord-Name
            <input
              value={discordName}
              onChange={(event) => setDiscordName(event.target.value)}
            />
          </label>

          <label>
            Eintrittsdatum
            <input
              type="date"
              value={joinedAt}
              onChange={(event) => setJoinedAt(event.target.value)}
            />
          </label>
        </div>

        <label>
          Status
          <select
            value={isActive ? "active" : "inactive"}
            onChange={(event) => setIsActive(event.target.value === "active")}
          >
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>
        </label>

        {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

        <button className="button button-primary" type="submit">
          {isSaving ? "Speichert..." : "Änderungen speichern"}
        </button>
      </form>
    </div>
  );
}
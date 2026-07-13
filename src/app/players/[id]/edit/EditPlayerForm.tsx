"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PlayerData = {
  id: string;
  name: string;
  eaId: string | null;
  mainPosition: string | null;
  secondaryPosition: string | null;
  discordName: string | null;
  joinedAt: string;
  isActive: boolean;
};

type EditPlayerFormProps = {
  player: PlayerData;
};

export function EditPlayerForm({
  player,
}: EditPlayerFormProps) {
  const router = useRouter();

  const [name, setName] = useState(player.name);
  const [eaId, setEaId] = useState(player.eaId ?? "");
  const [mainPosition, setMainPosition] = useState(
    player.mainPosition ?? ""
  );
  const [secondaryPosition, setSecondaryPosition] = useState(
    player.secondaryPosition ?? ""
  );
  const [discordName, setDiscordName] = useState(
    player.discordName ?? ""
  );
  const [joinedAt, setJoinedAt] = useState(player.joinedAt);
  const [isActive, setIsActive] = useState(player.isActive);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Bitte gib einen Spielernamen ein.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/players/${player.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            eaId: eaId.trim() || null,
            mainPosition: mainPosition.trim() || null,
            secondaryPosition:
              secondaryPosition.trim() || null,
            discordName: discordName.trim() || null,
            joinedAt: joinedAt || null,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Spieler konnte nicht aktualisiert werden."
        );
      }

      router.push("/players");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Beim Speichern ist ein Fehler aufgetreten."
      );
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
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={isSaving}
              required
            />
          </label>

          <label>
            EA-ID
            <input
              type="text"
              value={eaId}
              onChange={(event) =>
                setEaId(event.target.value)
              }
              disabled={isSaving}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Hauptposition
            <input
              type="text"
              value={mainPosition}
              onChange={(event) =>
                setMainPosition(event.target.value)
              }
              disabled={isSaving}
            />
          </label>

          <label>
            Nebenposition
            <input
              type="text"
              value={secondaryPosition}
              onChange={(event) =>
                setSecondaryPosition(event.target.value)
              }
              disabled={isSaving}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Discord-Name
            <input
              type="text"
              value={discordName}
              onChange={(event) =>
                setDiscordName(event.target.value)
              }
              disabled={isSaving}
            />
          </label>

          <label>
            Eintrittsdatum
            <input
              type="date"
              value={joinedAt}
              onChange={(event) =>
                setJoinedAt(event.target.value)
              }
              disabled={isSaving}
            />
          </label>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) =>
              setIsActive(event.target.checked)
            }
            disabled={isSaving}
            style={{
              width: 18,
              height: 18,
            }}
          />

          Spieler ist aktiv
        </label>

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

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <button
            className="button button-primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Speichert..." : "Änderungen speichern"}
          </button>

          <button
            className="button"
            type="button"
            disabled={isSaving}
            onClick={() => router.push("/players")}
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
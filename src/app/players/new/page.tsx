"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPlayerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [eaId, setEaId] = useState("");
  const [mainPosition, setMainPosition] = useState("");
  const [secondaryPosition, setSecondaryPosition] = useState("");
  const [discordName, setDiscordName] = useState("");
  const [joinedAt, setJoinedAt] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Bitte gib einen Spielernamen ein.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          eaId: eaId.trim() || null,
          mainPosition: mainPosition.trim() || null,
          secondaryPosition: secondaryPosition.trim() || null,
          discordName: discordName.trim() || null,
          joinedAt: joinedAt || null,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let message = "Spieler konnte nicht gespeichert werden.";

        try {
          const data = JSON.parse(responseText);

          if (typeof data?.error === "string") {
            message = data.error;
          }

          if (typeof data?.message === "string") {
            message = data.message;
          }
        } catch {
          if (responseText) {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      router.push("/players");
      router.refresh();
    } catch (err) {
      console.error("Fehler beim Speichern des Spielers:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Beim Speichern ist ein unbekannter Fehler aufgetreten."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Spieler anlegen</h1>

          <p className="page-description">
            Neuen Spieler zum Spielerstamm hinzufügen.
          </p>
        </div>
      </header>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Spielername
              <input
                type="text"
                name="name"
                placeholder=""
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSaving}
                required
              />
            </label>

            <label>
              EA-ID
              <input
                type="text"
                name="eaId"
                placeholder=""
                value={eaId}
                onChange={(event) => setEaId(event.target.value)}
                disabled={isSaving}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Hauptposition
              <input
                type="text"
                name="mainPosition"
                placeholder="z. B. IV, ZOM, ST"
                value={mainPosition}
                onChange={(event) => setMainPosition(event.target.value)}
                disabled={isSaving}
              />
            </label>

            <label>
              Nebenposition
              <input
                type="text"
                name="secondaryPosition"
                placeholder="z. B. LIV, RIV, ZDM"
                value={secondaryPosition}
                onChange={(event) => setSecondaryPosition(event.target.value)}
                disabled={isSaving}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Discord-ID
              <input
                type="text"
                name="discordName"
                placeholder=""
                value={discordName}
                onChange={(event) => setDiscordName(event.target.value)}
                disabled={isSaving}
              />
            </label>

            <label>
              Eintrittsdatum
              <input
                type="date"
                name="joinedAt"
                value={joinedAt}
                onChange={(event) => setJoinedAt(event.target.value)}
                disabled={isSaving}
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
            {isSaving ? "Speichert..." : "Speichern"}
          </button>
        </form>
      </div>
    </>
  );
}
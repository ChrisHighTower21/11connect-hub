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
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/players", {
        method: "POST",
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
        }),
      });

      if (!response.ok) {
        throw new Error("Spieler konnte nicht gespeichert werden.");
      }

      router.push("/players");
      router.refresh();
    } catch (err) {
      setError("Beim Speichern ist ein Fehler aufgetreten.");
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
                name="name"
                placeholder="z. B. ChrisHighTow"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label>
              EA-ID
              <input
                name="eaId"
                placeholder="z. B. ChristianBaulig"
                value={eaId}
                onChange={(event) => setEaId(event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Hauptposition
              <input
                name="mainPosition"
                placeholder="z. B. IV, ZOM, ST"
                value={mainPosition}
                onChange={(event) => setMainPosition(event.target.value)}
              />
            </label>

            <label>
              Nebenposition
              <input
                name="secondaryPosition"
                placeholder="z. B. LIV, RIV, ZDM"
                value={secondaryPosition}
                onChange={(event) => setSecondaryPosition(event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Discord-Name
              <input
                name="discordName"
                placeholder="z. B. Christian"
                value={discordName}
                onChange={(event) => setDiscordName(event.target.value)}
              />
            </label>

            <label>
              Eintrittsdatum
              <input
                name="joinedAt"
                type="date"
                value={joinedAt}
                onChange={(event) => setJoinedAt(event.target.value)}
              />
            </label>
          </div>

          {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

          <button className="button button-primary" type="submit">
            {isSaving ? "Speichert..." : "Speichern"}
          </button>
        </form>
      </div>
    </>
  );
}
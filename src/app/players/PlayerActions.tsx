"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PlayerActionsProps = {
  playerId: string;
  playerName: string;
};

export function PlayerActions({
  playerId,
  playerName,
}: PlayerActionsProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Möchtest du den Spieler "${playerName}" wirklich löschen?\n\nAlle zugehörigen Leistungs- und Kaderdaten werden ebenfalls gelöscht.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch("/api/players", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    playerId,
  }),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Spieler konnte nicht gelöscht werden."
        );
      }

      router.refresh();

setTimeout(() => {
  window.location.reload();
}, 150);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Beim Löschen ist ein Fehler aufgetreten."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          className="button"
          href={`/players/${playerId}/edit`}
          style={{
            padding: "8px 12px",
            fontSize: 13,
          }}
        >
          Bearbeiten
        </Link>

        <button
          type="button"
          className="button"
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: "8px 12px",
            fontSize: 13,
            borderColor: "rgba(239,68,68,.35)",
            background: "rgba(239,68,68,.1)",
            color: "#fca5a5",
          }}
        >
          {isDeleting ? "Löscht..." : "Löschen"}
        </button>
      </div>

      {error ? (
        <div
          style={{
            marginTop: 8,
            color: "#fca5a5",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
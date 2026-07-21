"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Player = {
  id: string;
  eaId: string;
  mainPosition: string | null;
  isActive: boolean;
};

type SquadManagerProps = {
  matchId: string;
  players: Player[];
  selectedPlayerIds: string[];
};

export function SquadManager({
  matchId,
  players,
  selectedPlayerIds,
}: SquadManagerProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedPlayerIds);
  const [isSaving, setIsSaving] = useState(false);

  function togglePlayer(playerId: string) {
    setSelected((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  }

  async function saveSquad() {
    setIsSaving(true);

    await fetch(`/api/matches/${matchId}/squad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerIds: selected,
      }),
    });

    setIsSaving(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="section-title">
        <div>
          <h2>Kader verwalten</h2>
          <p className="page-description" style={{ marginTop: 4 }}>
            {selected.length} Spieler ausgewählt
          </p>
        </div>

        <button
          className="button button-primary"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? "Schließen" : "Kader bearbeiten"}
        </button>
      </div>

      {isOpen ? (
        <>
          {players.length === 0 ? (
            <p className="page-description">
              Es sind noch keine aktiven Spieler vorhanden.
            </p>
          ) : (
            <div className="squad-list">
              {players.map((player) => {
                const isSelected = selected.includes(player.id);

                return (
                  <button
                    key={player.id}
                    type="button"
                    className={`squad-item ${
                      isSelected ? "squad-item-selected" : ""
                    }`}
                    onClick={() => togglePlayer(player.id)}
                  >
                    <div>
                      <strong>{player.eaId}</strong>
                      <span>{player.mainPosition ?? "Keine Position"}</span>
                    </div>

                    <div className="squad-check">{isSelected ? "✓" : ""}</div>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <button
              className="button button-primary"
              type="button"
              onClick={saveSquad}
              disabled={isSaving}
            >
              {isSaving ? "Speichert..." : "Kader speichern"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

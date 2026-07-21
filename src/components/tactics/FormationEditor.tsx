"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { useMemo, useState } from "react";
import { FootballPitch } from "./FootballPitch";
import {
  DraggablePlayerChip,
  PlayerChipPreview,
} from "./PlayerChip";
import { formationTemplates } from "./formationTemplates";
import {
  jerseyStyleOptions,
  type JerseyStyleKey,
} from "./jerseyStyles";
import type {
  FormationAssignments,
  FormationKey,
  TacticPlayer,
} from "./types";

const formationOptions: FormationKey[] = [
  "4-2-3-1",
  "4-3-3",
  "4-4-2",
  "3-5-2",
];

const selectControlStyle = {
  height: 42,
  borderRadius: 11,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "#0f172a",
  color: "white",
  padding: "0 12px",
  fontWeight: 700,
} as const;

const pointerFirstCollisionDetection: CollisionDetection = (
  args
) => {
  /*
   * 1. Exakter Treffer unter dem Mauszeiger.
   */
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    /*
     * Positionsslots haben Vorrang vor größeren
     * übergeordneten Droppable-Bereichen.
     */
    const slotCollision = pointerCollisions.find(
      ({ id }) =>
        String(id).startsWith("slot:")
    );

    if (slotCollision) {
      return [slotCollision];
    }

    /*
     * Beispielsweise der Mannschaftskader,
     * wenn ein Spieler zurückgelegt wird.
     */
    return pointerCollisions;
  }

  /*
   * Bei Tastatursteuerung gibt es keine
   * Mauskoordinaten.
   */
  if (!args.pointerCoordinates) {
    return closestCenter(args);
  }

  const { x, y } = args.pointerCoordinates;

  /*
   * 2. Falls die Maus knapp außerhalb eines
   * Positionskreises liegt, verwenden wir einen
   * virtuellen 0×0-Punkt exakt an der Mausposition.
   *
   * closestCenter vergleicht dadurch die Positionen
   * mit dem Mauszeiger und nicht mehr mit der langen
   * ursprünglichen Spielerkarte.
   */
  return closestCenter({
    ...args,

    collisionRect: {
      ...args.collisionRect,
      left: x,
      right: x,
      top: y,
      bottom: y,
      width: 0,
      height: 0,
    },

    /*
     * Beim toleranten Fallback dürfen nur echte
     * Feldpositionen fokussiert werden.
     */
    droppableContainers:
      args.droppableContainers.filter(
        ({ id }) =>
          String(id).startsWith("slot:")
      ),
  });
};

type FormationEditorProps = {
  players: TacticPlayer[];
};

export function FormationEditor({
  players,
}: FormationEditorProps) {
  const [formation, setFormation] =
    useState<FormationKey>("4-2-3-1");

  const [jerseyStyle, setJerseyStyle] =
    useState<JerseyStyleKey>("blue");

  const [assignments, setAssignments] =
    useState<FormationAssignments>(() =>
      createEmptyAssignments("4-2-3-1")
    );

  const [activePlayerId, setActivePlayerId] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor)
);

  const positions = formationTemplates[formation];

  const playersById = useMemo(
    () =>
      new Map(
        players.map((player) => [
          player.id,
          player,
        ])
      ),
    [players]
  );

  const assignedPlayerIds = useMemo(
    () =>
      new Set(
        Object.values(assignments).filter(
          (
            playerId
          ): playerId is string =>
            Boolean(playerId)
        )
      ),
    [assignments]
  );

  const assignedCount = assignedPlayerIds.size;

  const availablePlayerCount =
    players.length - assignedCount;

  const unassignedPlayers = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLocaleLowerCase("de");

    return players
      .filter((player) => {
        if (assignedPlayerIds.has(player.id)) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const eaIdMatches = player.eaId
          .toLocaleLowerCase("de")
          .includes(normalizedQuery);

        return eaIdMatches;
      })
      .sort((first, second) =>
        first.eaId.localeCompare(
          second.eaId,
          "de",
          {
            numeric: true,
            sensitivity: "base",
          }
        )
      );
  }, [
    players,
    assignedPlayerIds,
    searchQuery,
  ]);

  const activePlayer = activePlayerId
    ? playersById.get(activePlayerId) ?? null
    : null;

  function changeFormation(
    nextFormation: FormationKey
  ) {
    setFormation(nextFormation);

    setAssignments((current) => {
      const next =
        createEmptyAssignments(nextFormation);

      for (const position of formationTemplates[
        nextFormation
      ]) {
        const playerId =
          current[position.id];

        if (playerId) {
          next[position.id] = playerId;
        }
      }

      return next;
    });
  }

  function handleDragStart(
    event: DragStartEvent
  ) {
    const playerId =
      event.active.data.current?.playerId;

    setActivePlayerId(
      typeof playerId === "string"
        ? playerId
        : null
    );
  }

  function handleDragEnd(
    event: DragEndEvent
  ) {
    setActivePlayerId(null);

    const playerId =
      event.active.data.current?.playerId;

    if (
      typeof playerId !== "string" ||
      !event.over
    ) {
      return;
    }

    const targetId = String(event.over.id);

    if (targetId === "squad") {
      removePlayer(playerId);
      return;
    }

    if (!targetId.startsWith("slot:")) {
      return;
    }

    const targetSlotId = targetId.slice(
      "slot:".length
    );

    const targetExists = positions.some(
      (position) =>
        position.id === targetSlotId
    );

    if (!targetExists) {
      return;
    }

    setAssignments((current) => {
      const sourceSlotId = Object.keys(
        current
      ).find(
        (slotId) =>
          current[slotId] === playerId
      );

      if (sourceSlotId === targetSlotId) {
        return current;
      }

      const displacedPlayerId =
        current[targetSlotId] ?? null;

      const next = {
        ...current,
      };

      if (sourceSlotId) {
        next[sourceSlotId] =
          displacedPlayerId;
      }

      next[targetSlotId] = playerId;

      return next;
    });
  }

  function removePlayer(
    playerId: string
  ) {
    setAssignments((current) => {
      const next = {
        ...current,
      };

      for (const slotId of Object.keys(
        next
      )) {
        if (next[slotId] === playerId) {
          next[slotId] = null;
        }
      }

      return next;
    });
  }

  function resetFormation() {
    setAssignments(
      createEmptyAssignments(formation)
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={
        pointerFirstCollisionDetection
      }
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() =>
        setActivePlayerId(null)
      }
    >
      <section
        style={{
          display: "grid",
          gap: 20,
        }}
      >
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="kpi-label">
              Formation
            </div>

            <h2
              style={{
                marginTop: 6,
              }}
            >
              Startaufstellung
            </h2>

            <div
              className="muted"
              style={{
                marginTop: 5,
                fontSize: 13,
              }}
            >
              {assignedCount} von 11 Positionen
              besetzt
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "end",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "grid",
                gap: 6,
                minWidth: 170,
              }}
            >
              <span
                className="muted"
                style={{
                  fontSize: 12,
                }}
              >
                Formation
              </span>

              <select
                value={formation}
                onChange={(event) =>
                  changeFormation(
                    event.target
                      .value as FormationKey
                  )
                }
                style={selectControlStyle}
              >
                {formationOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </label>

            <label
              style={{
                display: "grid",
                gap: 6,
                minWidth: 200,
              }}
            >
              <span
                className="muted"
                style={{
                  fontSize: 12,
                }}
              >
                Trikotdesign
              </span>

              <select
                value={jerseyStyle}
                onChange={(event) =>
                  setJerseyStyle(
                    event.target
                      .value as JerseyStyleKey
                  )
                }
                style={selectControlStyle}
              >
                {jerseyStyleOptions.map((option) => (
                  <option
                    key={option.key}
                    value={option.key}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={resetFormation}
              className="button"
              style={{
                height: 42,
                background: "#334155",
              }}
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          <FootballPitch
            positions={positions}
            players={players}
            assignments={assignments}
            jerseyStyle={jerseyStyle}
            onRemovePlayer={removePlayer}
          />

          <SquadPanel
            players={unassignedPlayers}
            totalPlayers={players.length}
            availablePlayerCount={
              availablePlayerCount
            }
            assignedCount={assignedCount}
            jerseyStyle={jerseyStyle}
            searchQuery={searchQuery}
            onSearchQueryChange={
              setSearchQuery
            }
          />
        </div>
      </section>

      <DragOverlay
  modifiers={[snapCenterToCursor]}
  dropAnimation={null}
>
  {activePlayer ? (
    <PlayerChipPreview
      player={activePlayer}
      jerseyStyle={jerseyStyle}
    />
  ) : null}
</DragOverlay>
    </DndContext>
  );
}

type SquadPanelProps = {
  players: TacticPlayer[];
  totalPlayers: number;
  availablePlayerCount: number;
  assignedCount: number;
  jerseyStyle: JerseyStyleKey;
  searchQuery: string;
  onSearchQueryChange: (
    value: string
  ) => void;
};

function SquadPanel({
  players,
  totalPlayers,
  availablePlayerCount,
  assignedCount,
  jerseyStyle,
  searchQuery,
  onSearchQueryChange,
}: SquadPanelProps) {
  const { setNodeRef, isOver } =
    useDroppable({
      id: "squad",
    });

  const hasSearchQuery =
    searchQuery.trim().length > 0;

  return (
    <aside
      ref={setNodeRef}
      className="card"
      style={{
        position: "sticky",
        top: 20,
        display: "grid",
        gap: 14,
        maxHeight:
          "calc(100vh - 50px)",
        overflow: "hidden",
        borderColor: isOver
          ? "#38bdf8"
          : undefined,
        boxShadow: isOver
          ? "0 0 0 4px rgba(56,189,248,0.18)"
          : undefined,
      }}
    >
      <div>
        <div className="kpi-label">
          Mannschaftskader
        </div>

        <h3
          style={{
            marginTop: 6,
          }}
        >
          Spieler
        </h3>

        <div
          className="muted"
          style={{
            marginTop: 5,
            fontSize: 12,
          }}
        >
          {hasSearchQuery
            ? `${players.length} Treffer · `
            : null}

          {availablePlayerCount} verfügbar
          {" · "}
          {assignedCount} aufgestellt
          {" · "}
          {totalPlayers} gesamt
        </div>
      </div>

      <label
        style={{
          display: "grid",
          gap: 6,
        }}
      >
        <span
          className="muted"
          style={{
            fontSize: 12,
          }}
        >
          Über EA-ID suchen
        </span>

        <div
          style={{
            position: "relative",
          }}
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              onSearchQueryChange(
                event.target.value
              )
            }
            placeholder="z. B. ChrisHighTower"
            aria-label="Spieler über EA-ID suchen"
            autoComplete="off"
            style={{
              width: "100%",
              height: 42,
              padding: searchQuery
                ? "0 42px 0 12px"
                : "0 12px",
              borderRadius: 11,
              border:
                "1px solid rgba(148,163,184,0.35)",
              background: "#0f172a",
              color: "#ffffff",
              outline: "none",
            }}
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() =>
                onSearchQueryChange("")
              }
              aria-label="Suche zurücksetzen"
              title="Suche zurücksetzen"
              style={{
                position: "absolute",
                top: "50%",
                right: 8,
                width: 28,
                height: 28,
                display: "grid",
                placeItems: "center",
                transform:
                  "translateY(-50%)",
                border: 0,
                borderRadius: "50%",
                background:
                  "rgba(51,65,85,0.85)",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: 17,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      </label>

      <div
        style={{
          padding: 10,
          borderRadius: 12,
          border: isOver
            ? "2px dashed #38bdf8"
            : "1px dashed rgba(148,163,184,0.35)",
          background: isOver
            ? "rgba(14,165,233,0.12)"
            : "rgba(15,23,42,0.45)",
          color: "#94a3b8",
          textAlign: "center",
          fontSize: 12,
        }}
      >
        Spieler hier ablegen, um ihn vom Feld
        zu nehmen
      </div>

      <div
        style={{
          display: "grid",
          gap: 9,
          overflowY: "auto",
          paddingRight: 3,
        }}
      >
        {players.length > 0 ? (
          players.map((player) => (
            <DraggablePlayerChip
              key={player.id}
              player={player}
              jerseyStyle={jerseyStyle}
            />
          ))
        ) : totalPlayers === 0 ? (
          <EmptySquad />
        ) : hasSearchQuery ? (
          <NoSearchResults
            searchQuery={searchQuery}
          />
        ) : (
          <div
            style={{
              padding: 22,
              borderRadius: 14,
              background:
                "rgba(15,23,42,0.55)",
              color: "#86efac",
              textAlign: "center",
              fontSize: 13,
            }}
          >
            Alle verfügbaren Spieler sind
            aufgestellt.
          </div>
        )}
      </div>
    </aside>
  );
}

function NoSearchResults({
  searchQuery,
}: {
  searchQuery: string;
}) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 14,
        background:
          "rgba(15,23,42,0.55)",
        color: "#94a3b8",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 28,
        }}
      >
        🔎
      </div>

      <div
        style={{
          marginTop: 8,
          color: "white",
          fontWeight: 800,
        }}
      >
        Keine EA-ID gefunden
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 12,
          overflowWrap: "anywhere",
        }}
      >
        Kein verfügbarer Spieler passt zu „
        {searchQuery.trim()}“.
      </div>
    </div>
  );
}

function EmptySquad() {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 14,
        background:
          "rgba(15,23,42,0.55)",
        color: "#94a3b8",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 30,
        }}
      >
        👥
      </div>

      <div
        style={{
          marginTop: 8,
          color: "white",
          fontWeight: 800,
        }}
      >
        Keine Spieler vorhanden
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 12,
        }}
      >
        Lege zuerst Spieler im Spielerbereich
        an.
      </div>
    </div>
  );
}

function createEmptyAssignments(
  formation: FormationKey
): FormationAssignments {
  return Object.fromEntries(
    formationTemplates[formation].map(
      (position) => [
        position.id,
        null,
      ]
    )
  );
}

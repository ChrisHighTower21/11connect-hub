"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  DraggablePlayerChip,
} from "./PlayerChip";
import type {
  FormationAssignments,
  FormationPosition,
  TacticPlayer,
} from "./types";

type FootballPitchProps = {
  positions: FormationPosition[];
  players: TacticPlayer[];
  assignments: FormationAssignments;
  onRemovePlayer: (playerId: string) => void;
};

export function FootballPitch({
  positions,
  players,
  assignments,
  onRemovePlayer,
}: FootballPitchProps) {
  const playersById = new Map(
    players.map((player) => [player.id, player])
  );

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          aspectRatio: "2 / 3",
          overflow: "hidden",
          borderRadius: 28,
          border: "2px solid rgba(186,230,253,0.4)",
          background:
            "repeating-linear-gradient(180deg, #176b3a 0%, #176b3a 10%, #145f34 10%, #145f34 20%)",
          boxShadow:
            "0 28px 70px rgba(0,0,0,0.42)",
        }}
      >
        <PitchGlow />
        <PitchMarkings />

        {positions.map((position) => {
          const playerId =
            assignments[position.id] ?? null;

          const player = playerId
            ? playersById.get(playerId) ?? null
            : null;

          return (
            <PlayerSlot
              key={position.id}
              position={position}
              player={player}
              onRemovePlayer={onRemovePlayer}
            />
          );
        })}
      </div>
    </div>
  );
}

type PlayerSlotProps = {
  position: FormationPosition;
  player: TacticPlayer | null;
  onRemovePlayer: (playerId: string) => void;
};

function PlayerSlot({
  position,
  player,
  onRemovePlayer,
}: PlayerSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${position.id}`,
    data: {
      slotId: position.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: "clamp(66px, 20%, 126px)",
        minHeight: 66,
        display: "grid",
        placeItems: "center",
        transform: "translate(-50%, -50%)",
        zIndex: isOver ? 10 : 2,
      }}
    >
      {player ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 44,
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            background: isOver
              ? "rgba(56,189,248,0.22)"
              : "transparent",
            boxShadow: isOver
              ? "0 0 0 7px rgba(56,189,248,0.2)"
              : "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -21,
              transform: "translateX(-50%)",
              padding: "2px 7px",
              borderRadius: 999,
              background: "#020617",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#bae6fd",
              fontSize: 9,
              fontWeight: 900,
              zIndex: 3,
            }}
          >
            {position.label}
          </div>

          <DraggablePlayerChip
            player={player}
            compact
          />

          <button
            type="button"
            aria-label={`${player.eaId} entfernen`}
            onClick={() => onRemovePlayer(player.id)}
            style={{
              position: "absolute",
              top: -5,
              left: "calc(50% + 11px)",
              width: 22,
              height: 22,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: "50%",
              background: "#991b1b",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              zIndex: 5,
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div
          style={{
            width: isOver ? 66 : 56,
            height: isOver ? 66 : 56,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: isOver
              ? "3px solid #7dd3fc"
              : "2px dashed rgba(255,255,255,0.78)",
            background: isOver
              ? "rgba(14,165,233,0.46)"
              : "rgba(2,6,23,0.7)",
            color: "white",
            fontSize: 12,
            fontWeight: 900,
            boxShadow: isOver
              ? "0 0 0 8px rgba(56,189,248,0.18)"
              : "0 8px 20px rgba(0,0,0,0.25)",
            transition: "all 150ms ease",
          }}
        >
          {position.label}
        </div>
      )}
    </div>
  );
}

function PitchGlow() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at 50% 52%, rgba(134,239,172,0.15), transparent 42%), linear-gradient(90deg, rgba(0,0,0,0.15), transparent 20%, transparent 80%, rgba(0,0,0,0.15))",
      }}
    />
  );
}

function PitchMarkings() {
  const line = "rgba(255,255,255,0.58)";

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 16,
          border: `2px solid ${line}`,
          borderRadius: 8,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: "50%",
          borderTop: `2px solid ${line}`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "22%",
          aspectRatio: "1",
          border: `2px solid ${line}`,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: line,
          transform: "translate(-50%, -50%)",
        }}
      />

      <PenaltyArea top line={line} />
      <PenaltyArea line={line} />
    </>
  );
}

function PenaltyArea({
  top = false,
  line,
}: {
  top?: boolean;
  line: string;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: top ? 16 : undefined,
          bottom: top ? undefined : 16,
          width: "55%",
          height: "16%",
          border: `2px solid ${line}`,
          borderTop: top ? 0 : undefined,
          borderBottom: top ? undefined : 0,
          transform: "translateX(-50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: top ? 16 : undefined,
          bottom: top ? undefined : 16,
          width: "24%",
          height: "7%",
          border: `2px solid ${line}`,
          borderTop: top ? 0 : undefined,
          borderBottom: top ? undefined : 0,
          transform: "translateX(-50%)",
        }}
      />
    </>
  );
}

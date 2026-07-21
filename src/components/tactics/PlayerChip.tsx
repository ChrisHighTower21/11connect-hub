"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TacticPlayer } from "./types";

type DraggablePlayerChipProps = {
  player: TacticPlayer;
  compact?: boolean;
};

export function DraggablePlayerChip({
  player,
  compact = false,
}: DraggablePlayerChipProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: `player:${player.id}`,
    data: {
      playerId: player.id,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={{
        width: "100%",
        minWidth: 0,
        display: "grid",
        gridTemplateColumns: compact
          ? "32px minmax(0, 1fr)"
          : "40px minmax(0, 1fr)",
        alignItems: "center",
        gap: compact ? 7 : 10,
        padding: compact ? "6px 7px" : "9px 10px",
        borderRadius: compact ? 12 : 14,
        border: "1px solid rgba(125,211,252,0.48)",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))",
        color: "white",
        boxShadow: compact
          ? "0 6px 16px rgba(0,0,0,0.28)"
          : "0 10px 24px rgba(0,0,0,0.3)",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.3 : 1,
        touchAction: "none",
        textAlign: "left",
      }}
    >
      <PlayerAvatar
        player={player}
        size={compact ? 32 : 40}
      />

      <PlayerText
        player={player}
        compact={compact}
      />
    </button>
  );
}

type PlayerChipPreviewProps = {
  player: TacticPlayer;
};

export function PlayerChipPreview({
  player,
}: PlayerChipPreviewProps) {
  const secondaryInformation = [
    player.shirtNumber !== null
      ? `#${player.shirtNumber}`
      : null,
    player.position,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      style={{
        position: "relative",
        width: 48,
        height: 48,
        pointerEvents: "none",
      }}
    >
      <PlayerAvatar player={player} size={48} />

      <div
        style={{
          position: "absolute",
          left: 58,
          top: "50%",
          minWidth: 150,
          maxWidth: 220,
          padding: "8px 11px",
          transform: "translateY(-50%)",
          borderRadius: 12,
          border: "1px solid rgba(125,211,252,0.7)",
          background: "#0f172a",
          color: "white",
          boxShadow: "0 14px 36px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {player.eaId}
        </div>

        {secondaryInformation ? (
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 2,
              color: "#94a3b8",
              fontSize: 10,
            }}
          >
            {secondaryInformation}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PlayerAvatar({
  player,
  size,
}: {
  player: TacticPlayer;
  size: number;
}) {
  const initials = player.eaId
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, #38bdf8, #2563eb)",
        color: "white",
        fontSize: size <= 32 ? 11 : 13,
        fontWeight: 900,
        boxShadow: "0 5px 14px rgba(37,99,235,0.35)",
      }}
    >
      {player.shirtNumber ?? (initials || "11")}
    </div>
  );
}

function PlayerText({
  player,
  compact = false,
}: {
  player: TacticPlayer;
  compact?: boolean;
}) {
  const secondaryInformation = [
    player.shirtNumber !== null
      ? `#${player.shirtNumber}`
      : null,
    player.position,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span style={{ minWidth: 0 }}>
      <span
        style={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: compact ? 11 : 14,
          fontWeight: 900,
          color: "#ffffff",
        }}
      >
        {player.eaId}
      </span>

      {secondaryInformation ? (
        <span
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: 3,
            color: "#94a3b8",
            fontSize: compact ? 9 : 11,
          }}
        >
          {secondaryInformation}
        </span>
      ) : null}
    </span>
  );
}

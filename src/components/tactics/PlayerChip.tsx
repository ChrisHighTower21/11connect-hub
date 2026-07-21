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
        position: compact ? "relative" : undefined,
        width: compact ? 44 : "100%",
        height: compact ? 44 : undefined,
        minWidth: 0,
        display: "grid",
        gridTemplateColumns: compact
          ? undefined
          : "40px minmax(0, 1fr)",
        placeItems: compact ? "center" : undefined,
        alignItems: "center",
        gap: compact ? 0 : 10,
        padding: compact ? 0 : "9px 10px",
        borderRadius: compact ? "50%" : 14,
        border: compact
          ? 0
          : "1px solid rgba(125,211,252,0.48)",
        background: compact
          ? "transparent"
          : "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))",
        color: "white",
        boxShadow: compact
          ? "none"
          : "0 10px 24px rgba(0,0,0,0.3)",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.3 : 1,
        touchAction: "none",
        textAlign: compact ? "center" : "left",
        overflow: "visible",
      }}
    >
      <PlayerAvatar
        player={player}
        size={compact ? 44 : 40}
      />

      {compact ? (
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "calc(100% + 5px)",
            padding: "3px 7px",
            transform: "translateX(-50%)",
            border: "1px solid rgba(125,211,252,0.42)",
            borderRadius: 999,
            background: "rgba(2,6,23,0.9)",
            color: "#ffffff",
            boxShadow: "0 5px 14px rgba(0,0,0,0.3)",
            fontSize: 10,
            fontWeight: 800,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {player.eaId}
        </span>
      ) : (
        <PlayerText player={player} />
      )}
    </button>
  );
}

type PlayerChipPreviewProps = {
  player: TacticPlayer;
};

export function PlayerChipPreview({
  player,
}: PlayerChipPreviewProps) {
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
          left: "50%",
          top: 54,
          padding: "4px 8px",
          transform: "translateX(-50%)",
          borderRadius: 999,
          border: "1px solid rgba(125,211,252,0.6)",
          background: "rgba(2,6,23,0.94)",
          color: "white",
          boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
          fontSize: 11,
          fontWeight: 900,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        {player.eaId}
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
      {player.shirtNumber ?? "–"}
    </div>
  );
}

function PlayerText({
  player,
}: {
  player: TacticPlayer;
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
          fontSize: 14,
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
            fontSize: 11,
          }}
        >
          {secondaryInformation}
        </span>
      ) : null}
    </span>
  );
}

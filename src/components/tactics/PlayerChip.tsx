"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  jerseyStyles,
  type JerseyStyleKey,
} from "./jerseyStyles";
import type { TacticPlayer } from "./types";

type DraggablePlayerChipProps = {
  player: TacticPlayer;
  compact?: boolean;
  jerseyStyle?: JerseyStyleKey;
};

export function DraggablePlayerChip({
  player,
  compact = false,
  jerseyStyle = "blue",
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
        width: compact ? 64 : "100%",
        height: compact ? 56 : undefined,
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
      <PlayerJersey
        player={player}
        size={compact ? 64 : 40}
        jerseyStyle={jerseyStyle}
      />

      {compact ? (
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "calc(100% + 6px)",
            padding: "4px 9px",
            transform: "translateX(-50%)",
            border: "1px solid rgba(125,211,252,0.42)",
            borderRadius: 999,
            background: "rgba(2,6,23,0.9)",
            color: "#ffffff",
            boxShadow: "0 5px 14px rgba(0,0,0,0.3)",
            fontSize: 12,
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
  jerseyStyle?: JerseyStyleKey;
};

export function PlayerChipPreview({
  player,
  jerseyStyle = "blue",
}: PlayerChipPreviewProps) {
  return (
    <div
      style={{
        position: "relative",
        width: 64,
        height: 56,
        pointerEvents: "none",
      }}
    >
      <PlayerJersey
        player={player}
        size={64}
        jerseyStyle={jerseyStyle}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 62,
          padding: "4px 9px",
          transform: "translateX(-50%)",
          borderRadius: 999,
          border: "1px solid rgba(125,211,252,0.6)",
          background: "rgba(2,6,23,0.94)",
          color: "white",
          boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
          fontSize: 12,
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

function PlayerJersey({
  player,
  size,
  jerseyStyle,
}: {
  player: TacticPlayer;
  size: number;
  jerseyStyle: JerseyStyleKey;
}) {
  const height = Math.round(size * 0.88);
  const design = jerseyStyles[jerseyStyle];
  const jerseyShape =
    "polygon(40% 0, 33% 5%, 22% 9%, 0 25%, 13% 47%, 25% 39%, 25% 100%, 75% 100%, 75% 39%, 87% 47%, 100% 25%, 78% 9%, 67% 5%, 60% 0)";

  return (
    <div
      style={{
        width: size,
        height,
        position: "relative",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        clipPath: jerseyShape,
        WebkitClipPath: jerseyShape,
        background: design.background,
        color: design.numberColor,
        fontSize: size <= 40 ? 12 : 18,
        fontWeight: 900,
        filter:
          "drop-shadow(0 0 1px rgba(224,242,254,0.9)) drop-shadow(0 6px 8px rgba(0,0,0,0.32))",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: "23%",
          height: "13%",
          transform: "translateX(-50%)",
          borderRadius: "0 0 999px 999px",
          background: design.collarColor,
        }}
      />

      <span
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "10%",
          minWidth: size <= 40 ? 20 : 28,
          padding: size <= 40 ? "2px 4px" : "3px 6px",
          borderRadius: 999,
          background: design.numberBackground,
          lineHeight: 1,
          textShadow: "0 1px 3px rgba(0,0,0,0.38)",
        }}
      >
        {player.shirtNumber ?? "–"}
      </span>
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

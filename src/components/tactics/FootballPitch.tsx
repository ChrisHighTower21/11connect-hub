import type { FormationPosition } from "./types";

type FootballPitchProps = {
  positions: FormationPosition[];
};

export function FootballPitch({
  positions,
}: FootballPitchProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 720,
        aspectRatio: "2 / 3",
        overflow: "hidden",
        borderRadius: 24,
        border: "2px solid rgba(255,255,255,0.28)",
        background:
          "linear-gradient(180deg, #176b3a 0%, #0e4f2a 100%)",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.35)",
      }}
    >
      <PitchMarkings />

      {positions.map((position) => (
        <div
          key={position.id}
          style={{
            position: "absolute",
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: 58,
              height: 58,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.9)",
              background: "rgba(15,23,42,0.9)",
              color: "white",
              fontSize: 13,
              fontWeight: 800,
              boxShadow:
                "0 10px 24px rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
          >
            {position.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function PitchMarkings() {
  const line = "rgba(255,255,255,0.55)";

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 16,
          border: `2px solid ${line}`,
          borderRadius: 6,
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
          width: 110,
          height: 110,
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

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 16,
          width: "54%",
          height: "16%",
          border: `2px solid ${line}`,
          borderTop: 0,
          transform: "translateX(-50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          width: "54%",
          height: "16%",
          border: `2px solid ${line}`,
          borderBottom: 0,
          transform: "translateX(-50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 16,
          width: "22%",
          height: "7%",
          border: `2px solid ${line}`,
          borderTop: 0,
          transform: "translateX(-50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          width: "22%",
          height: "7%",
          border: `2px solid ${line}`,
          borderBottom: 0,
          transform: "translateX(-50%)",
        }}
      />
    </>
  );
}
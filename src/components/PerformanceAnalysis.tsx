"use client";

import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

export function PerformanceAnalysis({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 24, padding: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          width: "100%",
          padding: "20px 24px",
          border: "none",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800 }}>
          📈 Performance-Analyse
        </span>

        <span style={{ fontSize: 22, fontWeight: 800 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <div style={{ padding: "0 24px 24px" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
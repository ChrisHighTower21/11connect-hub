"use client";

import { useState } from "react";

type CollapsibleCardProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card" style={{ marginTop: 24, padding: 0 }}>
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
        <span style={{ fontSize: 22, fontWeight: 800 }}>{title}</span>
        <span style={{ fontSize: 20, fontWeight: 800 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? <div style={{ padding: "0 24px 24px" }}>{children}</div> : null}
    </div>
  );
}
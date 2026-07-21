"use client";

import { useState } from "react";
import { FootballPitch } from "./FootballPitch";
import { formationTemplates } from "./formationTemplates";
import type { FormationKey } from "./types";

const formationOptions: FormationKey[] = [
  "4-2-3-1",
  "4-3-3",
  "4-4-2",
  "3-5-2",
];

export function FormationEditor() {
  const [formation, setFormation] =
    useState<FormationKey>("4-2-3-1");

  const positions = formationTemplates[formation];

  return (
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
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="kpi-label">Aufstellung</div>
          <h2 style={{ marginTop: 6 }}>
            Formation konfigurieren
          </h2>
        </div>

        <label
          style={{
            display: "grid",
            gap: 6,
            minWidth: 180,
          }}
        >
          <span className="muted">Formation</span>

          <select
            value={formation}
            onChange={(event) =>
              setFormation(
                event.target.value as FormationKey
              )
            }
            style={{
              borderRadius: 10,
              border:
                "1px solid rgba(148,163,184,0.3)",
              background: "#0f172a",
              color: "white",
              padding: "10px 12px",
            }}
          >
            {formationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) minmax(260px, 340px)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <FootballPitch positions={positions} />

        <aside
          className="card"
          style={{
            minHeight: 320,
          }}
        >
          <div className="kpi-label">Kader</div>
          <h3 style={{ marginTop: 6 }}>
            Spieler auswählen
          </h3>

          <p
            className="muted"
            style={{ marginTop: 10 }}
          >
            Im nächsten Schritt laden wir hier deine
            bestehenden Spieler und ziehen sie per
            Drag-and-drop auf das Feld.
          </p>
        </aside>
      </div>
    </section>
  );
}
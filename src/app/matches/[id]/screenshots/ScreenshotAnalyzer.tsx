"use client";

import { useState } from "react";
import { runScreenshotOcr } from "./lib/runOcr";
import {
  parseScreenshotText,
  type ParsedScreenshotStats,
} from "./parseScreenshotText";

type ScreenshotAnalyzerProps = {
  screenshotId: string;
};

export function ScreenshotAnalyzer({
  screenshotId,
}: ScreenshotAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState("");
const [parsedStats, setParsedStats] =
  useState<ParsedScreenshotStats | null>(null);

  async function analyze() {
    setIsAnalyzing(true);
    setProgress(0);
    setStatus("Bild wird vorbereitet …");
    setText("");
    setConfidence(null);
    setError("");
    setParsedStats(null);

    try {
      const result = await runScreenshotOcr(
        `/api/screenshots/${screenshotId}/image`,
        ({ status: nextStatus, progress: nextProgress }) => {
          setStatus(nextStatus);
          setProgress(nextProgress);
        }
      );

      const parsed = parseScreenshotText(result.text);

setText(result.text);
setConfidence(result.confidence);
setParsedStats(parsed);

setStatus("Analyse abgeschlossen");
setProgress(100);
    } catch (cause) {
      console.error("Screenshot-OCR fehlgeschlagen:", cause);

      setError(
        cause instanceof Error
          ? cause.message
          : "Der Screenshot konnte nicht analysiert werden."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button
        type="button"
        onClick={analyze}
        disabled={isAnalyzing}
        className="button"
      >
        {isAnalyzing ? "OCR läuft …" : "Kostenlos auslesen"}
      </button>

      {isAnalyzing ? (
        <div>
          <progress value={progress} max={100} style={{ width: "100%" }} />
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            {status} · {progress}%
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="card" style={{ borderColor: "#ef4444" }}>
          <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>
        </div>
      ) : null}

      {text ? (
        <div className="card" style={{ background: "#111827" }}>
          <div className="kpi-label">OCR-Rohtext</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            Konfidenz: {confidence?.toFixed(1) ?? "-"}%
          </div>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              marginTop: 10,
              fontSize: 13,
            }}
          >
            {text}
          </pre>
        </div>
      ) : null}
{parsedStats ? (
  <div className="card" style={{ background: "#111827" }}>
    <div className="kpi-label">Erkannte Statistiken</div>

    <table style={{ width: "100%", marginTop: 12 }}>
      <tbody>
  <StatRow label="EA-ID" value={parsedStats.playerEaId} />
  <StatRow label="Bewertung" value={parsedStats.rating} />

  <StatRow label="Tore" value={parsedStats.goals} />
  <StatRow label="Vorlagen" value={parsedStats.assists} />

  <StatRow label="Schüsse" value={parsedStats.shots} />

  <StatRow
    label="Schussgenauigkeit"
    value={parsedStats.shotAccuracy}
    suffix="%"
  />

  <StatRow label="Pässe" value={parsedStats.passes} />

  <StatRow
    label="Passgenauigkeit"
    value={parsedStats.passAccuracy}
    suffix="%"
  />

  <StatRow label="Dribblings" value={parsedStats.dribbles} />

  <StatRow
    label="Dribbling-Erfolgsquote"
    value={parsedStats.dribbleSuccessRate}
    suffix="%"
  />

  <StatRow label="Zweikämpfe" value={parsedStats.tackles} />

  <StatRow
    label="Zweikampf-Erfolgsquote"
    value={parsedStats.tackleSuccessRate}
    suffix="%"
  />

  <StatRow label="Abseits" value={parsedStats.offsides} />

  <StatRow
    label="Begangene Fouls"
    value={parsedStats.foulsCommitted}
  />

  <StatRow
    label="Ballbesitz erobert"
    value={parsedStats.possessionWon}
  />

  <StatRow
    label="Ballverluste"
    value={parsedStats.possessionLost}
  />

  <StatRow
    label="Gespielte Minuten"
    value={parsedStats.minutesPlayed}
  />

  <StatRow
    label="Laufleistung"
    value={parsedStats.distanceKm}
    suffix=" km"
  />

  <StatRow
    label="Sprintdistanz"
    value={parsedStats.sprintDistanceKm}
    suffix=" km"
  />
</tbody>
    </table>
  </div>
) : null}
    </div>
  );
}
type StatRowProps = {
  label: string;
  value: string | number | null;
  suffix?: string;
};

function StatRow({
  label,
  value,
  suffix = "",
}: StatRowProps) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "";

  return (
    <tr>
      <td
        style={{
          padding: "6px 0",
          color: "#9ca3af",
          width: "55%",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>

      <td
        style={{
          padding: "6px 0",
          fontWeight: 600,
          verticalAlign: "top",
        }}
      >
        {hasValue ? `${value}${suffix}` : "Nicht erkannt"}
      </td>
    </tr>
  );
}

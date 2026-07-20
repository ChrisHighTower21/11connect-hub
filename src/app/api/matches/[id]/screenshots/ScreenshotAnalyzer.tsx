"use client";

import { useState } from "react";
import { runScreenshotOcr } from "./lib/runOcr";

type ScreenshotAnalyzerProps = {
  screenshotId: string;
};

export function ScreenshotAnalyzer({ screenshotId }: ScreenshotAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function analyze() {
    setIsAnalyzing(true);
    setProgress(0);
    setStatus("Bild wird vorbereitet …");
    setText("");
    setConfidence(null);
    setError("");

    try {
      const result = await runScreenshotOcr(
        `/api/screenshots/${screenshotId}/image`,
        ({ status: nextStatus, progress: nextProgress }) => {
          setStatus(nextStatus);
          setProgress(nextProgress);
        }
      );

      setText(result.text);
      setConfidence(result.confidence);
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
    </div>
  );
}

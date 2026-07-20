"use client";

import { useState } from "react";
import { createWorker } from "tesseract.js";
import ScreenshotAnalyzer from "@/components/screenshots/ScreenshotAnalyzer";

type ScreenshotAnalyzerProps = {
  screenshotId: string;
};

type AnalysisState = {
  text: string;
  confidence: number | null;
};

export default function ScreenshotAnalyzer({
  screenshotId,
}: ScreenshotAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisState>({
    text: "",
    confidence: null,
  });
  const [error, setError] = useState("");

  async function analyzeScreenshot() {
    setIsAnalyzing(true);
    setProgress(0);
    setStatusText("OCR wird vorbereitet …");
    setError("");
    setAnalysis({
      text: "",
      confidence: null,
    });

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

    try {
      worker = await createWorker("deu", 1, {
        logger: (message) => {
          if (typeof message.progress === "number") {
            setProgress(Math.round(message.progress * 100));
          }

          if (message.status) {
            setStatusText(message.status);
          }
        },
      });

      const imageUrl = `/api/screenshots/${screenshotId}/image`;

      const result = await worker.recognize(imageUrl);

      setAnalysis({
        text: result.data.text.trim(),
        confidence: result.data.confidence,
      });

      setStatusText("Analyse abgeschlossen");
      setProgress(100);
    } catch (analysisError) {
      console.error("OCR-Analyse fehlgeschlagen:", analysisError);

      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Der Screenshot konnte nicht analysiert werden."
      );
    } finally {
      if (worker) {
        await worker.terminate();
      }

      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={analyzeScreenshot}
        disabled={isAnalyzing}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAnalyzing ? "Screenshot wird gelesen …" : "Screenshot kostenlos auslesen"}
      </button>

      {isAnalyzing && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-gray-600">
            {statusText} – {progress} %
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {analysis.text && (
        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold">Erkannter Rohtext</h3>

            {analysis.confidence !== null && (
              <span className="text-sm text-gray-600">
                OCR-Konfidenz: {analysis.confidence.toFixed(1)} %
              </span>
            )}
          </div>

          <pre className="whitespace-pre-wrap break-words rounded bg-gray-50 p-3 text-sm">
            {analysis.text}
          </pre>
        </div>
      )}
    </div>
  );
}
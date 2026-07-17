"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AnalyzeScreenshotButtonProps = {
  screenshotId: string;
};

export function AnalyzeScreenshotButton({
  screenshotId,
}: AnalyzeScreenshotButtonProps) {
  const router = useRouter();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  async function analyzeScreenshot() {
    setError("");
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `/api/screenshots/${screenshotId}/analyze`,
        {
          method: "POST",
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        let message = "Screenshot konnte nicht analysiert werden.";

        try {
          const data = JSON.parse(responseText);

          if (typeof data?.error === "string") {
            message = data.error;
          }
        } catch {
          if (responseText) {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      router.refresh();
    } catch (error) {
      console.error("Screenshot-Analyse fehlgeschlagen:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Bei der Analyse ist ein unbekannter Fehler aufgetreten."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div>
      <button
        className="button button-primary"
        type="button"
        onClick={analyzeScreenshot}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? "KI analysiert..." : "Mit KI analysieren"}
      </button>

      {error ? (
        <div
          style={{
            marginTop: 8,
            maxWidth: 260,
            color: "#fca5a5",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
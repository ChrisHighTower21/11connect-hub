"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AnalyzeScreenshotButton({
  screenshotId,
}: {
  screenshotId: string;
}) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function analyzeScreenshot() {
    setIsAnalyzing(true);

    await fetch(`/api/screenshots/${screenshotId}/analyze`, {
      method: "POST",
    });

    setIsAnalyzing(false);
    router.refresh();
  }

  return (
    <button
      className="button button-primary"
      type="button"
      onClick={analyzeScreenshot}
      disabled={isAnalyzing}
    >
      {isAnalyzing ? "Analysiert..." : "Analysieren"}
    </button>
  );
}
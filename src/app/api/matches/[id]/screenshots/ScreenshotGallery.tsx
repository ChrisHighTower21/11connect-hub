import { DeleteScreenshotButton } from "../DeleteScreenshotButton";
import { ScreenshotPreview } from "../ScreenshotPreview";
import { ScreenshotUpload } from "../ScreenshotUpload";
import { ScreenshotAnalyzer } from "./ScreenshotAnalyzer";
import type { MatchScreenshotView } from "./types";

type ScreenshotGalleryProps = {
  matchId: string;
  screenshots: MatchScreenshotView[];
};

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    OVERVIEW: "Übersicht",
    POSSESSION: "Ballbesitz",
    SHOOTING: "Schussverhalten",
    PASSING: "Pässe",
    DEFENDING: "Abwehr",
    GOALKEEPER: "TW-Spiel",
    OTHER: "Sonstiges",
  };

  return labels[category] ?? category;
}

export function ScreenshotGallery({
  matchId,
  screenshots,
}: ScreenshotGalleryProps) {
  return (
    <div>
      <ScreenshotUpload matchId={matchId} />

      {screenshots.length === 0 ? (
        <p className="page-description" style={{ marginTop: 16 }}>
          Noch keine Screenshots hochgeladen.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {screenshots.map((screenshot) => (
            <article key={screenshot.id} className="card">
              <ScreenshotPreview
                src={`/api/screenshots/${screenshot.id}/image`}
                alt={screenshot.fileName}
              />

              <div
                className="badge badge-status"
                style={{ marginTop: 8, marginBottom: 8 }}
              >
                {getCategoryLabel(screenshot.category)}
              </div>

              <div className="muted" style={{ fontSize: 13 }}>
                {screenshot.fileName}
              </div>

              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {new Date(screenshot.createdAt).toLocaleString("de-DE")}
              </div>

              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                <ScreenshotAnalyzer screenshotId={screenshot.id} />
                <DeleteScreenshotButton screenshotId={screenshot.id} />
              </div>

              {screenshot.analyses[0]?.rawText ? (
                <div className="card" style={{ marginTop: 12, background: "#111827" }}>
                  <div className="kpi-label">Gespeicherte Analyse</div>
                  <p className="page-description" style={{ marginTop: 8 }}>
                    {screenshot.analyses[0].rawText}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

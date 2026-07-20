"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ScreenshotUploadProps = {
  matchId: string;
};

type UploadResult = {
  fileName: string;
  success: boolean;
  message?: string;
};

export function ScreenshotUpload({ matchId }: ScreenshotUploadProps) {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("OVERVIEW");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<UploadResult[]>([]);

  async function uploadScreenshot(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setResults([]);

    if (files.length === 0) {
      setError("Bitte wähle mindestens eine Datei aus.");
      return;
    }

    setIsUploading(true);

    const uploadResults: UploadResult[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("category", category);

        try {
          const response = await fetch(
            `/api/matches/${matchId}/screenshots`,
            {
              method: "POST",
              body: formData,
            }
          );

          let responseData: unknown = null;

          try {
            responseData = await response.json();
          } catch {
            responseData = null;
          }

          if (!response.ok) {
            const message =
              typeof responseData === "object" &&
              responseData !== null &&
              "error" in responseData &&
              typeof responseData.error === "string"
                ? responseData.error
                : "Upload fehlgeschlagen.";

            uploadResults.push({
              fileName: file.name,
              success: false,
              message,
            });

            continue;
          }

          uploadResults.push({
            fileName: file.name,
            success: true,
          });
        } catch {
          uploadResults.push({
            fileName: file.name,
            success: false,
            message: "Netzwerkfehler beim Upload.",
          });
        }
      }

      setResults(uploadResults);

      const failedUploads = uploadResults.filter(
        (result) => !result.success
      );

      if (failedUploads.length === 0) {
        setFiles([]);
        setCategory("OVERVIEW");
      } else {
        setError(
          `${failedUploads.length} von ${uploadResults.length} Dateien konnten nicht hochgeladen werden.`
        );
      }

      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );

    const invalidCount = selectedFiles.length - validFiles.length;

    if (invalidCount > 0) {
      setError(
        `${invalidCount} Datei(en) wurden übersprungen. Erlaubt sind PNG, JPG und WebP.`
      );
    } else {
      setError("");
    }

    setFiles(validFiles);
    setResults([]);
  }

  return (
    <form className="form" onSubmit={uploadScreenshot}>
      <label>
        Screenshot-Typ
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          disabled={isUploading}
        >
          <option value="OVERVIEW">Übersicht</option>
          <option value="POSSESSION">Ballbesitz</option>
          <option value="SHOOTING">Schussverhalten</option>
          <option value="PASSING">Pässe</option>
          <option value="DEFENDING">Abwehr</option>
          <option value="GOALKEEPER">TW-Spiel</option>
          <option value="OTHER">Sonstiges</option>
        </select>
      </label>

      <label>
        Screenshots auswählen
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={isUploading}
          onChange={handleFileSelection}
        />
      </label>

      {files.length > 0 ? (
        <div
          className="card"
          style={{
            padding: 14,
            background: "#111827",
          }}
        >
          <div className="kpi-label">
            Ausgewählte Dateien: {files.length}
          </div>

          <div
            style={{
              display: "grid",
              gap: 6,
              marginTop: 10,
            }}
          >
            {files.map((file) => (
              <div
                key={`${file.name}-${file.lastModified}`}
                className="muted"
                style={{
                  fontSize: 13,
                  overflowWrap: "anywhere",
                }}
              >
                {file.name}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div
          className="card"
          style={{
            padding: 14,
            background: "#111827",
          }}
        >
          <div className="kpi-label">Upload-Ergebnis</div>

          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 10,
            }}
          >
            {results.map((result) => (
              <div
                key={result.fileName}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    overflowWrap: "anywhere",
                  }}
                >
                  {result.fileName}
                </span>

                <span
                  style={{
                    color: result.success
                      ? "#86efac"
                      : "#fca5a5",
                    whiteSpace: "nowrap",
                  }}
                >
                  {result.success
                    ? "Hochgeladen"
                    : result.message ?? "Fehler"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            padding: "12px 14px",
            border: "1px solid rgba(239,68,68,.35)",
            borderRadius: 12,
            background: "rgba(239,68,68,.1)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        className="button button-primary"
        type="submit"
        disabled={isUploading || files.length === 0}
      >
        {isUploading
          ? `Lädt ${files.length} Datei(en) hoch...`
          : `${files.length || ""} Screenshot${
              files.length === 1 ? "" : "s"
            } hochladen`}
      </button>
    </form>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ScreenshotUploadProps = {
  matchId: string;
};

export function ScreenshotUpload({ matchId }: ScreenshotUploadProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("OVERVIEW");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadScreenshot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Bitte wähle zuerst eine Datei aus.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      const response = await fetch(`/api/matches/${matchId}/screenshots`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload fehlgeschlagen.");
      }

      setFile(null);
      setCategory("OVERVIEW");
      router.refresh();
    } catch (err) {
      setError("Screenshot konnte nicht hochgeladen werden.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="form" onSubmit={uploadScreenshot}>
      <label>
        Screenshot-Typ
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
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
        Screenshot auswählen
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
          }}
        />
      </label>

      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      <button className="button button-primary" type="submit">
        {isUploading ? "Lädt hoch..." : "Screenshot hochladen"}
      </button>
    </form>
  );
}
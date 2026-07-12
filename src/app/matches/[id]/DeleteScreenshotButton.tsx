"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteScreenshotButton({
  screenshotId,
}: {
  screenshotId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteScreenshot() {
    const confirmed = window.confirm(
      "Screenshot wirklich löschen?"
    );

    if (!confirmed) return;

    setIsDeleting(true);

    await fetch(`/api/screenshots/${screenshotId}`, {
      method: "DELETE",
    });

    setIsDeleting(false);
    router.refresh();
  }

  return (
    <button
      className="button"
      type="button"
      onClick={deleteScreenshot}
      disabled={isDeleting}
    >
      {isDeleting ? "Löscht..." : "Löschen"}
    </button>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteEntityButtonProps = {
  id: string;
  name: string;
  type: "season" | "competition";
};

export function DeleteEntityButton({
  id,
  name,
  type,
}: DeleteEntityButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const endpoint =
    type === "season"
      ? `/api/seasons/${id}`
      : `/api/competitions/${id}`;

  const entityLabel =
    type === "season" ? "Saison" : "Wettbewerb";

  async function handleDelete() {
    const confirmed = window.confirm(
      `Möchtest du ${entityLabel.toLowerCase()} "${name}" wirklich löschen?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `${entityLabel} konnte nicht gelöscht werden.`
        );
      }

      router.refresh();

      setTimeout(() => {
        window.location.reload();
      }, 150);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Beim Löschen ist ein Fehler aufgetreten."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="entity-delete">
      <button
        type="button"
        className="button entity-delete__button"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Löscht..." : "Löschen"}
      </button>

      {error ? (
        <div className="entity-delete__error">
          {error}
        </div>
      ) : null}
    </div>
  );
}
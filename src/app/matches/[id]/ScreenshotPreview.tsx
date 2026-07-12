"use client";

import { useState } from "react";

export function ScreenshotPreview({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          padding: 0,
          border: 0,
          background: "transparent",
          cursor: "pointer",
          width: "100%",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            borderRadius: 12,
            display: "block",
          }}
        />
      </button>

      {isOpen ? (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: "95vw",
              maxHeight: "90vh",
              borderRadius: 16,
            }}
          />
        </div>
      ) : null}
    </>
  );
}
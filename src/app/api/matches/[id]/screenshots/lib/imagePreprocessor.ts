const MAX_WIDTH = 2200;
const UPSCALE_FACTOR = 1.5;

export async function preprocessImage(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Das Screenshot-Bild konnte nicht geladen werden.");
  }

  const sourceBlob = await response.blob();
  const bitmap = await createImageBitmap(sourceBlob);

  try {
    const scale = Math.min(
      UPSCALE_FACTOR,
      MAX_WIDTH / Math.max(bitmap.width, 1)
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("Bildvorverarbeitung wird von diesem Browser nicht unterstützt.");
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const gray = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);
      const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.35 + 128));

      pixels[index] = contrasted;
      pixels[index + 1] = contrasted;
      pixels[index + 2] = contrasted;
    }

    context.putImageData(imageData, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Das vorbereitete Bild konnte nicht erzeugt werden."));
        },
        "image/png",
        1
      );
    });
  } finally {
    bitmap.close();
  }
}

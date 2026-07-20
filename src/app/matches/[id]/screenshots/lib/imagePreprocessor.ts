const MAX_WIDTH = 2200;
const SCALE_FACTOR = 2;

export async function preprocessScreenshot(
  imageUrl: string
): Promise<Blob> {
  const response = await fetch(imageUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Das Bild konnte nicht geladen werden (${response.status}).`
    );
  }

  const sourceBlob = await response.blob();
  const bitmap = await createImageBitmap(sourceBlob);

  const desiredWidth = Math.min(
    Math.round(bitmap.width * SCALE_FACTOR),
    MAX_WIDTH
  );

  const scale = desiredWidth / bitmap.width;
  const desiredHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = desiredWidth;
  canvas.height = desiredHeight;

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    bitmap.close();
    throw new Error("Die Bildverarbeitung konnte nicht gestartet werden.");
  }

  context.drawImage(bitmap, 0, 0, desiredWidth, desiredHeight);
  bitmap.close();

  const imageData = context.getImageData(
    0,
    0,
    desiredWidth,
    desiredHeight
  );

  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    const gray = 0.299 * red + 0.587 * green + 0.114 * blue;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.35 + 128));

    pixels[index] = contrasted;
    pixels[index + 1] = contrasted;
    pixels[index + 2] = contrasted;
  }

  context.putImageData(imageData, 0, 0);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Das vorbereitete Bild konnte nicht erzeugt werden."));
        }
      },
      "image/png",
      1
    );
  });
}

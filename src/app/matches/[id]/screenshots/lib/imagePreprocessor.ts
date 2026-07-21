export async function preprocessOverviewScreenshot(
  imageUrl: string
): Promise<Blob> {
  const image = await loadImage(imageUrl);

  /*
   * Nur der rechte Statistikbereich:
   * Beschriftung + Spielerwert + Teamwert.
   */
  const sourceX = Math.round(image.naturalWidth * 0.66);
  const sourceY = Math.round(image.naturalHeight * 0.15);
  const sourceWidth = Math.round(image.naturalWidth * 0.32);
  const sourceHeight = Math.round(image.naturalHeight * 0.72);

  /*
   * Für bessere OCR vergrößern wir den Ausschnitt.
   */
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth * scale;
  canvas.height = sourceHeight * scale;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas-Kontext konnte nicht erstellt werden.");
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Kontrastreiche Graustufendarstellung.
   */
  const imageData = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index] ?? 0;
    const green = pixels[index + 1] ?? 0;
    const blue = pixels[index + 2] ?? 0;

    const gray = Math.round(
      red * 0.299 +
      green * 0.587 +
      blue * 0.114
    );

    /*
     * Helle Schrift weiß, Hintergrund schwarz.
     */
    const value = gray >= 115 ? 255 : 0;

    pixels[index] = value;
    pixels[index + 1] = value;
    pixels[index + 2] = value;
  }

  context.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Der Screenshot-Ausschnitt konnte nicht erzeugt werden."
            )
          );
          return;
        }

        resolve(blob);
      },
      "image/png",
      1
    );
  });
}

function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Der Screenshot konnte nicht geladen werden."));

    image.src = imageUrl;
  });
}
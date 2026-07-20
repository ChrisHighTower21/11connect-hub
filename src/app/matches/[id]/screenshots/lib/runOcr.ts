import { createWorker } from "tesseract.js";
import { preprocessScreenshot } from "./imagePreprocessor";

type ProgressUpdate = {
  status: string;
  progress: number;
};

type OcrResult = {
  text: string;
  confidence: number;
};

export async function runScreenshotOcr(
  imageUrl: string,
  onProgress?: (update: ProgressUpdate) => void
): Promise<OcrResult> {
  onProgress?.({
    status: "Bild wird vorbereitet …",
    progress: 5,
  });

  const preparedImage = await preprocessScreenshot(imageUrl);
  const objectUrl = URL.createObjectURL(preparedImage);

  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

  try {
    worker = await createWorker("deu+eng", 1, {
      logger(message) {
        const nextProgress =
          typeof message.progress === "number"
            ? Math.max(10, Math.round(message.progress * 100))
            : 10;

        onProgress?.({
          status: message.status || "Texterkennung läuft …",
          progress: nextProgress,
        });
      },
    });

    const result = await worker.recognize(objectUrl);

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);

    if (worker) {
      await worker.terminate();
    }
  }
}

import { createWorker, PSM } from "tesseract.js";
import { preprocessImage } from "./imagePreprocessor";

export type OcrProgress = {
  status: string;
  progress: number;
};

export type OcrResult = {
  text: string;
  confidence: number;
};

export async function runScreenshotOcr(
  imageUrl: string,
  onProgress: (progress: OcrProgress) => void
): Promise<OcrResult> {
  const preparedImage = await preprocessImage(imageUrl);
  const objectUrl = URL.createObjectURL(preparedImage);

  const worker = await createWorker(["deu", "eng"], 1, {
    logger(message) {
      onProgress({
        status: message.status ?? "OCR läuft",
        progress:
          typeof message.progress === "number"
            ? Math.round(message.progress * 100)
            : 0,
      });
    },
  });

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: "1",
    });

    const result = await worker.recognize(objectUrl);

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
    await worker.terminate();
  }
}

export type ScreenshotAnalysisView = {
  id?: string;
  rawText: string | null;
  createdAt?: Date | string;
};

export type MatchScreenshotView = {
  id: string;
  fileName: string;
  filePath: string;
  category: string;
  createdAt: Date | string;
  analyses: ScreenshotAnalysisView[];
};

export type ScreenshotAnalysisView = {
  rawText: string;
};

export type MatchScreenshotView = {
  id: string;
  fileName: string;
  category: string;
  createdAt: Date;
  analyses: ScreenshotAnalysisView[];
};

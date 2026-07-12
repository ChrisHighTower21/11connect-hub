-- CreateTable
CREATE TABLE "ScreenshotAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screenshotId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScreenshotAnalysis_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "MatchScreenshot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

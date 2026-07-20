/*
  Warnings:

  - Added the required column `updatedAt` to the `MatchScreenshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ScreenshotAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScreenshotAnalysis" DROP CONSTRAINT "ScreenshotAnalysis_screenshotId_fkey";

-- AlterTable
ALTER TABLE "MatchScreenshot" ADD COLUMN     "playerId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'PLAYER_STATS';

-- AlterTable
ALTER TABLE "ScreenshotAnalysis" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "structuredData" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "rawText" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MatchScreenshot_matchId_idx" ON "MatchScreenshot"("matchId");

-- CreateIndex
CREATE INDEX "MatchScreenshot_playerId_idx" ON "MatchScreenshot"("playerId");

-- CreateIndex
CREATE INDEX "ScreenshotAnalysis_screenshotId_idx" ON "ScreenshotAnalysis"("screenshotId");

-- AddForeignKey
ALTER TABLE "MatchScreenshot" ADD CONSTRAINT "MatchScreenshot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenshotAnalysis" ADD CONSTRAINT "ScreenshotAnalysis_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "MatchScreenshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

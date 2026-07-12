-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eaId" TEXT,
    "mainPosition" TEXT,
    "secondaryPosition" TEXT,
    "discordName" TEXT,
    "joinedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "eafcCycle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "opponent" TEXT NOT NULL,
    "homeAway" TEXT NOT NULL,
    "matchday" TEXT,
    "teamGoals" INTEGER NOT NULL,
    "opponentGoals" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSquad" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchSquad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMatchStat" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "position" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "isPotm" BOOLEAN NOT NULL DEFAULT false,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shotAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shotsOnTarget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passes" INTEGER NOT NULL DEFAULT 0,
    "passAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "successfulPasses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dribbles" INTEGER NOT NULL DEFAULT 0,
    "dribbleSuccessRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "successfulDribbles" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duels" INTEGER NOT NULL DEFAULT 0,
    "duelSuccessRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "successfulDuels" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "offsides" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "possessionWon" INTEGER NOT NULL DEFAULT 0,
    "possessionLost" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "distanceKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sprintDistanceKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerMatchStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScreenshot" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'OVERVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreenshotAnalysis" (
    "id" TEXT NOT NULL,
    "screenshotId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreenshotAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchSquad_matchId_playerId_key" ON "MatchSquad"("matchId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatchStat_matchId_playerId_key" ON "PlayerMatchStat"("matchId", "playerId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSquad" ADD CONSTRAINT "MatchSquad_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSquad" ADD CONSTRAINT "MatchSquad_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScreenshot" ADD CONSTRAINT "MatchScreenshot_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenshotAnalysis" ADD CONSTRAINT "ScreenshotAnalysis_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "MatchScreenshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

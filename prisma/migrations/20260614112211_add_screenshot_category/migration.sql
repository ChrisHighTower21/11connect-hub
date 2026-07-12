-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatchScreenshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'OVERVIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchScreenshot_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MatchScreenshot" ("createdAt", "fileName", "filePath", "fileSize", "fileType", "id", "matchId") SELECT "createdAt", "fileName", "filePath", "fileSize", "fileType", "id", "matchId" FROM "MatchScreenshot";
DROP TABLE "MatchScreenshot";
ALTER TABLE "new_MatchScreenshot" RENAME TO "MatchScreenshot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

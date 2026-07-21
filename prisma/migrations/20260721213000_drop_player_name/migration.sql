-- Remove the legacy player name now that the application uses EA-ID everywhere.
ALTER TABLE "Player" DROP COLUMN "name";

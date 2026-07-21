-- AlterTable
ALTER TABLE "Player" ADD COLUMN "shirtNumber" INTEGER;

-- Backfill the numbers that were previously stored in the name field.
UPDATE "Player"
SET "shirtNumber" = CAST("name" AS INTEGER)
WHERE "name" ~ '^[1-9][0-9]?$';

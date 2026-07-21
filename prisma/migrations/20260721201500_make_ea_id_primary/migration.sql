-- Make the EA-ID the sole player identifier used by the application.
ALTER TABLE "Player" ALTER COLUMN "eaId" SET NOT NULL;

CREATE UNIQUE INDEX "Player_eaId_key" ON "Player"("eaId");

-- The legacy name column remains temporarily for a zero-downtime rollout.
ALTER TABLE "Player" ALTER COLUMN "name" SET DEFAULT '';

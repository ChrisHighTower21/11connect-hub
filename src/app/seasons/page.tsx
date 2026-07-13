import { prisma } from "@/lib/db";
import { SeasonManager } from "./SeasonManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SeasonsPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const seasons = await prisma.season.findMany({
    include: {
      competition: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Wettbewerbe & Saisons</h1>
          <p className="page-description">
            EA FC Zyklen, Wettbewerbe und Saisons verwalten.
          </p>
        </div>
      </header>

      <SeasonManager competitions={competitions} seasons={seasons} />
    </>
  );
}
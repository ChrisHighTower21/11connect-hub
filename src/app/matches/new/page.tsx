import { prisma } from "@/lib/db";
import { NewMatchForm } from "./NewMatchForm";

export default async function NewMatchPage() {
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
          <h1 className="page-title">Neues Spiel</h1>
          <p className="page-description">
            Spieldaten erfassen und danach den Kader auswählen.
          </p>
        </div>
      </header>

      <NewMatchForm seasons={seasons} />
    </>
  );
}
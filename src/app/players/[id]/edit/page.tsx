import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditPlayerForm } from "./EditPlayerForm";

type EditPlayerPageProps = {
  params: {
    id: string;
  };
};

export default async function EditPlayerPage({
  params,
}: EditPlayerPageProps) {
  const player = await prisma.player.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!player) {
    notFound();
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Spieler bearbeiten</h1>

          <p className="page-description">
            Stammdaten von {player.eaId} aktualisieren.
          </p>
        </div>
      </header>

      <EditPlayerForm
        player={{
          id: player.id,
          eaId: player.eaId,
          shirtNumber: player.shirtNumber,
          mainPosition: player.mainPosition,
          secondaryPosition: player.secondaryPosition,
          discordName: player.discordName,
          joinedAt: player.joinedAt
            ? player.joinedAt.toISOString().slice(0, 10)
            : "",
          isActive: player.isActive,
        }}
      />
    </>
  );
}

import { FormationEditor } from "@/components/tactics/FormationEditor";

export default function TacticsPage() {
  return (
    <main
      style={{
        display: "grid",
        gap: 24,
      }}
    >
      <header>
        <div className="kpi-label">Taktikzentrum</div>

        <h1 style={{ marginTop: 8 }}>
          Aufstellung
        </h1>

        <p
          className="muted"
          style={{ marginTop: 8 }}
        >
          Erstelle Formationen, ordne Spieler zu und
          bereite deinen Matchplan vor.
        </p>
      </header>

      <FormationEditor />
    </main>
  );
}
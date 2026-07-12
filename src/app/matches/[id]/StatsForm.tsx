"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExistingStat = {
  position: string | null;
  rating: number;
  isPotm: boolean;
  goals: number;
  assists: number;
  shots: number;
  shotAccuracy: number;
  passes: number;
  passAccuracy: number;
  dribbles: number;
  dribbleSuccessRate: number;
  duels: number;
  duelSuccessRate: number;
  offsides: number;
  fouls: number;
  possessionWon: number;
  possessionLost: number;
  minutesPlayed: number;
  distanceKm: number;
  sprintDistanceKm: number;
};

type StatsFormProps = {
  matchId: string;
  player: {
    id: string;
    name: string;
    mainPosition: string | null;
  };
  existingStat?: ExistingStat | null;
};

export function StatsForm({ matchId, player, existingStat }: StatsFormProps) {
  const router = useRouter();

  const hasStats = Boolean(existingStat);

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [rating, setRating] = useState(
    existingStat ? String(existingStat.rating) : ""
  );
  const [isPotm, setIsPotm] = useState(existingStat?.isPotm ?? false);
  const [position, setPosition] = useState(
    existingStat?.position ?? player.mainPosition ?? ""
  );

  const [goals, setGoals] = useState(String(existingStat?.goals ?? 0));
  const [assists, setAssists] = useState(String(existingStat?.assists ?? 0));

  const [shots, setShots] = useState(String(existingStat?.shots ?? 0));
  const [shotAccuracy, setShotAccuracy] = useState(
    String(existingStat?.shotAccuracy ?? 0)
  );

  const [passes, setPasses] = useState(String(existingStat?.passes ?? 0));
  const [passAccuracy, setPassAccuracy] = useState(
    String(existingStat?.passAccuracy ?? 0)
  );

  const [dribbles, setDribbles] = useState(String(existingStat?.dribbles ?? 0));
  const [dribbleSuccessRate, setDribbleSuccessRate] = useState(
    String(existingStat?.dribbleSuccessRate ?? 0)
  );

  const [duels, setDuels] = useState(String(existingStat?.duels ?? 0));
  const [duelSuccessRate, setDuelSuccessRate] = useState(
    String(existingStat?.duelSuccessRate ?? 0)
  );

  const [offsides, setOffsides] = useState(String(existingStat?.offsides ?? 0));
  const [fouls, setFouls] = useState(String(existingStat?.fouls ?? 0));

  const [possessionWon, setPossessionWon] = useState(
    String(existingStat?.possessionWon ?? 0)
  );
  const [possessionLost, setPossessionLost] = useState(
    String(existingStat?.possessionLost ?? 0)
  );

  const [minutesPlayed, setMinutesPlayed] = useState(
    String(existingStat?.minutesPlayed ?? 90)
  );
  const [distanceKm, setDistanceKm] = useState(
    String(existingStat?.distanceKm ?? 0)
  );
  const [sprintDistanceKm, setSprintDistanceKm] = useState(
    String(existingStat?.sprintDistanceKm ?? 0)
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    await fetch(`/api/matches/${matchId}/stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerId: player.id,
        position,
        rating,
        isPotm,
        goals,
        assists,
        shots,
        shotAccuracy,
        passes,
        passAccuracy,
        dribbles,
        dribbleSuccessRate,
        duels,
        duelSuccessRate,
        offsides,
        fouls,
        possessionWon,
        possessionLost,
        minutesPlayed,
        distanceKm,
        sprintDistanceKm,
      }),
    });

    setIsSaving(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
  <div className="card" style={{ marginTop: 12, padding: 0 }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 0.6fr 0.8fr 0.6fr 0.8fr 0.7fr 0.9fr auto",
        gap: 12,
        alignItems: "center",
        padding: "16px 18px",
      }}
    >
      <div>
        <strong>{player.name}</strong>
        <div className="muted">{position || player.mainPosition || "-"}</div>
      </div>

      <div>
        <div className="kpi-label">Pos</div>
        <strong>{position || "-"}</strong>
      </div>

      <div>
        <div className="kpi-label">Bewertung</div>
        <strong>{hasStats ? existingStat?.rating.toFixed(1) : "-"}</strong>
      </div>

      <div>
        <div className="kpi-label">Tore</div>
        <strong>{hasStats ? existingStat?.goals : "-"}</strong>
      </div>

      <div>
        <div className="kpi-label">Vorlagen</div>
        <strong>{hasStats ? existingStat?.assists : "-"}</strong>
      </div>

      <div>
        <div className="kpi-label">POTM</div>
        <strong>{existingStat?.isPotm ? "⭐" : "-"}</strong>
      </div>

      <div>
        <span className={hasStats ? "badge badge-win" : "badge badge-muted"}>
          {hasStats ? "Erfasst" : "Offen"}
        </span>
      </div>

      <button
        className="button button-primary"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? "Schließen" : hasStats ? "Bearbeiten" : "Erfassen"}
      </button>
    </div>

      {isOpen ? (
        <form className="form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <div className="form-row">
            <label>
              Position
              <input
                value={position}
                onChange={(event) => setPosition(event.target.value)}
              />
            </label>

            <label>
              Bewertung
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Player of the Match
            <select
              value={isPotm ? "yes" : "no"}
              onChange={(event) => setIsPotm(event.target.value === "yes")}
            >
              <option value="no">Nein</option>
              <option value="yes">Ja</option>
            </select>
          </label>

          <div className="form-row">
            <label>
              Tore
              <input value={goals} onChange={(e) => setGoals(e.target.value)} />
            </label>
            <label>
              Vorlagen
              <input
                value={assists}
                onChange={(e) => setAssists(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Schüsse
              <input value={shots} onChange={(e) => setShots(e.target.value)} />
            </label>
            <label>
              Schussgenauigkeit %
              <input
                value={shotAccuracy}
                onChange={(e) => setShotAccuracy(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Pässe
              <input
                value={passes}
                onChange={(e) => setPasses(e.target.value)}
              />
            </label>
            <label>
              Passquote %
              <input
                value={passAccuracy}
                onChange={(e) => setPassAccuracy(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Dribblings
              <input
                value={dribbles}
                onChange={(e) => setDribbles(e.target.value)}
              />
            </label>
            <label>
              Dribblingquote %
              <input
                value={dribbleSuccessRate}
                onChange={(e) => setDribbleSuccessRate(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Zweikämpfe
              <input value={duels} onChange={(e) => setDuels(e.target.value)} />
            </label>
            <label>
              Zweikampfquote %
              <input
                value={duelSuccessRate}
                onChange={(e) => setDuelSuccessRate(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Abseits
              <input
                value={offsides}
                onChange={(e) => setOffsides(e.target.value)}
              />
            </label>
            <label>
              Fouls
              <input value={fouls} onChange={(e) => setFouls(e.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Ballbesitz erobert
              <input
                value={possessionWon}
                onChange={(e) => setPossessionWon(e.target.value)}
              />
            </label>
            <label>
              Ballverlust
              <input
                value={possessionLost}
                onChange={(e) => setPossessionLost(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Minuten
              <input
                value={minutesPlayed}
                onChange={(e) => setMinutesPlayed(e.target.value)}
              />
            </label>
            <label>
              Laufweg km
              <input
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
              />
            </label>
          </div>

          <label>
            Sprintdistanz km
            <input
              value={sprintDistanceKm}
              onChange={(e) => setSprintDistanceKm(e.target.value)}
            />
          </label>

          <button className="button button-primary" type="submit">
            {isSaving ? "Speichert..." : "Stats speichern"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
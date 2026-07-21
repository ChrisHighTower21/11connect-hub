export type FormationKey =
  | "4-2-3-1"
  | "4-3-3"
  | "4-4-2"
  | "3-5-2";

export type FormationPosition = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type TacticPlayer = {
  id: string;

  /**
   * Primäre sichtbare Spielerkennung.
   * Danach wird gesucht und sortiert.
   */
  eaId: string;

  position: string | null;
  shirtNumber: number | null;
};

export type FormationAssignments = Record<
  string,
  string | null
>;

export type MatchResult = "WIN" | "DRAW" | "LOSS";
export type MatchStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED";
export type HomeAway = "HOME" | "AWAY";

export type PlayerOverviewStatInput = {
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

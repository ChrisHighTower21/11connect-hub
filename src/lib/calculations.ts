export function calculateMatchResult(teamGoals: number, opponentGoals: number) {
  if (teamGoals > opponentGoals) return "WIN";
  if (teamGoals < opponentGoals) return "LOSS";
  return "DRAW";
}

export function calculateSuccessfulValue(total: number, percentage: number) {
  if (!Number.isFinite(total) || !Number.isFinite(percentage)) return 0;
  return Number(((total * percentage) / 100).toFixed(2));
}

export function calculateWeightedPercentage(successful: number, total: number) {
  if (total <= 0) return 0;
  return Number(((successful / total) * 100).toFixed(2));
}

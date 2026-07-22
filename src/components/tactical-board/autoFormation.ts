import type { TacticPlayer } from "@/components/tactics/types";

type FormationSlot = {
  position: string;
};

const compatiblePositionFamilies: ReadonlyArray<ReadonlyArray<string>> = [
  ["IV", "LIV", "RIV"],
  ["ZDM", "LDM", "RDM"],
  ["ZM", "LZM", "RZM"],
  ["ST", "LS", "RS"],
];

export function assignPlayersToFormation(
  players: TacticPlayer[],
  slots: readonly FormationSlot[]
) {
  type AssignmentState = {
    score: number;
    slotToPlayer: Array<number | null>;
  };

  let states = new Map<number, AssignmentState>([
    [0, { score: 0, slotToPlayer: slots.map(() => null) }],
  ]);

  players.forEach((player, playerIndex) => {
    const nextStates = new Map(states);

    for (const [mask, state] of states) {
      slots.forEach((slot, slotIndex) => {
        const slotBit = 1 << slotIndex;
        if ((mask & slotBit) !== 0) return;

        const matchScore = playerPositionScore(player, slot.position);
        if (matchScore === 0) return;

        const nextMask = mask | slotBit;
        const nextScore = state.score + matchScore;
        const existing = nextStates.get(nextMask);
        if (existing && existing.score >= nextScore) return;

        const slotToPlayer = [...state.slotToPlayer];
        slotToPlayer[slotIndex] = playerIndex;
        nextStates.set(nextMask, { score: nextScore, slotToPlayer });
      });
    }

    states = nextStates;
  });

  let bestMask = 0;
  let bestState = states.get(0)!;
  for (const [mask, state] of states) {
    const assignedCount = countSetBits(mask);
    const bestAssignedCount = countSetBits(bestMask);
    if (
      assignedCount > bestAssignedCount ||
      (assignedCount === bestAssignedCount && state.score > bestState.score)
    ) {
      bestMask = mask;
      bestState = state;
    }
  }

  return bestState.slotToPlayer.map((playerIndex) =>
    playerIndex === null ? null : players[playerIndex]
  );
}

function countSetBits(value: number) {
  let count = 0;
  let remaining = value;
  while (remaining > 0) {
    count += remaining & 1;
    remaining >>>= 1;
  }
  return count;
}

function playerPositionScore(player: TacticPlayer, targetPosition: string) {
  const mainMatch = positionMatchQuality(player.position, targetPosition);
  const secondaryMatch = positionMatchQuality(
    player.secondaryPosition,
    targetPosition
  );

  if (mainMatch === 2) return 4;
  if (secondaryMatch === 2) return 3;
  if (mainMatch === 1) return 2;
  if (secondaryMatch === 1) return 1;
  return 0;
}

function positionMatchQuality(
  playerPosition: string | null | undefined,
  targetPosition: string
) {
  const player = normalizePosition(playerPosition);
  const target = normalizePosition(targetPosition);
  if (!player || !target) return 0;
  if (player === target) return 2;

  return compatiblePositionFamilies.some(
    (family) => family.includes(player) && family.includes(target)
  )
    ? 1
    : 0;
}

function normalizePosition(position: string | null | undefined) {
  return position?.trim().toUpperCase() ?? "";
}

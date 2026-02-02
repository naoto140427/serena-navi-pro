/**
 * Generates a stable pseudo-random distance string based on a seed string (e.g., waypoint ID).
 * This ensures that the displayed distance remains constant for the same waypoint across renders.
 *
 * @param id - The unique identifier to seed the random number generator.
 * @param isNext - Boolean indicating if this is the next waypoint (affects the range).
 * @returns A formatted distance string.
 */
export const getStableDistance = (id: string, isNext: boolean): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Normalize to 0-1
  const normalized = (Math.abs(hash) % 100) / 100;

  if (isNext) {
    // Range: 2.0 - 12.0 (approx) to match original (Math.random() * 10 + 2)
    return (normalized * 10 + 2).toFixed(1);
  } else {
    // Range: 15 - 45 (approx) to match original (Math.random() * 30 + 15)
    return (normalized * 30 + 15).toFixed(0);
  }
};

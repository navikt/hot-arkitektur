/** Rene hjelpefunksjoner for tastaturnavigasjon i diagrammer (roving tabindex). Ingen importer, så filen kan kjøres direkte i node. */
export interface NavItem {
  id: string;
  /** Midtpunkt i diagrammets koordinater. */
  x: number;
  y: number;
}

export type Direction = "left" | "right" | "up" | "down";

const DIRECTION_KEYS: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export const directionOf = (key: string): Direction | undefined => DIRECTION_KEYS[key];

/** Leserekkefølge: øverst først, deretter fra venstre. Rader på omtrent samme høyde regnes som én rad. */
export function readingOrder<T extends NavItem>(items: readonly T[], rowTolerance = 12): T[] {
  return [...items].sort((a, b) => (Math.abs(a.y - b.y) <= rowTolerance ? a.x - b.x : a.y - b.y));
}

/**
 * Nærmeste element i piltastretningen. Elementet må ligge foran i retningen,
 * og avvik på tvers veier tyngre enn avstand langs retningen. Returnerer `null` når ingenting ligger i retningen.
 */
export function nearestInDirection<T extends NavItem>(
  items: readonly T[],
  currentId: string,
  direction: Direction,
): T | null {
  const current = items.find((item) => item.id === currentId);
  if (!current) return null;
  const horizontal = direction === "left" || direction === "right";
  const sign = direction === "right" || direction === "down" ? 1 : -1;
  let best: T | null = null;
  let bestScore = Infinity;
  for (const item of items) {
    if (item.id === currentId) continue;
    const along = (horizontal ? item.x - current.x : item.y - current.y) * sign;
    if (along <= 0) continue;
    const across = Math.abs(horizontal ? item.y - current.y : item.x - current.x);
    const score = along + across * 2;
    if (score < bestScore || (score === bestScore && best && item.id < best.id)) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}

export type NavResult = { id: string; handled: true } | { id: null; handled: false };

/** Hvilket element som skal få fokus for en tast. `handled` er sann når tasten er en navigasjonstast. */
export function navigate<T extends NavItem>(items: readonly T[], currentId: string, key: string): NavResult {
  if (key === "Home" || key === "End") {
    const ordered = readingOrder(items);
    const target = key === "Home" ? ordered[0] : ordered[ordered.length - 1];
    return target ? { id: target.id, handled: true } : { id: null, handled: false };
  }
  const direction = directionOf(key);
  if (!direction) return { id: null, handled: false };
  const next = nearestInDirection(items, currentId, direction);
  return { id: next ? next.id : currentId, handled: true };
}

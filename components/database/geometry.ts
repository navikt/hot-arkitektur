/** Mål og kolonnevalg som deles av ErDiagram, ruteren og layouttesten. Ingen importer, så filen kan kjøres direkte i node. */
export const BOX_W = 272;
export const HEADER_H = 30;
export const ROW_H = 18;
export const BOX_PAD = 8;

/** Tilstandsfelt som vises i boksen i tillegg til nøkkelkolonnene (samme utvalg som erDiagram() i hotsak-api/docs). */
export const IMPORTANT_COLUMNS: ReadonlySet<string> = new Set([
  "saksstatus",
  "tidsrom",
  "utfall",
  "type",
  "ferdigstilt",
  "midlertidig_ferdigstilt",
  "part_id",
  "navn",
  "adresse",
  "kanal",
]);

export interface ColumnLike {
  name: string;
  keys: readonly string[];
}

export const isShownByDefault = (column: ColumnLike): boolean =>
  column.keys.length > 0 || IMPORTANT_COLUMNS.has(column.name);

/** Kolonnene som vises før brukeren velger «vis alle kolonner». */
export const defaultColumns = <T extends ColumnLike>(columns: readonly T[]): T[] => columns.filter(isShownByDefault);

/** De øvrige kolonnene. De vises under de valgte, så nøkkelradene ligger fast når boksen utvides. */
export const extraColumns = <T extends ColumnLike>(columns: readonly T[]): T[] =>
  columns.filter((column) => !isShownByDefault(column));

export const boxHeight = (rowCount: number): number => HEADER_H + rowCount * ROW_H + BOX_PAD;

export type Point = [number, number];
/** Hvilken side av boksen linjen forlater eller kommer inn på. */
export type Side = "N" | "E" | "S" | "W";

export interface Placement {
  table: string;
  x: number;
  y: number;
}

export interface Box {
  table: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Radene som vises som standard, i rekkefølge. Brukes til å feste linjene ved riktig kolonne. */
  rows: string[];
}

export interface RelationLike {
  child: string;
  parent: string;
  constraint: string;
  columns: string[];
  targetColumns: string[];
}

export interface RoutedEdge {
  id: string;
  child: string;
  parent: string;
  points: Point[];
  childSide: Side;
  parentSide: Side;
  /** Falsk når ruteren ikke fant en vei uten å krysse bokser. */
  clean: boolean;
  /** Midtpunktet på det lengste linjestykket, der etiketten tegnes. */
  label: Point;
}

export function makeBoxes(placements: readonly Placement[], rowsByTable: Record<string, string[]>): Box[] {
  return placements.map(({ table, x, y }) => {
    const rows = rowsByTable[table];
    if (!rows) throw new Error(`Ukjent tabell i layout: ${table}`);
    return { table, x, y, w: BOX_W, h: boxHeight(rows.length), rows };
  });
}

/** Par av bokser som ligger nærmere hverandre enn `gap` piksler. */
export function overlappingBoxes(boxes: readonly Box[], gap = 0): [string, string][] {
  const result: [string, string][] = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap) {
        result.push([a.table, b.table]);
      }
    }
  }
  return result;
}

const SIDES: Side[] = ["N", "E", "S", "W"];
const STEP: Point[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
const BEND_COST = 24;
const SIDE_MARGIN = 26;
const TRACKS = 3;

interface Port {
  x: number;
  y: number;
  out: number;
  cost: number;
}

function rowY(box: Box, column: string): number {
  const index = box.rows.indexOf(column);
  return index >= 0 ? box.y + HEADER_H + index * ROW_H + ROW_H / 2 : box.y + HEADER_H / 2;
}

function portsOf(box: Box, column: string): Port[] {
  const y = rowY(box, column);
  const cx = box.x + box.w / 2;
  return [
    { x: box.x, y, out: 3, cost: 0 },
    { x: box.x + box.w, y, out: 1, cost: 0 },
    ...[-48, 0, 48].flatMap((dx) => [
      { x: cx + dx, y: box.y, out: 0, cost: 14 },
      { x: cx + dx, y: box.y + box.h, out: 2, cost: 14 },
    ]),
  ];
}

class MinHeap {
  private keys: number[] = [];
  private values: number[] = [];
  get size() {
    return this.keys.length;
  }
  push(key: number, value: number) {
    const { keys, values } = this;
    let i = keys.length;
    keys.push(key);
    values.push(value);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (keys[parent] <= key) break;
      keys[i] = keys[parent];
      values[i] = values[parent];
      i = parent;
    }
    keys[i] = key;
    values[i] = value;
  }
  pop(): number {
    const { keys, values } = this;
    const top = values[0];
    const lastKey = keys.pop()!;
    const lastValue = values.pop()!;
    const n = keys.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let child = 2 * i + 1;
        if (child >= n) break;
        if (child + 1 < n && keys[child + 1] < keys[child]) child++;
        if (keys[child] >= lastKey) break;
        keys[i] = keys[child];
        values[i] = values[child];
        i = child;
      }
      keys[i] = lastKey;
      values[i] = lastValue;
    }
    return top;
  }
}

const unique = (values: number[]) => [...new Set(values.map(Math.round))].sort((a, b) => a - b);

/**
 * Ortogonal ruting av FK-linjer. A* over et rutenett av spor langs boksene, med straff for bend og for
 * stykker andre linjer allerede bruker. Linjene krysser aldri en boks, og de starter og slutter vinkelrett
 * på en side, slik at krähefot-symbolene får plass.
 */
export function routeEdges(boxes: readonly Box[], relations: readonly RelationLike[]): RoutedEdge[] {
  const byTable = new Map(boxes.map((box) => [box.table, box]));
  const edges = relations.filter((relation) => byTable.has(relation.child) && byTable.has(relation.parent));

  const endpoints = edges.map((relation) => ({
    relation,
    from: portsOf(byTable.get(relation.child)!, relation.columns[0]),
    to: portsOf(byTable.get(relation.parent)!, relation.targetColumns[0]),
  }));

  const xValues: number[] = [];
  const yValues: number[] = [];
  for (const box of boxes) {
    xValues.push(box.x, box.x + box.w);
    yValues.push(box.y, box.y + box.h);
    for (let k = 0; k < TRACKS; k++) {
      xValues.push(box.x - SIDE_MARGIN - 8 * k, box.x + box.w + SIDE_MARGIN + 8 * k);
    }
    for (let k = 0; k < 2; k++) {
      yValues.push(box.y - SIDE_MARGIN - 8 * k, box.y + box.h + SIDE_MARGIN + 8 * k);
    }
  }
  for (const { from, to } of endpoints) {
    for (const port of [...from, ...to]) {
      xValues.push(port.x);
      yValues.push(port.y);
    }
  }
  const xs = unique(xValues);
  const ys = unique(yValues);
  const nx = xs.length;
  const ny = ys.length;
  const xIndex = new Map(xs.map((value, i) => [value, i]));
  const yIndex = new Map(ys.map((value, i) => [value, i]));
  const vertex = (xi: number, yi: number) => yi * nx + xi;

  // Cachet per spor: boksene som sporet løper gjennom eller langs.
  const columnBoxes = xs.map((x) => boxes.filter((box) => box.x <= x && x <= box.x + box.w));
  const rowBoxes = ys.map((y) => boxes.filter((box) => box.y <= y && y <= box.y + box.h));
  const blockedV = new Int8Array(nx * ny);
  const blockedH = new Int8Array(nx * ny);
  const verticalBlocked = (xi: number, yi: number) => {
    const key = vertex(xi, yi);
    if (!blockedV[key]) {
      const mid = (ys[yi] + ys[yi + 1]) / 2;
      blockedV[key] = columnBoxes[xi].some((box) => box.y < mid && mid < box.y + box.h) ? 1 : -1;
    }
    return blockedV[key] > 0;
  };
  const horizontalBlocked = (xi: number, yi: number) => {
    const key = vertex(xi, yi);
    if (!blockedH[key]) {
      const mid = (xs[xi] + xs[xi + 1]) / 2;
      blockedH[key] = rowBoxes[yi].some((box) => box.x < mid && mid < box.x + box.w) ? 1 : -1;
    }
    return blockedH[key] > 0;
  };

  const usedH = new Uint8Array(nx * ny);
  const usedV = new Uint8Array(nx * ny);
  const results = new Map<number, RoutedEdge>();

  const order = endpoints
    .map((endpoint, index) => {
      const a = byTable.get(endpoint.relation.child)!;
      const b = byTable.get(endpoint.relation.parent)!;
      return { index, span: Math.abs(a.x - b.x) + Math.abs(a.y - b.y) };
    })
    .sort((left, right) => left.span - right.span || left.index - right.index);

  for (const { index } of order) {
    const { relation, from, to } = endpoints[index];
    const id = `${relation.child}.${relation.constraint}`;
    const route = findRoute(from, to);
    results.set(index, buildEdge(id, relation, from, to, route));
  }

  return edges.map((_, index) => results.get(index)!);

  function findRoute(sources: Port[], targets: Port[]): { points: Point[]; from: Port; to: Port } | null {
    const total = nx * ny * 4;
    const best = new Float64Array(total).fill(Infinity);
    const previous = new Int32Array(total).fill(-1);
    const starts = new Map<number, Port>();
    const goals = new Map<number, Port>();
    const heap = new MinHeap();

    const goalPoints = targets.map((port) => {
      const state = vertex(xIndex.get(Math.round(port.x))!, yIndex.get(Math.round(port.y))!) * 4 + ((port.out + 2) % 4);
      goals.set(state, port);
      return port;
    });
    const heuristic = (x: number, y: number) =>
      Math.min(...goalPoints.map((port) => Math.abs(port.x - x) + Math.abs(port.y - y)));

    for (const port of sources) {
      const state = vertex(xIndex.get(Math.round(port.x))!, yIndex.get(Math.round(port.y))!) * 4 + port.out;
      starts.set(state, port);
      best[state] = port.cost;
      heap.push(port.cost + heuristic(port.x, port.y), state);
    }

    let found = -1;
    while (heap.size > 0) {
      const state = heap.pop();
      const dir = state & 3;
      const v = state >> 2;
      const xi = v % nx;
      const yi = (v - xi) / nx;
      const cost = best[state];
      // Siste stykke må komme inn vinkelrett på målboksens side.
      if (goals.has(state)) {
        found = state;
        break;
      }
      for (let nd = 0; nd < 4; nd++) {
        if (nd === ((dir + 2) & 3)) continue;
        if (starts.has(state) && nd !== dir) continue;
        const [dx, dy] = STEP[nd];
        const nxi = xi + dx;
        const nyi = yi + dy;
        if (nxi < 0 || nxi >= nx || nyi < 0 || nyi >= ny) continue;
        const horizontal = dy === 0;
        const segment = horizontal
          ? vertex(Math.min(xi, nxi), yi)
          : vertex(xi, Math.min(yi, nyi));
        if (horizontal ? horizontalBlocked(Math.min(xi, nxi), yi) : verticalBlocked(xi, Math.min(yi, nyi))) continue;
        const length = horizontal ? Math.abs(xs[nxi] - xs[xi]) : Math.abs(ys[nyi] - ys[yi]);
        const shared = horizontal ? usedH[segment] : usedV[segment];
        const crossing = horizontal ? usedV[vertex(nxi, nyi)] : usedH[vertex(nxi, nyi)];
        const next = cost + length + (nd !== dir ? BEND_COST : 0) + (shared ? length * 0.7 + 6 : 0) + (crossing ? 5 : 0);
        const nextState = vertex(nxi, nyi) * 4 + nd;
        if (next < best[nextState]) {
          best[nextState] = next;
          previous[nextState] = state;
          heap.push(next + heuristic(xs[nxi], ys[nyi]), nextState);
        }
      }
    }
    if (found < 0) return null;

    const states: number[] = [];
    for (let state = found; state >= 0; state = previous[state]) states.push(state);
    states.reverse();
    const points: Point[] = states.map((state) => {
      const v = state >> 2;
      const xi = v % nx;
      return [xs[xi], ys[(v - xi) / nx]];
    });
    for (let i = 1; i < states.length; i++) {
      const a = states[i - 1] >> 2;
      const b = states[i] >> 2;
      const ax = a % nx;
      const bx = b % nx;
      const ay = (a - ax) / nx;
      const by = (b - bx) / nx;
      if (ay === by) usedH[vertex(Math.min(ax, bx), ay)] = 1;
      else usedV[vertex(ax, Math.min(ay, by))] = 1;
    }
    return { points, from: starts.get(states[0])!, to: goals.get(found)! };
  }

  function buildEdge(
    id: string,
    relation: RelationLike,
    from: Port[],
    to: Port[],
    route: { points: Point[]; from: Port; to: Port } | null,
  ): RoutedEdge {
    let points: Point[];
    let start: Port;
    let end: Port;
    if (route) {
      points = simplify(route.points);
      start = route.from;
      end = route.to;
    } else {
      start = from[1];
      end = to[3];
      const mid = (start.x + end.x) / 2;
      points = simplify([[start.x, start.y], [mid, start.y], [mid, end.y], [end.x, end.y]]);
    }
    return {
      id,
      child: relation.child,
      parent: relation.parent,
      points,
      childSide: SIDES[start.out],
      parentSide: SIDES[end.out],
      clean: route !== null,
      label: longestMidpoint(points),
    };
  }
}

function simplify(points: Point[]): Point[] {
  const result: Point[] = [];
  for (const point of points) {
    const last = result[result.length - 1];
    if (last && last[0] === point[0] && last[1] === point[1]) continue;
    const before = result[result.length - 2];
    if (last && before && ((before[0] === last[0] && last[0] === point[0]) || (before[1] === last[1] && last[1] === point[1]))) {
      result[result.length - 1] = point;
    } else {
      result.push(point);
    }
  }
  return result;
}

function longestMidpoint(points: Point[]): Point {
  let best: Point = points[0];
  let longest = -1;
  for (let i = 1; i < points.length; i++) {
    const length = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    if (length > longest) {
      longest = length;
      best = [(points[i][0] + points[i - 1][0]) / 2, (points[i][1] + points[i - 1][1]) / 2];
    }
  }
  return best;
}

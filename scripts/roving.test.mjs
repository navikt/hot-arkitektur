import assert from "node:assert/strict";
import test from "node:test";
import { navigate, nearestInDirection, readingOrder } from "../components/domain/roving.ts";

const grid = [
  { id: "a", x: 0, y: 0 },
  { id: "b", x: 100, y: 0 },
  { id: "c", x: 200, y: 4 },
  { id: "d", x: 0, y: 100 },
  { id: "e", x: 110, y: 100 },
];

test("piltast flytter til nærmeste node i retningen", () => {
  assert.equal(nearestInDirection(grid, "a", "right")?.id, "b");
  assert.equal(nearestInDirection(grid, "b", "right")?.id, "c");
  assert.equal(nearestInDirection(grid, "a", "down")?.id, "d");
  assert.equal(nearestInDirection(grid, "e", "up")?.id, "b");
  assert.equal(nearestInDirection(grid, "d", "left"), null);
});

test("avvik på tvers veier tyngre enn avstand langs retningen", () => {
  const items = [
    { id: "from", x: 0, y: 0 },
    { id: "skråt", x: 60, y: 90 },
    { id: "rett", x: 140, y: 0 },
  ];
  assert.equal(nearestInDirection(items, "from", "right")?.id, "rett");
});

test("Home og End går til første og siste i leserekkefølge", () => {
  assert.deepEqual(readingOrder(grid).map((i) => i.id), ["a", "b", "c", "d", "e"]);
  assert.deepEqual(navigate(grid, "b", "Home"), { id: "a", handled: true });
  assert.deepEqual(navigate(grid, "b", "End"), { id: "e", handled: true });
});

test("uten nabo i retningen blir fokus stående, og andre taster ignoreres", () => {
  assert.deepEqual(navigate(grid, "a", "ArrowLeft"), { id: "a", handled: true });
  assert.deepEqual(navigate(grid, "a", "x"), { id: null, handled: false });
  assert.deepEqual(navigate([], "a", "Home"), { id: null, handled: false });
});

import assert from "node:assert/strict";
import test from "node:test";
import { LAYOUTS, VIEW_IDS } from "../components/database/layouts.ts";
import { defaultColumns, makeBoxes, overlappingBoxes, routeEdges } from "../components/database/geometry.ts";
import { columnsOf, relationsAmong, tables } from "../lib/schema.ts";

const qualified = (name) => (name.includes(".") ? name : `public.${name}`);

const rowsByTable = Object.fromEntries(
  tables.map((table) => [table, defaultColumns(columnsOf(table)).map((column) => column.name)]),
);

function boxesOf(view) {
  const placements = LAYOUTS[view].placements.map((placement) => ({ ...placement, table: qualified(placement.table) }));
  return { placements, boxes: makeBoxes(placements, rowsByTable) };
}

for (const view of VIEW_IDS) {
  test(`utsnittet ${view}: tabellene finnes i schema.json og er plassert én gang`, () => {
    const { placements } = boxesOf(view);
    const names = placements.map((placement) => placement.table);
    assert.equal(new Set(names).size, names.length, "en tabell er plassert to ganger");
    for (const name of names) assert.ok(tables.includes(name), `${name} finnes ikke i schema.json`);
    if (view === "alle") {
      assert.deepEqual([...names].sort(), [...tables].sort(), "hele skjemaet skal ha alle tabellene");
    }
  });

  test(`utsnittet ${view}: ingen bokser overlapper og alle ligger innenfor lerretet`, () => {
    const { boxes } = boxesOf(view);
    const { width, height } = LAYOUTS[view];
    assert.deepEqual(overlappingBoxes(boxes, 24), []);
    for (const box of boxes) {
      assert.ok(box.x >= 0 && box.y >= 0, `${box.table} ligger utenfor lerretet`);
      assert.ok(box.x + box.w <= width && box.y + box.h <= height, `${box.table} ligger utenfor lerretet`);
    }
  });

  test(`utsnittet ${view}: alle FK-linjer kan rutes uten å krysse bokser`, () => {
    const { boxes } = boxesOf(view);
    const relations = relationsAmong(boxes.map((box) => box.table));
    const edges = routeEdges(boxes, relations);
    assert.equal(edges.length, relations.length);
    assert.deepEqual(
      edges.filter((edge) => !edge.clean).map((edge) => edge.id),
      [],
    );
  });
}

test("gruppene i hele skjemaet omslutter boksene sine og overlapper ikke", () => {
  const { groups } = LAYOUTS.alle;
  const { boxes } = boxesOf("alle");
  for (const box of boxes) {
    const inside = groups.some(
      (g) => box.x >= g.x && box.y >= g.y && box.x + box.w <= g.x + g.w && box.y + box.h <= g.y + g.h,
    );
    assert.ok(inside, `${box.table} ligger ikke i en gruppe`);
  }
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const a = groups[i];
      const b = groups[j];
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!overlap, `${a.label} og ${b.label} overlapper`);
    }
  }
});

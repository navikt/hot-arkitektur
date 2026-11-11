import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import * as d from "../components/domain/data.ts";

const sets = [
  { name: "domain", nodes: d.DOMAIN_NODES, edges: d.DOMAIN_EDGES, view: d.DOMAIN_VIEW, kinds: d.DOMAIN_KINDS },
  { name: "context", nodes: d.CONTEXT_NODES, edges: d.CONTEXT_EDGES, view: d.CONTEXT_VIEW, kinds: d.CONTEXT_KINDS },
  { name: "today", nodes: d.TODAY_NODES, edges: d.TODAY_EDGES, view: d.PROPOSAL_VIEW, kinds: d.PROPOSAL_KINDS },
  { name: "proposal", nodes: d.PROPOSAL_NODES, edges: d.PROPOSAL_EDGES, view: d.PROPOSAL_VIEW, kinds: d.PROPOSAL_KINDS },
];

const onBorder = (n, [x, y]) => {
  const inX = x >= n.x - 0.5 && x <= n.x + n.w + 0.5;
  const inY = y >= n.y - 0.5 && y <= n.y + n.h + 0.5;
  return (inX && inY) && (Math.abs(x - n.x) < 0.5 || Math.abs(x - n.x - n.w) < 0.5 || Math.abs(y - n.y) < 0.5 || Math.abs(y - n.y - n.h) < 0.5);
};

for (const set of sets) {
  test(`${set.name}: kanter peker på noder og ligger på boksenes kant`, () => {
    const byId = new Map(set.nodes.map((n) => [n.id, n]));
    assert.equal(byId.size, set.nodes.length, "unike node-id-er");
    for (const e of set.edges) {
      assert.ok(byId.has(e.from) && byId.has(e.to), e.id);
      assert.ok(set.kinds.some((k) => k.id === e.kind), e.id);
      assert.ok(onBorder(byId.get(e.from), e.pts[0]), `${e.id}: start`);
      assert.ok(onBorder(byId.get(e.to), e.pts.at(-1)), `${e.id}: slutt`);
    }
  });

  test(`${set.name}: ingen overlappende bokser og alt innenfor viewBox`, () => {
    for (const n of set.nodes) {
      assert.ok(n.x >= 0 && n.y >= 0 && n.x + n.w <= set.view.w && n.y + n.h <= set.view.h, n.id);
    }
    for (const [i, a] of set.nodes.entries()) {
      for (const b of set.nodes.slice(i + 1)) {
        const overlap = a.x < b.x + b.w + 8 && b.x < a.x + a.w + 8 && a.y < b.y + b.h + 8 && b.y < a.y + a.h + 8;
        assert.ok(!overlap, `${a.id} og ${b.id} overlapper`);
      }
    }
  });
}

test("alle kildehenvisninger har gyldige linjer", () => {
  for (const [name, ref] of Object.entries(d.S)) {
    if (ref.line && ref.end) assert.ok(ref.end >= ref.line, name);
  }
});

const root = process.env.HOTSAK_API_DIR;
test("kildehenvisninger finnes i hotsak-api", { skip: !root || !existsSync(root) }, () => {
  const base = {
    app: "app/src/main/kotlin/no/nav/hjelpemidler/saksbehandling/",
    core: "core/src/main/kotlin/no/nav/hjelpemidler/saksbehandling/core/",
    migrations: "app/src/main/resources/db/migration/",
    root: "",
  };
  for (const [name, ref] of Object.entries(d.S)) {
    const lines = readFileSync(join(root, base[ref.base] + ref.file), "utf8").split("\n").length;
    assert.ok((ref.end ?? ref.line ?? 1) <= lines, `${name} utenfor filen`);
  }
});

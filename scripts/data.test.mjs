import assert from "node:assert/strict";
import test from "node:test";
import { columnsOf, relations, schema, tables } from "../lib/schema.ts";
import { revision, sourceUrl } from "../lib/sources.ts";

test("schema.json er konsistent", () => {
  assert.ok(tables.length > 0);
  const columns = new Set(schema.columns.map((c) => `${c.schema}.${c.table_name}.${c.name}`));
  const known = new Set(tables);
  for (const constraint of schema.constraints.filter((c) => c.type === "p" || c.type === "f")) {
    const table = `${constraint.schema}.${constraint.table_name}`;
    for (const name of constraint.columns) {
      assert.ok(columns.has(`${table}.${name}`), `${constraint.name}: kolonnen ${table}.${name} mangler`);
    }
    if (constraint.type === "f") {
      const target = `${constraint.target_schema}.${constraint.target_table}`;
      assert.ok(known.has(target), `${constraint.name}: måltabellen ${target} mangler`);
      for (const name of constraint.target_columns) {
        assert.ok(columns.has(`${target}.${name}`), `${constraint.name}: målkolonnen ${target}.${name} mangler`);
      }
    }
  }
});

test("hjelpere gir nøkler og relasjoner", () => {
  assert.equal(relations().length, schema.constraints.filter((c) => c.type === "f").length);
  assert.ok(tables.every((table) => columnsOf(table).length > 0));
  assert.ok(tables.some((table) => columnsOf(table).some((column) => column.keys.includes("PK"))));
});

test("revisjonen er en commit-hash", () => {
  assert.match(revision, /^[0-9a-f]{40}$/);
});

test("sourceUrl bygger lenke til hotsak-api", () => {
  const base = `https://github.com/navikt/hotsak-api/blob/${revision}/app/Sak.kt`;
  assert.equal(sourceUrl("app/Sak.kt"), base);
  assert.equal(sourceUrl("app/Sak.kt", 29), `${base}#L29`);
  assert.equal(sourceUrl("app/Sak.kt", 29, 40), `${base}#L29-L40`);
});

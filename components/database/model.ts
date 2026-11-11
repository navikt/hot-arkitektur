import {
  cardinality,
  columnsOf,
  constraintsOf,
  indexesOf,
  relations,
  relationsAmong,
  schema,
  tables,
} from "@/lib/schema";
import { migrations } from "@/lib/sources";
import type { Tone } from "@/lib/tones";
import { defaultColumns, extraColumns, makeBoxes, routeEdges, type Box, type RoutedEdge } from "./geometry";
import { LAYOUTS, VIEW_IDS, type LayoutGroup, type ViewId } from "./layouts";

export interface ColumnModel {
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: string | null;
  keys: string[];
}

export interface TableModel {
  name: string;
  /** Tabellnavn uten schema. */
  short: string;
  schema: string;
  columns: ColumnModel[];
  constraints: { name: string; type: string; definition: string }[];
  indexes: { name: string; definition: string }[];
  /** Migrasjonsfilen som oppretter tabellen, når filnavnet viser det. */
  migration: string | null;
  incoming: number;
  outgoing: number;
}

export interface BoxModel extends Box {
  tone: Tone;
  archive: boolean;
  /** Kolonner som bare vises når boksen utvides. */
  extra: string[];
}

export interface EdgeModel extends RoutedEdge {
  constraint: string;
  columns: string[];
  targetColumns: string[];
  required: boolean;
  identifying: boolean;
  unique: boolean;
  cardinality: string;
}

export interface ViewModel {
  id: ViewId;
  label: string;
  title: string;
  description: string;
  width: number;
  height: number;
  boxes: BoxModel[];
  groups: LayoutGroup[];
  edges: EdgeModel[];
}

export interface DatabaseModel {
  views: ViewModel[];
  tables: Record<string, TableModel>;
}

const qualified = (name: string) => (name.includes(".") ? name : `public.${name}`);

/** Migrasjonen som oppretter tabellen: filen som er oppkalt etter tabellen, hvis den finnes. */
function migrationFor(short: string): string | null {
  return schema.migrations.find((file) => file.replace(/\.sql$/, "").split("__")[1] === short) ?? null;
}

function tableModel(name: string): TableModel {
  const [schemaName, short] = name.split(".");
  const all = relations();
  return {
    name,
    short,
    schema: schemaName,
    columns: columnsOf(name).map((column) => ({
      name: column.name,
      type: column.type,
      notNull: column.not_null,
      defaultValue: column.default_value,
      keys: column.keys,
    })),
    constraints: constraintsOf(name).map((constraint) => ({
      name: constraint.name,
      type: constraint.type,
      definition: constraint.definition,
    })),
    indexes: indexesOf(name).map((index) => ({ name: index.name, definition: index.definition })),
    migration: migrationFor(short),
    incoming: all.filter((relation) => relation.parent === name).length,
    outgoing: all.filter((relation) => relation.child === name).length,
  };
}

function viewModel(id: ViewId): ViewModel {
  const layout = LAYOUTS[id];
  const placements = layout.placements.map((placement) => ({ ...placement, table: qualified(placement.table) }));
  const rowsByTable = Object.fromEntries(
    placements.map(({ table }) => [table, defaultColumns(columnsOf(table)).map((column) => column.name)]),
  );
  const boxes = makeBoxes(placements, rowsByTable).map((box, index): BoxModel => {
    const group = layout.groups.find(
      (g) => box.x >= g.x && box.x + box.w <= g.x + g.w && box.y >= g.y && box.y + box.h <= g.y + g.h,
    );
    return {
      ...box,
      tone: group?.tone ?? placements[index].tone ?? "neutral",
      archive: box.table.startsWith("arkiv."),
      extra: extraColumns(columnsOf(box.table)).map((column) => column.name),
    };
  });
  const among = relationsAmong(boxes.map((box) => box.table));
  const routed = routeEdges(boxes, among);
  const edges = routed.map((edge, index): EdgeModel => {
    const relation = among[index];
    return {
      ...edge,
      constraint: relation.constraint,
      columns: relation.columns,
      targetColumns: relation.targetColumns,
      required: relation.required,
      identifying: relation.identifying,
      unique: relation.unique,
      cardinality: cardinality(relation),
    };
  });
  return {
    id,
    label: layout.label,
    title: layout.title,
    description: layout.description,
    width: layout.width,
    height: layout.height,
    boxes,
    groups: layout.groups,
    edges,
  };
}

export function buildDatabaseModel(): DatabaseModel {
  return {
    views: VIEW_IDS.map(viewModel),
    tables: Object.fromEntries(tables.map((name) => [name, tableModel(name)])),
  };
}

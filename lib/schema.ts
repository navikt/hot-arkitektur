import schemaJson from "../data/schema.json" with { type: "json" };

export interface Column {
  schema: string;
  table_name: string;
  name: string;
  type: string;
  not_null: boolean;
  default_value: string | null;
}

export interface Constraint {
  schema: string;
  table_name: string;
  name: string;
  /** p = primary key, f = foreign key, u = unique, c = check, x = exclusion */
  type: string;
  definition: string;
  target_schema: string | null;
  target_table: string | null;
  columns: string[];
  target_columns: string[];
}

export interface Index {
  schema: string;
  table_name: string;
  name: string;
  definition: string;
  is_unique: boolean;
  predicate: string | null;
  columns: string[];
}

export interface Adaptation {
  migration: string;
  reason: string;
}

export interface Schema {
  fingerprint: string;
  migrations: string[];
  adaptations: Adaptation[];
  columns: Column[];
  constraints: Constraint[];
  indexes: Index[];
}

export type KeyKind = "PK" | "FK" | "UK";

export interface ColumnInfo extends Column {
  keys: KeyKind[];
}

export interface Relation {
  /** Fullt tabellnavn (schema.tabell) for tabellen som peker. */
  child: string;
  /** Fullt tabellnavn for tabellen det pekes til. */
  parent: string;
  constraint: string;
  columns: string[];
  targetColumns: string[];
  /** Alle FK-kolonnene er not null: forelderen er påkrevd. */
  required: boolean;
  /** FK-kolonnene er (en del av) primærnøkkelen i barnetabellen. */
  identifying: boolean;
  /** Uten delvis indeks finnes en unik indeks på nøyaktig FK-kolonnene: 1:1. */
  unique: boolean;
}

export const schema: Schema = schemaJson as Schema;

export const tableKey = (item: { schema: string; table_name: string }) => `${item.schema}.${item.table_name}`;

export const tables: string[] = [...new Set(schema.columns.map(tableKey))].sort();

const KEY_TYPES: Record<string, KeyKind> = { p: "PK", f: "FK", u: "UK" };

const sameColumns = (left: string[], right: string[]) =>
  left.length === right.length && left.every((column) => right.includes(column));

export function columnsOf(table: string): ColumnInfo[] {
  const constraints = constraintsOf(table);
  return schema.columns
    .filter((column) => tableKey(column) === table)
    .map((column) => ({
      ...column,
      keys: [
        ...new Set(
          constraints
            .filter((constraint) => constraint.columns.includes(column.name))
            .map((constraint) => KEY_TYPES[constraint.type])
            .filter((key): key is KeyKind => Boolean(key)),
        ),
      ],
    }));
}

export function constraintsOf(table: string): Constraint[] {
  return schema.constraints.filter((constraint) => tableKey(constraint) === table);
}

export function indexesOf(table: string): Index[] {
  return schema.indexes.filter((index) => tableKey(index) === table);
}

export function relations(): Relation[] {
  return schema.constraints
    .filter((constraint) => constraint.type === "f")
    .map((fk) => {
      const child = tableKey(fk);
      const parent = `${fk.target_schema}.${fk.target_table}`;
      const childColumns = schema.columns.filter((column) => tableKey(column) === child);
      const required = fk.columns.every((name) =>
        childColumns.some((column) => column.name === name && column.not_null),
      );
      const primaryKey = schema.constraints.find(
        (constraint) => tableKey(constraint) === child && constraint.type === "p",
      );
      const identifying = Boolean(primaryKey && fk.columns.every((name) => primaryKey.columns.includes(name)));
      // Delvise unike indekser garanterer ikke 1:1 for alle rader.
      const unique = schema.indexes.some(
        (index) =>
          tableKey(index) === child && index.is_unique && !index.predicate && sameColumns(index.columns, fk.columns),
      );
      return {
        child,
        parent,
        constraint: fk.name,
        columns: fk.columns,
        targetColumns: fk.target_columns,
        required,
        identifying,
        unique,
      };
    });
}

/** Relasjoner der begge tabellene er i utvalget. */
export function relationsAmong(selected: Iterable<string>): Relation[] {
  const set = new Set(selected);
  return relations().filter((relation) => set.has(relation.child) && set.has(relation.parent));
}

/** Kardinalitet fra forelder til barn, f.eks. "1 til 0..*". */
export function cardinality(relation: Relation): string {
  return `${relation.required ? "1" : "0..1"} til ${relation.unique ? "0..1" : "0..*"}`;
}

export function searchTables(query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return tables;
  return tables.filter((table) => {
    const haystack = [table, ...columnsOf(table).map((column) => column.name)].join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

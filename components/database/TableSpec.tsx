"use client";

import type { ReactNode } from "react";
import { Table } from "@navikt/ds-react";
import { sourceUrl, migrations } from "@/lib/sources";
import type { ColumnModel, TableModel } from "./model";
import styles from "./TableSpec.module.css";

export function ColumnsTable({ table, columns }: { table: string; columns: ColumnModel[] }) {
  return (
    <div className={styles.scroll} tabIndex={0} role="region" aria-label={`Kolonner i ${table}`}>
      <Table size="small" className={styles.table}>
        <caption className={styles.caption}>Kolonner i {table}</caption>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Kolonne</Table.HeaderCell>
            <Table.HeaderCell scope="col">Type</Table.HeaderCell>
            <Table.HeaderCell scope="col">Obligatorisk</Table.HeaderCell>
            <Table.HeaderCell scope="col">Standardverdi</Table.HeaderCell>
            <Table.HeaderCell scope="col">Nøkkel</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {columns.map((column) => (
            <Table.Row key={column.name}>
              <Table.HeaderCell scope="row">
                <code>{column.name}</code>
              </Table.HeaderCell>
              <Table.DataCell>
                <code>{column.type}</code>
              </Table.DataCell>
              <Table.DataCell>{column.notNull ? "Ja" : "Nei"}</Table.DataCell>
              <Table.DataCell>
                <code>{column.defaultValue ?? "Ingen"}</code>
              </Table.DataCell>
              <Table.DataCell>{column.keys.join(", ") || "Ingen"}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export function ConstraintList({ constraints }: { constraints: TableModel["constraints"] }) {
  if (!constraints.length) return <p className={styles.none}>Ingen constraints.</p>;
  return (
    <ul className={styles.defs}>
      {constraints.map((constraint) => (
        <li key={constraint.name}>
          <code>{constraint.name}</code>
          <code className={styles.definition}>{constraint.definition}</code>
        </li>
      ))}
    </ul>
  );
}

export function IndexList({ indexes }: { indexes: TableModel["indexes"] }) {
  if (!indexes.length) return <p className={styles.none}>Ingen indekser.</p>;
  return (
    <ul className={styles.defs}>
      {indexes.map((index) => (
        <li key={index.name}>
          <code className={styles.definition}>{index.definition}</code>
        </li>
      ))}
    </ul>
  );
}

export function MigrationSource({ migration, children }: { migration: string | null; children?: ReactNode }) {
  if (!migration) return <>{children ?? "Ingen egen migrasjonsfil. Tabellen kommer fra baselinen."}</>;
  return (
    <a href={sourceUrl(`${migrations}${migration}`)} data-source-path={`${migrations}${migration}`}>
      {migration}
    </a>
  );
}

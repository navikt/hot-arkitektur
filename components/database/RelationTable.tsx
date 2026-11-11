import { Table } from "@navikt/ds-react";
import type { ViewModel } from "./model";
import styles from "./ErDiagram.module.css";

const short = (table: string) => table.replace(/^public\./, "");

/** Tekstalternativ til diagrammet: alle relasjonene i utsnittet. */
export function RelationTable({ view }: { view: ViewModel }) {
  const tables = view.boxes.map((box) => short(box.table));
  const groups = view.groups.map((group) => ({
    label: group.label,
    tables: view.boxes
      .filter(
        (box) => box.x >= group.x && box.x + box.w <= group.x + group.w && box.y >= group.y && box.y + box.h <= group.y + group.h,
      )
      .map((box) => short(box.table)),
  }));
  return (
    <details className={styles.textAlt}>
      <summary>
        Relasjoner i utsnittet som tekst ({tables.length} tabeller, {view.edges.length} relasjoner)
      </summary>
      <p>
        Tabeller: {tables.map((table, index) => (
          <span key={table}>
            {index > 0 ? ", " : ""}
            <code>{table}</code>
          </span>
        ))}
      </p>
      {groups.length > 0 && (
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`Temagrupper i ${view.title}`}>
          <Table size="small">
            <caption className={styles.srOnly}>Tabeller per temagruppe i utsnittet {view.title}</caption>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">Gruppe</Table.HeaderCell>
                <Table.HeaderCell scope="col">Tabeller</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {groups.map((group) => (
                <Table.Row key={group.label}>
                  <Table.HeaderCell scope="row">{group.label}</Table.HeaderCell>
                  <Table.DataCell>
                    {group.tables.map((table, index) => (
                      <span key={table}>
                        {index > 0 ? ", " : ""}
                        <code>{table}</code>
                      </span>
                    ))}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`Relasjoner i ${view.title}`}>
        <Table size="small" className={styles.relationTable}>
          <caption className={styles.srOnly}>Foreign keys i utsnittet {view.title}</caption>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Fra (FK)</Table.HeaderCell>
              <Table.HeaderCell scope="col">Til</Table.HeaderCell>
              <Table.HeaderCell scope="col">Kardinalitet</Table.HeaderCell>
              <Table.HeaderCell scope="col">Type</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {view.edges.map((edge) => (
              <Table.Row key={edge.id}>
                <Table.HeaderCell scope="row">
                  <code>
                    {short(edge.child)}.{edge.columns.join(", ")}
                  </code>
                </Table.HeaderCell>
                <Table.DataCell>
                  <code>
                    {short(edge.parent)}.{edge.targetColumns.join(", ")}
                  </code>
                </Table.DataCell>
                <Table.DataCell>{edge.cardinality}</Table.DataCell>
                <Table.DataCell>{edge.identifying ? "Identifiserende" : "Vanlig"}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </details>
  );
}

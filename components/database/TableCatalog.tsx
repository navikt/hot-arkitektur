import { Heading } from "@navikt/ds-react";
import type { TableModel } from "./model";
import { ColumnsTable, ConstraintList, IndexList, MigrationSource } from "./TableSpec";
import styles from "./TableCatalog.module.css";

const NAMESPACES = [
  { id: "public", title: "Aktivt skjema (public)" },
  { id: "arkiv", title: "Arkivskjema (arkiv)" },
] as const;

/** Alle tabeller med kolonner, constraints og indekser. Hver tabell er en foldbar blokk med fast anker. */
export function TableCatalog({ tables }: { tables: Record<string, TableModel> }) {
  return (
    <>
      {NAMESPACES.map((namespace) => {
        const members = Object.values(tables).filter((table) => table.schema === namespace.id);
        return (
          <section key={namespace.id} aria-label={`Tabeller i ${namespace.id}`} className={styles.group}>
            <Heading level="3" size="medium">
              {namespace.title} ({members.length})
            </Heading>
            {members.map((table) => (
              <details key={table.name} id={`tabell-${table.name.replace(".", "-")}`} className={styles.table}>
                <summary>
                  <code>{table.name}</code>
                  <span className={styles.meta}>{table.columns.length} kolonner</span>
                </summary>
                <div className={styles.body}>
                  <p className={styles.source}>
                    Kilde: <MigrationSource migration={table.migration}>ingen egen migrasjonsfil</MigrationSource>
                  </p>
                  <ColumnsTable table={table.name} columns={table.columns} />
                  <Heading level="4" size="xsmall">
                    Constraints
                  </Heading>
                  <ConstraintList constraints={table.constraints} />
                  <Heading level="4" size="xsmall">
                    Indekser
                  </Heading>
                  <IndexList indexes={table.indexes} />
                </div>
              </details>
            ))}
          </section>
        );
      })}
    </>
  );
}

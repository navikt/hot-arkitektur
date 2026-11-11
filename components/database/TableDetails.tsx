"use client";

import type { Ref } from "react";
import { Button, Heading, Link } from "@navikt/ds-react";
import { migrations, sourceUrl } from "@/lib/sources";
import type { EdgeModel, TableModel } from "./model";
import { ColumnsTable, ConstraintList, IndexList } from "./TableSpec";
import styles from "./ErDiagram.module.css";

const short = (table: string) => table.replace(/^public\./, "");

function FkList({
  label,
  edges,
  other,
  onSelect,
}: {
  label: string;
  edges: EdgeModel[];
  other: (edge: EdgeModel) => string;
  onSelect: (table: string) => void;
}) {
  return (
    <div>
      <Heading level="4" size="xsmall">
        {label} ({edges.length})
      </Heading>
      {edges.length === 0 ? (
        <p className={styles.none}>Ingen.</p>
      ) : (
        <ul className={styles.fkList}>
          {edges.map((edge) => (
            <li key={edge.id}>
              <Button size="xsmall" variant="tertiary" onClick={() => onSelect(other(edge))}>
                {short(other(edge))}
              </Button>
              <span>
                <code>
                  {short(edge.child)}.{edge.columns.join(", ")}
                </code>{" "}
                → <code>{short(edge.parent)}</code>, {edge.required ? "obligatorisk" : "valgfri"}, {edge.cardinality}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Detaljpanelet for tabellen som er valgt i diagrammet. */
export function TableDetails({
  table,
  edges,
  headingRef,
  onSelect,
  onClose,
  columnToggle,
}: {
  table: TableModel;
  edges: EdgeModel[];
  headingRef: Ref<HTMLHeadingElement>;
  onSelect: (table: string) => void;
  onClose: () => void;
  /** Tastaturalternativ til utvidelsesknappen i diagrammet. */
  columnToggle?: { expanded: boolean; onToggle: () => void };
}) {
  const outgoing = edges.filter((edge) => edge.child === table.name);
  const incoming = edges.filter((edge) => edge.parent === table.name);
  const constraints = table.constraints.filter((constraint) => constraint.type !== "n");
  const path = table.migration ? `${migrations}${table.migration}` : null;

  return (
    <aside className={styles.panel} aria-label={`Detaljer for ${table.name}`}>
      <header className={styles.panelHead}>
        <div>
          <Heading level="3" size="medium" className={styles.panelTitle} tabIndex={-1} ref={headingRef}>
            <code>{table.name}</code>
          </Heading>
          <p className={styles.panelSource}>
            Kilde:{" "}
            {path ? (
              <Link href={sourceUrl(path)} data-source-path={path}>
                {table.migration}
              </Link>
            ) : (
              "ingen egen migrasjonsfil (tabellen kommer fra baselinen)"
            )}
          </p>
        </div>
        <div className={styles.panelActions}>
          {columnToggle && (
            <Button size="small" variant="secondary" onClick={columnToggle.onToggle}>
              {columnToggle.expanded ? "Vis bare nøkkelkolonner i diagrammet" : "Vis alle kolonner i diagrammet"}
            </Button>
          )}
          <Button size="small" variant="tertiary" onClick={onClose}>
            Lukk
          </Button>
        </div>
      </header>
      <div className={styles.fkGrid}>
        <FkList label="Utgående FK-er" edges={outgoing} other={(edge) => edge.parent} onSelect={onSelect} />
        <FkList label="Innkommende FK-er" edges={incoming} other={(edge) => edge.child} onSelect={onSelect} />
      </div>
      <Heading level="4" size="xsmall">
        Kolonner
      </Heading>
      <ColumnsTable table={table.name} columns={table.columns} />
      <Heading level="4" size="xsmall">
        Constraints
      </Heading>
      <ConstraintList constraints={constraints} />
      <Heading level="4" size="xsmall">
        Indekser
      </Heading>
      <IndexList indexes={table.indexes} />
    </aside>
  );
}

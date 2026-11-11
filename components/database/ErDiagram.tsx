"use client";

import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { BodyShort, Button, ToggleGroup } from "@navikt/ds-react";
import { useReducedMotion, useSvgIds } from "@/components/hooks";
import { navigate, readingOrder } from "@/components/domain/roving";
import { onActivate, rounded } from "@/lib/svg";
import { TONE } from "@/lib/tones";
import { useDatabaseModel } from "./DatabaseModelContext";
import { HEADER_H, ROW_H, boxHeight, type Point, type Side } from "./geometry";
import type { ViewId } from "./layouts";
import type { BoxModel, EdgeModel, TableModel, ViewModel } from "./model";
import { RelationTable } from "./RelationTable";
import { TableDetails } from "./TableDetails";
import styles from "./ErDiagram.module.css";

/** Tekst i diagrammet er 12 px, så utsnittet krympes aldri under 100 %. Større utsnitt rulles. */
const MIN_SCALE = 1;
const ZOOM_STEPS = [0.75, 1, 1.5, 2, 3];
const STEP: Record<Side, Point> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
/** Plass til utvidelsesknappen i boksoverskriften. */
const TOGGLE_W = 34;

type Kind = "one" | "zeroOne" | "zeroMany";

const short = (table: string) => table.replace(/^public\./, "");

/** Krähefot-notasjon ved enden av en linje. `side` er siden av boksen linjen treffer. */
function Mark({ at, side, kind }: { at: Point; side: Side; kind: Kind }) {
  const [ux, uy] = STEP[side];
  const nx = -uy;
  const ny = ux;
  const pt = (t: number, n = 0): string => `${at[0] + ux * t + nx * n} ${at[1] + uy * t + ny * n}`;
  const bar = (t: number) => `M ${pt(t, -6)} L ${pt(t, 6)}`;
  const circle = (t: number) => (
    <circle cx={at[0] + ux * t} cy={at[1] + uy * t} r={4} className={styles.markFill} />
  );
  if (kind === "one") return <path d={`${bar(9)} ${bar(15)}`} className={styles.mark} />;
  if (kind === "zeroOne") {
    return (
      <>
        <path d={bar(9)} className={styles.mark} />
        {circle(18)}
      </>
    );
  }
  return (
    <>
      <path d={`M ${pt(13)} L ${pt(0, 7)} M ${pt(13)} L ${pt(0, -7)}`} className={styles.mark} />
      {circle(20)}
    </>
  );
}

const endKinds = (edge: EdgeModel): { parent: Kind; child: Kind } => ({
  parent: edge.required ? "one" : "zeroOne",
  child: edge.unique ? "zeroOne" : "zeroMany",
});

function Legend() {
  const sample = (kind: Kind, dashed = false) => (
    <svg width="64" height="24" viewBox="0 0 64 24" aria-hidden="true" className={styles.legendSvg}>
      <path d="M 0 12 L 64 12" className={dashed ? styles.legendDashed : styles.legendLine} />
      <Mark at={[40, 12]} side="E" kind={kind} />
    </svg>
  );
  return (
    <ul className={styles.legend} aria-label="Tegnforklaring">
      <li>
        <svg width="64" height="24" viewBox="0 0 64 24" aria-hidden="true" className={styles.legendSvg}>
          <path d="M 0 12 L 64 12" className={styles.legendLine} />
        </svg>
        Heltrukket: FK-kolonnene inngår i primærnøkkelen
      </li>
      <li>
        <svg width="64" height="24" viewBox="0 0 64 24" aria-hidden="true" className={styles.legendSvg}>
          <path d="M 0 12 L 64 12" className={styles.legendDashed} />
        </svg>
        Stiplet: vanlig FK
      </li>
      <li>
        {sample("one")}Nøyaktig én (obligatorisk forelder)
      </li>
      <li>
        {sample("zeroOne")}Null eller én
      </li>
      <li>
        {sample("zeroMany")}Null eller flere
      </li>
      <li>
        <span className={styles.keyTag}>PK</span>
        <span className={styles.keyTag}>FK</span>
        <span className={styles.keyTag}>UK</span>
        Primærnøkkel, fremmednøkkel, unik
      </li>
      <li>
        <span className={`${styles.swatch} ${styles.swatchSelected}`} aria-hidden="true" />
        Valgt tabell: dobbel ramme
      </li>
      <li>
        <span className={`${styles.swatch} ${styles.swatchDim}`} aria-hidden="true" />
        Dempet tabell: ikke koblet til valgt tabell
      </li>
      <li className={styles.keyboardHelp}>
        <span className={styles.keyTag}>Tab</span>
        går inn i diagrammet. Piltaster flytter mellom tabeller, Home og End til første og siste, Enter eller mellomrom
        velger, Escape fjerner valget.
        <span className={styles.keyTag}>K</span>
        viser alle kolonner i tabellen som har fokus.
      </li>
    </ul>
  );
}

interface Props {
  /** Utsnittet diagrammet starter med. Brukeren kan bytte. */
  initialView: ViewId;
}

export function ErDiagram({ initialView }: Props) {
  const model = useDatabaseModel();
  const ids = useSvgIds();
  const reduced = useReducedMotion();
  const [viewId, setViewId] = useState<ViewId>(initialView);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focusVisibleTable, setFocusVisibleTable] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [zoomIndex, setZoomIndex] = useState(1);
  const targetRefs = useRef(new Map<string, SVGRectElement>());
  const headingRef = useRef<HTMLHeadingElement>(null);

  const view = model.views.find((candidate) => candidate.id === viewId)!;
  const zoom = ZOOM_STEPS[zoomIndex];
  const allEdges = model.views.find((candidate) => candidate.id === "alle")!.edges;

  const boxHeightOf = (box: BoxModel) => boxHeight(box.rows.length + (expanded.has(box.table) ? box.extra.length : 0));

  const extent = useMemo(() => {
    let minX = 0;
    let minY = 0;
    let maxX = view.width;
    let maxY = view.height;
    for (const edge of view.edges) {
      for (const [x, y] of edge.points) {
        minX = Math.min(minX, x - 16);
        minY = Math.min(minY, y - 16);
        maxX = Math.max(maxX, x + 16);
        maxY = Math.max(maxY, y + 16);
      }
    }
    for (const box of view.boxes) {
      const height = box.h + (expanded.has(box.table) ? box.extra.length * ROW_H : 0);
      maxY = Math.max(maxY, box.y + height + 24);
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [view, expanded]);

  const focus = selected ?? hovered;
  const neighbours = useMemo(() => {
    const set = new Set<string>();
    if (!selected) return set;
    set.add(selected);
    for (const edge of view.edges) {
      if (edge.child === selected) set.add(edge.parent);
      if (edge.parent === selected) set.add(edge.child);
    }
    return set;
  }, [selected, view]);

  const navItems = view.boxes.map((box) => ({
    id: box.table,
    x: box.x + box.w / 2,
    y: box.y + boxHeightOf(box) / 2,
  }));
  const tabTable =
    activeTable && view.boxes.some((box) => box.table === activeTable)
      ? activeTable
      : (readingOrder(navItems)[0]?.id ?? null);

  const touchesFocus = (edge: EdgeModel) => focus !== null && (edge.child === focus || edge.parent === focus);

  const focusTable = (table: string | null) => {
    if (table) targetRefs.current.get(table)?.focus();
  };

  const selectTable = (table: string | null) => {
    if (table && !view.boxes.some((box) => box.table === table)) setViewId("alle");
    setSelected(table);
    if (table) setActiveTable(table);
  };

  const changeView = (next: ViewId) => {
    setViewId(next);
    const nextView = model.views.find((candidate) => candidate.id === next)!;
    if (selected && !nextView.boxes.some((box) => box.table === selected)) setSelected(null);
    setHovered(null);
    setHoveredEdge(null);
  };

  const toggleExpanded = (table: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(table)) next.add(table);
      return next;
    });

  const clearSelection = () => {
    const previous = selected;
    setSelected(null);
    focusTable(previous);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && selected) {
      setSelected(null);
      event.stopPropagation();
    }
  };

  const onBoxKeyDown = (event: KeyboardEvent, box: BoxModel) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "k" || event.key === "K") {
      if (box.extra.length > 0) {
        event.preventDefault();
        toggleExpanded(box.table);
      }
      return;
    }
    const result = navigate(navItems, box.table, event.key);
    if (result.handled) {
      event.preventDefault();
      setActiveTable(result.id);
      focusTable(result.id);
      return;
    }
    onActivate(() => setSelected(selected === box.table ? null : box.table))(event);
  };

  // Utvidede bokser og den valgte tegnes sist, så de ligger over de andre.
  // Fokuserbare mål ligger i et eget lag i fast rekkefølge, så fokus ikke mistes når tegnerekkefølgen endres.
  const drawOrder = [...view.boxes].sort(
    (a, b) =>
      Number(expanded.has(a.table) || a.table === selected) - Number(expanded.has(b.table) || b.table === selected),
  );

  const selectedTable: TableModel | null = selected ? model.tables[selected] : null;
  const selectedBox = selected ? view.boxes.find((box) => box.table === selected) : undefined;
  const showAllLabels = view.id !== "alle";
  const skipTarget = ids.id("etter");

  return (
    <div className={styles.root} onKeyDown={onKeyDown}>
      <div className={styles.toolbar}>
        <ToggleGroup size="small" value={viewId} onChange={(value) => changeView(value as ViewId)} label="Utsnitt">
          {model.views.map((candidate) => (
            <ToggleGroup.Item key={candidate.id} value={candidate.id} label={candidate.label} />
          ))}
        </ToggleGroup>
        <div className={styles.zoom} role="group" aria-label="Zoom">
          <Button
            size="small"
            variant="secondary"
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
            aria-disabled={zoomIndex === 0}
            className={styles.zoomButton}
            aria-label="Zoom ut"
          >
            −
          </Button>
          <BodyShort size="small" aria-live="polite" className={styles.zoomValue}>
            {Math.round(zoom * 100)} %
          </BodyShort>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))}
            aria-disabled={zoomIndex === ZOOM_STEPS.length - 1}
            className={styles.zoomButton}
            aria-label="Zoom inn"
          >
            +
          </Button>
        </div>
        {!selected && (
          <BodyShort size="small" className={styles.status}>
            Velg en tabell for å se relasjonene.
          </BodyShort>
        )}
        <div role="status" className={styles.selectedStatus}>
          {selected && (
            <>
              <span>Valgt: {short(selected)}. Detaljer under diagrammet.</span>
              <Button size="xsmall" variant="secondary" onClick={() => headingRef.current?.focus()}>
                Gå til detaljer
              </Button>
            </>
          )}
        </div>
        {selected && (
          <Button size="xsmall" variant="tertiary" onClick={clearSelection}>
            Fjern valg
          </Button>
        )}
      </div>

      <Legend />

      <a
        href={`#${skipTarget}`}
        className={styles.skip}
        onClick={(event) => {
          event.preventDefault();
          document.getElementById(skipTarget)?.focus();
        }}
      >
        Hopp forbi diagrammet
      </a>
      <figure className={`portal-diagram ${styles.frame}`}>
        <div
          className={`${styles.scroller} ${view.id === "alle" ? styles.scrollerTall : ""}`}
          role="region"
          aria-label={`Rullbart område: ${view.title}`}
        >
          <svg
            viewBox={`${extent.x} ${extent.y} ${extent.w} ${extent.h}`}
            style={
              {
                width: `${zoom * 100}%`,
                minWidth: `${Math.round(extent.w * MIN_SCALE * zoom)}px`,
              } as CSSProperties
            }
            role="group"
            aria-labelledby={ids.id("title")}
            aria-describedby={ids.id("desc")}
            className={reduced ? `${styles.svg} ${styles.still}` : styles.svg}
          >
            <title id={ids.id("title")}>{view.title}</title>
            <desc id={ids.id("desc")}>
              {`Interaktivt ER-diagram med ${view.boxes.length} tabeller og ${view.edges.length} relasjoner. Piltaster flytter mellom tabeller, Enter eller mellomrom velger, K viser alle kolonner, Escape fjerner valget. Alle tabeller, grupper og relasjoner står som tekst under diagrammet.`}
            </desc>
            <defs>
              <pattern id={ids.id("hatch")} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" className={styles.hatch} />
              </pattern>
            </defs>

            <rect
              x={extent.x}
              y={extent.y}
              width={extent.w}
              height={extent.h}
              className={styles.background}
              onClick={() => setSelected(null)}
            />

            {view.groups.map((group) => {
              const tone = TONE[group.tone];
              return (
                <g key={group.label} aria-hidden="true">
                  <rect
                    x={group.x}
                    y={group.y}
                    width={group.w}
                    height={group.h}
                    rx={14}
                    className={styles.group}
                    style={{ fill: tone.fill, stroke: tone.strokeSubtle }}
                  />
                  <text x={group.x + 16} y={group.y + 24} className={styles.groupLabel}>
                    {group.label}
                  </text>
                </g>
              );
            })}

            <g>
              {view.edges.map((edge) => {
                const active = touchesFocus(edge);
                const dimmed = selected !== null && !active;
                const isHovered = hoveredEdge === edge.id;
                const kinds = endKinds(edge);
                const start = edge.points[0];
                const end = edge.points[edge.points.length - 1];
                const label = edge.columns.join(", ");
                const showLabel = !edge.clean || (showAllLabels ? !dimmed : active || isHovered);
                const classes = [
                  styles.edge,
                  edge.identifying ? styles.identifying : styles.plain,
                  active || isHovered ? styles.edgeActive : "",
                  dimmed ? styles.edgeDim : "",
                  view.id === "alle" && !active && !isHovered ? styles.edgeQuiet : "",
                  !edge.clean ? styles.edgeUnrouted : "",
                ].join(" ");
                return (
                  <g
                    key={edge.id}
                    className={classes}
                    onMouseEnter={() => setHoveredEdge(edge.id)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  >
                    <title>{`${short(edge.child)}.${label} → ${short(edge.parent)}.${edge.targetColumns.join(", ")}${edge.clean ? "" : " (linjen er ikke rutet uten kryssing)"}`}</title>
                    <path d={rounded(edge.points, 10)} className={styles.hit} />
                    <path d={rounded(edge.points, 10)} className={styles.line} />
                    <Mark at={start} side={edge.childSide} kind={kinds.child} />
                    <Mark at={end} side={edge.parentSide} kind={kinds.parent} />
                    {showLabel && (
                      <text x={edge.label[0]} y={edge.label[1]} className={styles.edgeLabel} textAnchor="middle" dy="-4">
                        {edge.clean ? label : `${label} (ikke rutet)`}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            <g aria-hidden="true">
              {drawOrder.map((box) => {
                const info = model.tables[box.table];
                const tone = TONE[box.tone];
                const isExpanded = expanded.has(box.table);
                const isSelected = selected === box.table;
                const dimmed = selected !== null && !neighbours.has(box.table);
                const height = boxHeightOf(box);
                const rows = isExpanded ? [...box.rows, ...box.extra] : box.rows;
                const columnByName = new Map(info.columns.map((column) => [column.name, column]));
                const headerPath = `M ${box.x} ${box.y + HEADER_H} V ${box.y + 8} Q ${box.x} ${box.y} ${box.x + 8} ${box.y} H ${box.x + box.w - 8} Q ${box.x + box.w} ${box.y} ${box.x + box.w} ${box.y + 8} V ${box.y + HEADER_H} Z`;
                const nameWidth = box.w - 10 - (box.extra.length ? TOGGLE_W : 10);
                const nameChars = info.short.length + (box.archive ? "arkiv.".length : 0);
                return (
                  <g
                    key={box.table}
                    className={[
                      styles.box,
                      dimmed ? styles.boxDim : "",
                      isSelected ? styles.boxSelected : "",
                      focusVisibleTable === box.table ? styles.boxFocus : "",
                    ].join(" ")}
                    onMouseEnter={() => setHovered(box.table)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {isSelected && (
                      <rect
                        x={box.x - 5}
                        y={box.y - 5}
                        width={box.w + 10}
                        height={height + 10}
                        rx={12}
                        className={styles.selectionRing}
                      />
                    )}
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.w}
                      height={height}
                      rx={8}
                      className={`${styles.frameRect} ${box.archive ? styles.archive : ""}`}
                      style={{ stroke: tone.stroke }}
                    />
                    <path d={headerPath} className={styles.header} style={{ fill: tone.fill }} />
                    {box.archive && <path d={headerPath} fill={ids.url("hatch")} className={styles.hatchFill} />}
                    <line x1={box.x} x2={box.x + box.w} y1={box.y + HEADER_H} y2={box.y + HEADER_H} style={{ stroke: tone.stroke }} className={styles.rule} />
                    <text
                      x={box.x + 10}
                      y={box.y + HEADER_H / 2}
                      className={styles.name}
                      // Lange navn presses sammen i stedet for å gå inn under utvidelsesknappen.
                      {...(nameChars * 7.3 > nameWidth ? { textLength: nameWidth, lengthAdjust: "spacingAndGlyphs" as const } : {})}
                    >
                      {box.archive ? <tspan className={styles.schemaName}>arkiv.</tspan> : null}
                      {info.short}
                    </text>
                    {rows.map((name, index) => {
                      const column = columnByName.get(name)!;
                      const extra = index >= box.rows.length;
                      return (
                        <g key={name} className={extra ? styles.extraRow : undefined}>
                          {extra && index === box.rows.length && (
                            <line
                              x1={box.x + 8}
                              x2={box.x + box.w - 8}
                              y1={box.y + HEADER_H + index * ROW_H}
                              y2={box.y + HEADER_H + index * ROW_H}
                              className={styles.divider}
                            />
                          )}
                          <text x={box.x + 10} y={box.y + HEADER_H + index * ROW_H + ROW_H / 2} className={styles.column}>
                            {name}
                          </text>
                          {column.keys.length > 0 && (
                            <text
                              x={box.x + box.w - 10}
                              y={box.y + HEADER_H + index * ROW_H + ROW_H / 2}
                              className={styles.keys}
                              textAnchor="end"
                            >
                              {column.keys.join(" ")}
                            </text>
                          )}
                        </g>
                      );
                    })}
                    {box.extra.length > 0 && (
                      // Musetilgang. Tastatur bruker K på tabellen eller knappen i detaljpanelet.
                      <g className={styles.toggle} onClick={() => toggleExpanded(box.table)}>
                        <rect x={box.x + box.w - 32} y={box.y + 4} width={26} height={HEADER_H - 8} rx={5} className={styles.toggleRect} />
                        <path
                          d={
                            isExpanded
                              ? `M ${box.x + box.w - 25} ${box.y + HEADER_H / 2 + 2} l 6 -6 l 6 6`
                              : `M ${box.x + box.w - 25} ${box.y + HEADER_H / 2 - 2} l 6 6 l 6 -6`
                          }
                          className={styles.chevron}
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            <g>
              {view.boxes.map((box) => {
                const info = model.tables[box.table];
                const isSelected = selected === box.table;
                const dimmed = selected !== null && !neighbours.has(box.table);
                const label = `${box.table}, ${info.columns.length} kolonner, ${info.outgoing} utgående og ${info.incoming} innkommende fremmednøkler`;
                const description = [dimmed ? "Utenfor utvalget" : "", box.extra.length ? "Trykk K for å vise alle kolonner" : ""]
                  .filter(Boolean)
                  .join(". ");
                return (
                  <rect
                    key={box.table}
                    ref={(element) => {
                      if (element) targetRefs.current.set(box.table, element);
                      else targetRefs.current.delete(box.table);
                    }}
                    x={box.x}
                    y={box.y}
                    width={box.w - (box.extra.length ? TOGGLE_W : 0)}
                    height={HEADER_H}
                    rx={8}
                    className={styles.target}
                    role="button"
                    tabIndex={box.table === tabTable ? 0 : -1}
                    aria-pressed={isSelected}
                    aria-label={label}
                    {...(description ? { "aria-description": description } : {})}
                    onClick={() => {
                      setSelected(isSelected ? null : box.table);
                      setActiveTable(box.table);
                    }}
                    onKeyDown={(event) => onBoxKeyDown(event, box)}
                    onFocus={(event) => {
                      setActiveTable(box.table);
                      setHovered(box.table);
                      setFocusVisibleTable(event.currentTarget.matches(":focus-visible") ? box.table : null);
                    }}
                    onBlur={() => {
                      setHovered(null);
                      setFocusVisibleTable(null);
                    }}
                    onMouseEnter={() => setHovered(box.table)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
            </g>
          </svg>
        </div>
        <figcaption className={styles.caption}>{view.description}</figcaption>
      </figure>
      <div id={skipTarget} tabIndex={-1} className={styles.skipTarget} />

      {selectedTable && (
        <TableDetails
          table={selectedTable}
          edges={allEdges}
          headingRef={headingRef}
          onSelect={(table) => {
            selectTable(table);
            headingRef.current?.focus();
          }}
          onClose={clearSelection}
          columnToggle={
            selectedBox && selectedBox.extra.length > 0
              ? { expanded: expanded.has(selectedBox.table), onToggle: () => toggleExpanded(selectedBox.table) }
              : undefined
          }
        />
      )}

      <RelationTable view={view as ViewModel} />
    </div>
  );
}

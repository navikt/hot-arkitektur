"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { BodyShort, Button, Detail, Heading, Tag } from "@navikt/ds-react";
import { useSvgIds } from "@/components/hooks";
import { onActivate, rounded } from "@/lib/svg";
import { TONE } from "@/lib/tones";
import { Refs } from "./Refs";
import { navigate, readingOrder } from "./roving";
import { useScrollable } from "./useScrollable";
import type { DddRole, EdgeKind, GEdge, GGroup, GNode } from "./data";
import s from "./domain.module.css";

type Props = {
  ariaLabel: string;
  view: { w: number; h: number };
  nodes: GNode[];
  edges: GEdge[];
  groups: GGroup[];
  kinds: EdgeKind[];
  /** Relasjonstyper som er synlige. */
  activeKinds: string[];
  showRoles?: boolean;
  /** Høyeste trinn som vises uthevet. Senere trinn dimmes. */
  step?: number;
  badge?: string;
  legend?: ReactNode;
  controls?: ReactNode;
  /** Navn på notatet under diagrammet for skjermlesere. */
  altTitle: string;
  /** Unike tabelltitler for tekstversjonen. */
  captions: { nodes: string; edges: string; groups: string };
};

const roleText = (r: DddRole) =>
  r.certainty === "kandidat" && r.role !== "Aggregate-kandidat" && r.role !== "ACL" ? `${r.role} (kandidat)` : r.role;

const DIM_FILL = "var(--ax-bg-default)";
const DIM_STROKE = "var(--ax-border-neutral-strong)";
const DIM_TEXT = "var(--ax-text-neutral-subtle)";

export function GraphDiagram({
  ariaLabel,
  view,
  nodes,
  edges,
  groups,
  kinds,
  activeKinds,
  showRoles = false,
  step,
  badge,
  legend,
  controls,
  altTitle,
  captions,
}: Props) {
  const ids = useSvgIds();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const nodeRefs = useRef(new Map<string, SVGGElement>());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { ref: scrollRef, scrollable } = useScrollable<HTMLDivElement>();

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const kindById = new Map(kinds.map((k) => [k.id, k]));
  const visibleEdges = edges.filter((e) => activeKinds.includes(e.kind));
  const sel = selected ? nodeById.get(selected) : undefined;

  const navItems = nodes.map((n) => ({ id: n.id, x: n.x + n.w / 2, y: n.y + n.h / 2 }));
  const tabId = activeId && nodeById.has(activeId) ? activeId : (readingOrder(navItems)[0]?.id ?? null);

  const connected = new Set<string>();
  const incident = new Set<string>();
  if (sel) {
    for (const e of visibleEdges) {
      if (e.from === sel.id || e.to === sel.id) {
        incident.add(e.id);
        connected.add(e.from);
        connected.add(e.to);
      }
    }
  }

  const late = (st?: number) => step !== undefined && st !== undefined && st > step;
  const toggle = (id: string) => {
    setSelected((cur) => (cur === id ? null : id));
    setActiveId(id);
  };
  const focusNode = (id: string | null) => {
    if (id) nodeRefs.current.get(id)?.focus();
  };

  const onNodeKeyDown = (ev: KeyboardEvent, id: string) => {
    const result = navigate(navItems, id, ev.key);
    if (result.handled) {
      ev.preventDefault();
      setActiveId(result.id);
      focusNode(result.id);
      return;
    }
    onActivate(() => toggle(id))(ev);
  };

  const clearSelection = () => {
    const keep = selected;
    setSelected(null);
    focusNode(keep);
  };

  const groupOf = (n: GNode) => {
    const cx = n.x + n.w / 2;
    const cy = n.y + n.h / 2;
    return groups
      .filter((g) => cx >= g.x && cx <= g.x + g.w && cy >= g.y && cy <= g.y + g.h)
      .sort((a, b) => a.w * a.h - b.w * b.h)[0];
  };
  const withGroup = nodes.map((n) => ({ node: n, group: groupOf(n) }));
  const hasSteps = nodes.some((n) => n.step !== undefined);

  const skipTarget = ids.id("etter");

  return (
    <div
      onKeyDown={(ev) => {
        if (ev.key === "Escape" && selected) {
          setSelected(null);
        }
      }}
    >
      {controls}
      {legend}
      <BodyShort size="small" className={`arch-subtle ${s.hint}`}>
        Tastatur: Tab flytter fokus inn i diagrammet, piltaster flytter mellom begreper, Home og End går til første og
        siste, Enter eller mellomrom velger, Escape fjerner valget.
      </BodyShort>
      <a
        href={`#${skipTarget}`}
        className={s.skip}
        onClick={(ev) => {
          ev.preventDefault();
          document.getElementById(skipTarget)?.focus();
        }}
      >
        Hopp forbi diagrammet
      </a>
      <div
        ref={scrollRef}
        className={`portal-diagram ${s.frame}`}
        {...(scrollable ? { role: "region", "aria-label": `Rullbart område: ${ariaLabel}` } : {})}
      >
        <svg
          viewBox={`0 0 ${view.w} ${view.h}`}
          width="100%"
          style={{ minWidth: Math.min(view.w, 900), display: "block", overflow: "visible" }}
          role="group"
          aria-label={ariaLabel}
          aria-describedby={ids.id("desc")}
        >
          <desc id={ids.id("desc")}>
            {`Interaktivt diagram med ${nodes.length} begreper og ${visibleEdges.length} relasjoner. Piltaster flytter mellom begreper, Enter eller mellomrom velger, Escape fjerner valget. Alt innholdet står som tekst i «${altTitle}» under diagrammet.`}
          </desc>
          <defs>
            {(["", "Hi", "Acl"] as const).map((v) => (
              <marker key={v} id={ids.id(`arrow${v}`)} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  className={s.marker}
                  style={{
                    fill:
                      v === "Hi" ? TONE.accent.strong : v === "Acl" ? TONE.warning.strong : "var(--ax-border-neutral-strong)",
                  }}
                />
              </marker>
            ))}
          </defs>

          {groups.map((g) => (
            <g key={g.id} aria-hidden="true">
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                rx={16}
                className={s.group}
                style={g.tone ? { stroke: TONE[g.tone].stroke } : undefined}
                strokeDasharray={g.dashed ? "7 5" : undefined}
              />
              <text x={g.labelAt[0]} y={g.labelAt[1]} className={s.groupLabel}>
                {g.label}
              </text>
            </g>
          ))}

          {badge && (
            <g aria-hidden="true">
              <rect x={view.w - 130} y={22} width={110} height={24} rx={12} style={{ fill: TONE.accent.strong }} />
              <text x={view.w - 75} y={38} textAnchor="middle" className={s.badgeText}>
                {badge}
              </text>
            </g>
          )}

          {visibleEdges.map((e) => {
            const kind = kindById.get(e.kind);
            const hi = incident.has(e.id);
            const dim = (sel && !hi) || late(e.step);
            const mark = e.acl ? "Acl" : hi ? "Hi" : "";
            const color = e.acl ? TONE.warning.strong : hi ? TONE.accent.strong : "var(--ax-border-neutral-strong)";
            return (
              <g key={e.id} className={s.edge} data-dim={dim ? "true" : undefined} aria-hidden="true">
                <path
                  d={rounded(e.pts, 10)}
                  fill="none"
                  style={{ stroke: color }}
                  strokeWidth={e.acl ? 3 : hi ? 2.5 : dim ? 1 : 1.6}
                  strokeDasharray={kind?.dashed ? "6 5" : undefined}
                  markerEnd={`url(#${ids.id(`arrow${mark}`)})`}
                />
                {e.label && e.lp && (
                  <text x={e.lp[0]} y={e.lp[1]} textAnchor={e.lp[2]} className={s.edgeLabel}>
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map((n) => {
            const t = TONE[n.tone];
            const isSel = n.id === selected;
            const isLate = late(n.step);
            const dim = Boolean((sel && !isSel && !connected.has(n.id)) || isLate);
            const roles = n.roles ?? [];
            const sub = showRoles
              ? roles.length
                ? roles.map(roleText).join(", ")
                : "Ingen DDD-rolle belagt"
              : null;
            const desc = showRoles ? (roles.length ? roles.map(roleText).join(", ") : "ingen DDD-rolle belagt") : (n.sub ?? []).join(" ");
            const textFill = dim ? DIM_TEXT : t.text;
            const stroke = dim ? DIM_STROKE : isSel ? TONE.accent.strong : n.acl ? TONE.warning.strong : t.stroke;
            return (
              <g
                key={n.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(n.id, el);
                  else nodeRefs.current.delete(n.id);
                }}
                role="button"
                tabIndex={n.id === tabId ? 0 : -1}
                aria-pressed={isSel}
                aria-label={`${n.label}${desc ? `: ${desc}` : ""}`}
                {...(dim ? { "aria-description": isLate ? "Senere enn valgt steg" : "Utenfor utvalget" } : {})}
                className={s.node}
                data-dim={dim ? "true" : undefined}
                data-selected={isSel ? "true" : undefined}
                onClick={() => toggle(n.id)}
                onFocus={() => setActiveId(n.id)}
                onKeyDown={(ev) => onNodeKeyDown(ev, n.id)}
              >
                <rect
                  className={s.focusRing}
                  x={n.x - 9}
                  y={n.y - 9}
                  width={n.w + 18}
                  height={n.h + 18}
                  rx={18}
                  fill="none"
                />
                {isSel && (
                  <rect
                    className={s.selectionRing}
                    x={n.x - 4}
                    y={n.y - 4}
                    width={n.w + 8}
                    height={n.h + 8}
                    rx={14}
                    fill="none"
                  />
                )}
                <rect
                  className={s.body}
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx={10}
                  style={{ fill: dim ? DIM_FILL : t.fill, stroke }}
                  strokeWidth={dim ? 1 : isSel || n.acl || (showRoles && roles.length) ? 2.5 : 1.5}
                  strokeDasharray={n.external ? "5 4" : undefined}
                />
                <text x={n.x + 12} y={n.y + 23} className={s.nodeLabel} style={{ fill: textFill }}>
                  {n.label}
                </text>
                {sub !== null ? (
                  <text x={n.x + 12} y={n.y + 42} className={roles.length ? s.nodeRole : s.nodeSub} style={{ fill: textFill }}>
                    {sub}
                  </text>
                ) : (
                  (n.sub ?? []).map((line, i) => (
                    <text key={line} x={n.x + 12} y={n.y + 40 + i * 13} className={s.nodeSub} style={{ fill: textFill }}>
                      {line}
                    </text>
                  ))
                )}
                {n.acl && (
                  <g>
                    <rect x={n.x + n.w - 46} y={n.y - 9} width={40} height={18} rx={9} className={s.aclBadge} style={{ fill: TONE.warning.strong }} />
                    <text x={n.x + n.w - 26} y={n.y + 4} textAnchor="middle" className={s.badgeText}>
                      ACL
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div id={skipTarget} tabIndex={-1} className={s.skipTarget} aria-label="Etter diagrammet" role="group" />

      <div className={s.status} role="status">
        {sel && (
          <>
            <span>Valgt: {sel.label}. Detaljer under diagrammet.</span>
            <Button size="xsmall" variant="secondary" onClick={() => headingRef.current?.focus()}>
              Gå til detaljer
            </Button>
          </>
        )}
      </div>

      <div className={s.panel}>
        {sel ? (
          <>
            <div className={s.panelHead}>
              <Heading level="3" size="small" tabIndex={-1} ref={headingRef} className={s.panelTitle}>
                {sel.label}
              </Heading>
              {sel.external && (
                <Tag size="xsmall" variant="neutral-moderate">
                  Ekstern modell
                </Tag>
              )}
              <Button size="xsmall" variant="tertiary" onClick={clearSelection}>
                Fjern utvalg
              </Button>
            </div>
            <BodyShort>{sel.desc}</BodyShort>
            {sel.kode && sel.kode.length > 0 && (
              <>
                <Detail className={s.panelLabel}>Funn i koden</Detail>
                <ul className={s.list}>
                  {sel.kode.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </>
            )}
            <Detail className={s.panelLabel}>DDD-rolle</Detail>
            {sel.roles && sel.roles.length > 0 ? (
              <ul className={s.list}>
                {sel.roles.map((r) => (
                  <li key={r.role}>
                    <strong>{roleText(r)}.</strong> {r.basis} <Refs refs={r.refs} />
                  </li>
                ))}
              </ul>
            ) : (
              <BodyShort size="small">Koden og teksten belegger ingen DDD-rolle for dette begrepet.</BodyShort>
            )}
            <Detail className={s.panelLabel}>Kilder</Detail>
            <BodyShort size="small">
              <Refs refs={sel.refs} />
            </BodyShort>
            {connected.size > 1 && (
              <>
                <Detail className={s.panelLabel}>Koblede begreper</Detail>
                <div className={s.chips}>
                  {[...connected]
                    .filter((id) => id !== sel.id)
                    .map((id) => (
                      <Button
                        key={id}
                        size="xsmall"
                        variant="secondary"
                        onClick={() => {
                          setSelected(id);
                          setActiveId(id);
                          headingRef.current?.focus();
                        }}
                      >
                        {nodeById.get(id)?.label}
                      </Button>
                    ))}
                </div>
              </>
            )}
          </>
        ) : (
          <BodyShort size="small" className="arch-subtle">
            Velg et begrep i diagrammet for å se ansvar, DDD-rolle, kilder og koblinger. Escape fjerner utvalget.
          </BodyShort>
        )}
      </div>

      <details className={s.alt}>
        <summary>{altTitle}</summary>
        <table className={s.table}>
          <caption>{captions.nodes}</caption>
          <thead>
            <tr>
              <th scope="col">Begrep</th>
              <th scope="col">Beskrivelse</th>
              <th scope="col">DDD-rolle</th>
              {groups.length > 0 && <th scope="col">Gruppe</th>}
              {hasSteps && <th scope="col">Steg</th>}
            </tr>
          </thead>
          <tbody>
            {withGroup.map(({ node: n, group }) => (
              <tr key={n.id}>
                <th scope="row">{n.label}</th>
                <td>{n.desc}</td>
                <td>{n.roles?.length ? n.roles.map(roleText).join(", ") : "Ingen belagt"}</td>
                {groups.length > 0 && <td>{group?.label ?? "Ingen gruppe"}</td>}
                {hasSteps && <td>{n.step ?? ""}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {groups.length > 0 && (
          <table className={s.table}>
            <caption>{captions.groups}</caption>
            <thead>
              <tr>
                <th scope="col">Gruppe</th>
                <th scope="col">Begreper</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  <th scope="row">{g.label}</th>
                  <td>
                    {withGroup
                      .filter((x) => x.group?.id === g.id)
                      .map((x) => x.node.label)
                      .join(", ") || "Ingen"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <table className={s.table}>
          <caption>{captions.edges}</caption>
          <thead>
            <tr>
              <th scope="col">Fra</th>
              <th scope="col">Til</th>
              <th scope="col">Type</th>
              <th scope="col">Betegnelse</th>
              {hasSteps && <th scope="col">Steg</th>}
            </tr>
          </thead>
          <tbody>
            {edges.map((e) => (
              <tr key={e.id}>
                <td>{nodeById.get(e.from)?.label}</td>
                <td>{nodeById.get(e.to)?.label}</td>
                <td>{kindById.get(e.kind)?.label}</td>
                <td>{e.label ?? ""}</td>
                {hasSteps && <td>{e.step ?? ""}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/** Tegnforklaring for linjetyper og noder. */
export function Legend({ kinds, extra }: { kinds: EdgeKind[]; extra?: ReactNode }) {
  return (
    <ul className={s.legend} aria-label="Tegnforklaring">
      {kinds.map((k) => (
        <li key={k.id}>
          <svg width="36" height="10" aria-hidden="true">
            <line
              x1="1"
              y1="5"
              x2="35"
              y2="5"
              style={{ stroke: "var(--ax-border-neutral-strong)" }}
              strokeWidth="2"
              strokeDasharray={k.dashed ? "6 5" : undefined}
            />
          </svg>
          {k.label}
        </li>
      ))}
      {extra}
      <li>
        <span className={`${s.swatch} ${s.swatchSelected}`} aria-hidden="true" />
        Valgt begrep: dobbel ramme
      </li>
      <li>
        <span className={`${s.swatch} ${s.swatchDim}`} aria-hidden="true" />
        Dempet begrep: utenfor utvalget eller senere enn valgt steg
      </li>
    </ul>
  );
}

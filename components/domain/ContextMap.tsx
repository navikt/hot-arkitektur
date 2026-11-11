"use client";

import { useState } from "react";
import { ToggleGroup } from "@navikt/ds-react";
import { CONTEXT_EDGES, CONTEXT_GROUPS, CONTEXT_KINDS, CONTEXT_NODES, CONTEXT_VIEW } from "./data";
import { GraphDiagram, Legend } from "./GraphDiagram";
import s from "./domain.module.css";

const FILTERS: Record<string, string[]> = {
  alle: ["intern", "ekstern"],
  intern: ["intern"],
  ekstern: ["ekstern"],
};

export function ContextMap() {
  const [filter, setFilter] = useState("alle");

  return (
    <GraphDiagram
      ariaLabel="Kontekstkart: Hotsaks interne ansvarsområder og eksterne modeller"
      altTitle="Tekstversjon av kontekstkartet: ansvarsområder, eksterne modeller og koblinger"
      captions={{
        nodes: "Ansvarsområder og eksterne modeller i kontekstkartet",
        groups: "Grupper i kontekstkartet",
        edges: "Relasjoner i kontekstkartet",
      }}
      view={CONTEXT_VIEW}
      nodes={CONTEXT_NODES}
      edges={CONTEXT_EDGES}
      groups={CONTEXT_GROUPS}
      kinds={CONTEXT_KINDS}
      activeKinds={FILTERS[filter]}
      controls={
        <div className={s.controls}>
          <ToggleGroup size="small" value={filter} onChange={setFilter} label="Koblinger">
            <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
            <ToggleGroup.Item value="intern">Interne</ToggleGroup.Item>
            <ToggleGroup.Item value="ekstern">Eksterne</ToggleGroup.Item>
          </ToggleGroup>
        </div>
      }
      legend={
        <Legend
          kinds={CONTEXT_KINDS}
          extra={
            <>
              <li>
                <span className={`${s.swatch} ${s.swatchExternal}`} aria-hidden="true" />
                Ekstern modell
              </li>
              <li>
                <span className={`${s.swatch} ${s.swatchAcl}`} aria-hidden="true" />
                ACL: oversetter eksterne oppgaver og personer til lokal modell
              </li>
            </>
          }
        />
      }
    />
  );
}

"use client";

import { useState } from "react";
import { Switch, ToggleGroup } from "@navikt/ds-react";
import { DOMAIN_EDGES, DOMAIN_GROUPS, DOMAIN_KINDS, DOMAIN_NODES, DOMAIN_VIEW } from "./data";
import { GraphDiagram, Legend } from "./GraphDiagram";
import s from "./domain.module.css";

const FILTERS: Record<string, string[]> = {
  alle: ["contains", "ref"],
  contains: ["contains"],
  ref: ["ref"],
};

export function DomainMap() {
  const [filter, setFilter] = useState("alle");
  const [roles, setRoles] = useState(false);

  return (
    <GraphDiagram
      ariaLabel="Konseptuell domenemodell for Hotsak med begreper og relasjoner"
      altTitle="Tekstversjon av domenemodellen: begreper og relasjoner"
      captions={{
        nodes: "Begreper i domenemodellen",
        groups: "Grupper i domenemodellen",
        edges: "Relasjoner i domenemodellen",
      }}
      view={DOMAIN_VIEW}
      nodes={DOMAIN_NODES}
      edges={DOMAIN_EDGES}
      groups={DOMAIN_GROUPS}
      kinds={DOMAIN_KINDS}
      activeKinds={FILTERS[filter]}
      showRoles={roles}
      controls={
        <div className={s.controls}>
          <ToggleGroup size="small" value={filter} onChange={setFilter} label="Relasjonstype">
            <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
            <ToggleGroup.Item value="contains">Inneholder og samler</ToggleGroup.Item>
            <ToggleGroup.Item value="ref">ID-referanse</ToggleGroup.Item>
          </ToggleGroup>
          <Switch size="small" checked={roles} onChange={(e) => setRoles(e.target.checked)}>
            Vis DDD-roller
          </Switch>
        </div>
      }
      legend={
        <Legend
          kinds={DOMAIN_KINDS}
          extra={
            <li>
              <span className={`${s.swatch} ${s.swatchExternal}`} aria-hidden="true" />
              Ekstern modell eller referert begrep
            </li>
          }
        />
      }
    />
  );
}

"use client";

import { useState } from "react";
import { BodyShort, Button, ToggleGroup } from "@navikt/ds-react";
import {
  PROPOSAL_EDGES,
  PROPOSAL_GROUPS,
  PROPOSAL_KINDS,
  PROPOSAL_NODES,
  PROPOSAL_STEPS,
  PROPOSAL_VIEW,
  TODAY_EDGES,
  TODAY_GROUPS,
  TODAY_NODES,
} from "./data";
import { GraphDiagram, Legend } from "./GraphDiagram";
import s from "./domain.module.css";

const ALL = PROPOSAL_STEPS.length;

export function ProposalDiagram() {
  const [mode, setMode] = useState<"today" | "proposal">("today");
  const [step, setStep] = useState(ALL);
  const today = mode === "today";
  const last = today ? 5 : ALL;
  const current = Math.min(step, last);

  // aria-disabled i stedet for disabled, så knappen beholder fokus når den når enden.
  const previous = () => {
    if (current > 1) setStep(current - 1);
  };
  const next = () => {
    if (current < last) setStep(current + 1);
  };

  return (
    <>
      <div className={s.controls}>
        <ToggleGroup
          size="small"
          value={mode}
          onChange={(v) => {
            setMode(v as "today" | "proposal");
            setStep(v === "today" ? 5 : ALL);
          }}
          label="Visning"
        >
          <ToggleGroup.Item value="today">Dagens</ToggleGroup.Item>
          <ToggleGroup.Item value="proposal">Forslag</ToggleGroup.Item>
        </ToggleGroup>
      </div>
      <div className={s.steps}>
        <Button size="xsmall" variant="secondary" aria-disabled={current <= 1} onClick={previous}>
          Forrige steg
        </Button>
        <Button size="xsmall" variant="secondary" aria-disabled={current >= last} onClick={next}>
          Neste steg
        </Button>
        <Button size="xsmall" variant="tertiary" onClick={() => setStep(last)}>
          Vis alt
        </Button>
        <BodyShort size="small" role="status">
          Steg {current} av {last}
          {!today && `: ${PROPOSAL_STEPS[current - 1]}`}
        </BodyShort>
      </div>
      {today ? (
        <BodyShort className={s.note}>
          Dagens kode ferdigstiller oppgaven og sender Kafka-melding inne i transaksjonsblokken. En databaserollback kan
          ikke trekke tilbake disse effektene.
        </BodyShort>
      ) : (
        <BodyShort className={s.note}>
          Dette er et forslag og finnes ikke som en samlet flyt i dagens kode. Outbox-mønsteret finnes ikke i koden i dag.
        </BodyShort>
      )}
      <GraphDiagram
        key={mode}
        ariaLabel={
          today
            ? "Dagens flyt i opprettMidlertidigBehandlingsvedtak, med eksterne effekter inne i transaksjonsblokken"
            : "Forslag: beslutning adskilt fra koordinering, med outbox"
        }
        altTitle={today ? "Tekstversjon av dagens flyt" : "Tekstversjon av forslaget"}
        captions={
          today
            ? {
                nodes: "Begreper i dagens flyt",
                groups: "Grupper i dagens flyt",
                edges: "Steg og relasjoner i dagens flyt",
              }
            : {
                nodes: "Begreper i forslaget",
                groups: "Grupper i forslaget",
                edges: "Steg og relasjoner i forslaget",
              }
        }
        view={PROPOSAL_VIEW}
        nodes={today ? TODAY_NODES : PROPOSAL_NODES}
        edges={today ? TODAY_EDGES : PROPOSAL_EDGES}
        groups={today ? TODAY_GROUPS : PROPOSAL_GROUPS}
        kinds={PROPOSAL_KINDS}
        activeKinds={["flyt"]}
        step={current}
        badge={today ? undefined : "FORSLAG"}
        legend={<Legend kinds={PROPOSAL_KINDS} />}
      />
    </>
  );
}

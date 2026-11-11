import type { Metadata } from "next";
import Link from "next/link";
import { BodyLong, Heading } from "@navikt/ds-react";
import { JumpNav } from "@/components/page/JumpNav";
import { Section } from "@/components/page/Section";
import { HeroStats } from "@/components/page/HeroStats";
import { DomainMap } from "@/components/domain/DomainMap";
import { ContextMap } from "@/components/domain/ContextMap";
import { ProposalDiagram } from "@/components/domain/ProposalDiagram";
import { STATS } from "@/components/domain/data";
import {
  Avklaringer,
  BegreperTabell,
  DddStyrker,
  Forbedringer,
  GrenserEtter,
  GrenserTekst,
  OversiktKilder,
  OversiktTekst,
  VurderingTabell,
} from "@/components/domain/Sections";

export const metadata: Metadata = {
  title: "Domenemodell · Team HOT",
  description:
    "Sak, behandling og vedtak i Hotsak. En konseptuell modell med kodekilder og vurderinger ut fra Domain-driven design (DDD).",
};

const SECTIONS = [
  { id: "oversikt", label: "Konseptuell modell" },
  { id: "begreper", label: "Begreper" },
  { id: "grenser", label: "Modellgrenser" },
  { id: "ddd", label: "DDD-styrker" },
  { id: "forbedringer", label: "Forbedringer" },
  { id: "vurdering", label: "DDD-vurdering" },
  { id: "avklaringer", label: "Avklaringer" },
] as const;

export default function DomenemodellPage() {
  return (
    <div className="arch-page">
      <header className="portal-hero arch-hero">
        <div className="arch-hero__text">
          <Heading level="1" size="xlarge" spacing>
            Domenemodell
          </Heading>
          <BodyLong className="arch-hero__lead">
            Sak, behandling og vedtak i Hotsak. Modellen er lest fra koden og vurdert mot Domain-driven design (DDD).
            Hver påstand har en kildehenvisning.
          </BodyLong>
        </div>
        <HeroStats
          stats={[
            { n: STATS.begreper, label: "Begreper i modellen", sub: "noder i diagrammet" },
            {
              n: STATS.relasjoner,
              label: "Relasjoner",
              sub: `${STATS.inneholder} inneholder, ${STATS.referanser} ID-referanser`,
            },
            { n: STATS.eksterneModeller, label: "Eksterne modeller", sub: "i kontekstkartet" },
            { n: STATS.kildefiler, label: "Kildefiler", sub: "i hotsak-api" },
            { n: STATS.vurderinger, label: "DDD-konsepter vurdert" },
          ]}
        />
      </header>

      <JumpNav sections={SECTIONS} />

      <Section
        id="oversikt"
        eyebrow="Oversikt"
        title="Konseptuell modell"
        lead="Saksmodellen og begrepene rundt. Velg et begrep for ansvar, DDD-rolle og kilder."
      >
        <OversiktTekst />
        <DomainMap />
        <OversiktKilder />
      </Section>

      <Section id="begreper" eyebrow="Begreper" title="Begreper og ansvar">
        <BegreperTabell />
      </Section>

      <Section
        id="grenser"
        eyebrow="Modellgrenser"
        title="Interne ansvarsområder og eksterne modeller"
        lead="Dagens integrasjonsgrenser og interne pakker."
      >
        <GrenserTekst />
        <ContextMap />
        <GrenserEtter />
      </Section>

      <Section id="ddd" eyebrow="Styrker" title="DDD-styrker i koden">
        <DddStyrker />
      </Section>

      <Section
        id="forbedringer"
        eyebrow="Forslag"
        title="Forslag til forbedringer"
        lead="Forslagene endrer ikke domenelogikken. Rekkefølgen prioriterer tydelige konsistensregler før større pakke- eller tjenesteoppdeling."
      >
        <Forbedringer />
        <Heading level="3" size="small" spacing>
          Beslutning adskilt fra koordinering
        </Heading>
        <BodyLong spacing>
          Diagrammet viser dagens flyt og forslaget. Forslaget er et målbilde og finnes ikke som en samlet flyt i dagens
          kode.
        </BodyLong>
        <ProposalDiagram />
      </Section>

      <Section
        id="vurdering"
        eyebrow="Oppsummering"
        title="DDD-vurdering"
        lead="Status gjelder det koden viser. Der koden ikke gir svar, står det Uavklart."
      >
        <VurderingTabell />
      </Section>

      <Section id="avklaringer" eyebrow="Neste steg" title="Avklaringer med teamet">
        <Avklaringer />
        <BodyLong spacing>
          For tabeller, nøkler og lagrede relasjoner, se{" "}
          <Link href="/applikasjoner/hotsak/databasemodell">databasemodellen</Link>. Et databaseforhold er ikke i seg
          selv en DDD-eierskapsregel.
        </BodyLong>
      </Section>
    </div>
  );
}

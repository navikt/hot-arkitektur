import type { Metadata } from "next";
import Link from "next/link";
import { BodyLong, Detail, Heading } from "@navikt/ds-react";
import { DatabaseModelProvider } from "@/components/database/DatabaseModelContext";
import { ErDiagram } from "@/components/database/ErDiagram";
import { TableCatalog } from "@/components/database/TableCatalog";
import { buildDatabaseModel } from "@/components/database/model";
import { HeroStats } from "@/components/page/HeroStats";
import { JumpNav } from "@/components/page/JumpNav";
import { Section } from "@/components/page/Section";
import { Source } from "@/components/page/Source";
import { relations, schema, tables } from "@/lib/schema";
import { migrations } from "@/lib/sources";

export const metadata: Metadata = { title: "Databasemodell · Team HOT" };

const DOMAIN_HREF = "/applikasjoner/hotsak/domenemodell";

const SECTIONS = [
  { id: "grunnlag", label: "Kildegrunnlag" },
  { id: "kjerne", label: "Sak, behandling og brev" },
  { id: "barnebriller", label: "Barnebriller og vilkår" },
  { id: "alle", label: "Hele skjemaet" },
  { id: "constraints", label: "Viktige constraints" },
  { id: "katalog", label: "Tabellkatalog" },
];

const publicCount = tables.filter((table) => table.startsWith("public.")).length;

const BASELINE = "B170__Baseline.sql";
const repeatable = schema.migrations.find((file) => file.startsWith("R__"));
const versioned = schema.migrations.filter((file) => /^V\d+__/.test(file));
const versionOf = (file: string) => file.split("__")[0];
const firstVersion = versionOf(versioned[0]);
const lastVersion = versionOf(versioned[versioned.length - 1]);

const src = (file: string, line?: number, end?: number) => (
  <Source path={`${migrations}${file}`} line={line} end={end} />
);

export default function DatabasemodellPage() {
  const model = buildDatabaseModel();

  return (
    <DatabaseModelProvider model={model}>
      <div className="arch-page">
        <header className="portal-hero arch-hero">
          <div className="arch-hero__text">
            <Detail className="arch-eyebrow">Hotsak · Team HOT</Detail>
            <Heading level="1" size="xlarge" spacing>
              Databasemodell
            </Heading>
            <BodyLong size="large" className="arch-hero__lead">
              Tabeller, relasjoner, nøkler og constraints i Hotsaks PostgreSQL-database, utledet fra
              Flyway-migreringene. Databasemodellen viser lagring, ikke DDD-aggregatgrenser. Domenet står i{" "}
              <Link href={DOMAIN_HREF}>domenemodellen</Link>.
            </BodyLong>
          </div>
          <HeroStats
            stats={[
              { n: publicCount, label: "Tabeller i public", sub: "aktivt skjema" },
              { n: relations().length, label: "Foreign keys" },
              { n: schema.migrations.length, label: "Migreringsfiler", sub: `${firstVersion} til ${lastVersion}` },
            ]}
          />
        </header>

        <JumpNav sections={SECTIONS} />

        <Section
          id="grunnlag"
          eyebrow="Utgangspunkt"
          title="Kildegrunnlag"
          lead="Modellen er generert fra migreringene, ikke fra en kjørende database."
        >
          <div className="portal-prose">
            <BodyLong spacing>
              Modellen er generert ved å anvende {src(BASELINE)} og alle versjonerte migreringer fra {firstVersion} til{" "}
              {lastVersion} i rekkefølge, deretter repeatable-skriptet{repeatable ? <> {src(repeatable)}</> : null}.
              PostgreSQL-katalogen gir tabeller, kolonner, foreign keys, constraints og indekser etter migrering. Gamle
              skript i <code>pre_V170/</code> kjøres ikke i tillegg til baseline.
            </BodyLong>
            <BodyLong spacing>
              Oversikten viser <strong>{publicCount} tabeller i public</strong>. Tabeller i arkivskjemaet og relasjoner
              til dem er utelatt. Flyways egen historikktabell er ikke med. Genereringen
              bruker en tom, isolert PGlite-database og leser ingen person- eller produksjonsdata. Den bekrefter
              skjemastrukturen, ikke at datamigreringene virker for alle historiske data.
            </BodyLong>
            <details>
              <summary>Avgrensninger og reproduksjon</summary>
              <BodyLong spacing>
                Flyway-oppsettet oppretter arkivskjemaet før migrering (<Source path="app/build.gradle.kts" line={122} />
                ). Generatoren gjør det samme. Den bruker ikke Flyway til å kjøre skriptene, men anvender de samme
                SQL-filene i en PostgreSQL-motor. Tilpasninger i PGlite:
              </BodyLong>
              <ul>
                {schema.adaptations.map((item) => (
                  <li key={item.migration}>
                    {src(item.migration)}: {item.reason}
                  </li>
                ))}
              </ul>
              <BodyLong spacing>
                <code>btree_gist</code> lastes i PGlite, og temporal uniqueness med <code>WITHOUT OVERLAPS</code> inngår
                i skjemaet. Dette erstatter ikke Flyway-testene mot tjenestens PostgreSQL-versjon.
              </BodyLong>
              <BodyLong>
                Kjør <code>HOTSAK_API_DIR=../hotsak-api pnpm schema</code> for å regenerere{" "}
                <code>data/schema.json</code>. <code>pnpm schema:check</code> sammenligner fingeravtrykket med SQL-filene
                lokalt. CI kjører ikke sjekken, fordi CI ikke har hotsak-api. Ved nye migreringer må forklaringene og
                kildeversjonen gjennomgås.
              </BodyLong>
            </details>
          </div>
        </Section>

        <Section
          id="kjerne"
          eyebrow="Utsnitt"
          title="Sak, behandling og brev"
          lead="Klikk på en tabell for å se relasjonene og detaljene. Pilen i tabellhodet viser alle kolonnene."
        >
          <div className="portal-prose">
            <BodyLong spacing>
              <code>sak_v1</code> er knutepunktet for saksdata. <code>behandling_v1</code> refererer til sak og valgfritt
              en oppgave med en unik kobling. <code>vedtak_v1</code> refererer til sak og valgfritt et brev, men har ingen
              direkte foreign key til behandling. Brev kan referere til behandling.
            </BodyLong>
          </div>
          <ErDiagram initialView="kjerne" />
          <div className="portal-prose">
            <BodyLong spacing>
              <code>brevdistribusjon_v1.brevmottaker_id</code> er obligatorisk og unikt: en mottaker har null eller én
              distribusjon. Relasjonen til brev ligger også direkte på distribusjonen. Unikhet og FK-er alene garanterer
              ikke at brev-ID på distribusjon og mottaker er den samme.
            </BodyLong>
            <BodyLong>
              Kilder: {src("V179__behandling_v1.sql")}, {src("V199__brev_v1.sql")}, {src("V222__brevmottaker_new_columns.sql")}.
            </BodyLong>
          </div>
        </Section>

        <Section
          id="barnebriller"
          eyebrow="Utsnitt"
          title="Barnebriller og vilkår"
          lead="Mange tabeller bruker sak_id som både primærnøkkel og fremmednøkkel."
        >
          <div className="portal-prose">
            <BodyLong spacing>
              Flere tabeller bruker <code>sak_id</code> som både primary key og foreign key. Det gir maksimalt én rad per
              sak, men krever ikke at alle saker har en slik rad. <code>vilkarsvurdering_vilkar_v1</code> har både
              referanse til vurderingen og direkte til saken. Det er mer enn en enkel parent-child-relasjon.
            </BodyLong>
          </div>
          <ErDiagram initialView="barnebriller" />
          <div className="portal-prose">
            <BodyLong spacing>
              Utsnittet viser databaseconstraints, ikke hvilken tjeneste som eier dataene. En vurdering har vilkår, og en
              utbetaling refererer til både sak og vedtak.
            </BodyLong>
            <BodyLong>
              Kilder i {BASELINE}: {src(BASELINE, 106, 197)} (barnebrillegrunnlag til satsberegning),{" "}
              {src(BASELINE, 431, 446)} (totrinnskontroll), {src(BASELINE, 510, 522)} (vedtak) og{" "}
              {src(BASELINE, 543, 559)} (utbetaling).
            </BodyLong>
          </div>
        </Section>

        <Section
          id="alle"
          eyebrow="Utsnitt"
          title="Hele skjemaet"
          lead={`Alle ${tables.length} tabeller i public, inkludert tekniske tabeller, gruppert etter tema.`}
        >
          <div className="portal-prose">
            <BodyLong spacing>
              Diagrammet har alle {tables.length} tabeller. Bruk zoom og rull for å lese enkeltområder, og klikk på en
              tabell for å fremheve relasjonene og dempe resten. Tegningen viser bare nøkkelkolonner og utvalgte
              tilstandsfelt. Katalogen under har alle kolonnene.
            </BodyLong>
          </div>
          <ErDiagram initialView="alle" />
        </Section>

        <Section
          id="constraints"
          eyebrow="Regler i databasen"
          title="Viktige constraints"
          lead="Det databasen håndhever, og det den ikke gjør."
        >
          <div className="portal-prose">
            <ul>
              <li>
                <strong>Saksstatus over tid.</strong> <code>saksstatus_v1.tidsrom</code> må være ikke-tomt.{" "}
                <code>UNIQUE (sak_id, tidsrom WITHOUT OVERLAPS)</code> hindrer overlapp for samme sak. En delvis unik
                indeks på åpent tidsrom hindrer flere gjeldende statuser. {src("V216__saksstatus_constraint_v2.sql", 1, 13)}.
              </li>
              <li>
                <strong>Oppgavens tilknytning.</strong> Journalføringsoppgaver må ha journalpost, andre oppgavetyper må ha
                sak. Tildelt enhet er obligatorisk. <code>oppgave_v1</code> er lokal tilknytning til en ekstern oppgave,
                ikke den gamle interne oppgavetabellen. {src("V196__oppgave_journalforing.sql", 78, 100)},{" "}
                {src("V225__sak_oppgave_not_null.sql", 1, 2)}.
              </li>
              <li>
                <strong>Brevmottaker.</strong> Mottakeren må ha part_id eller både navn og adresse. En{" "}
                <code>UNIQUE NULLS NOT DISTINCT</code>-constraint skiller kombinasjoner av brev, mottakertype og part_id.
                En mottaker med distribusjon kan ikke slettes på grunn av <code>ON DELETE RESTRICT</code>.{" "}
                {src("V222__brevmottaker_new_columns.sql", 16, 32)}.
              </li>
              <li>
                <strong>Totrinnskontroll.</strong> Databasen hindrer at saksbehandler og godkjenner er samme identitet når
                begge er satt. Det er en lagringsregel. Den erstatter ikke tilgangskontroll eller kontroll av
                tilstandsovergangen. {src(BASELINE, 431, 446)}.
              </li>
            </ul>
            <BodyLong>
              En foreign key sikrer referanseintegritet, ikke hele forretningsregelen. Katalogen viser hva databasen
              håndhever. <Link href={DOMAIN_HREF}>Domenemodellen</Link> beskriver reglene som hører til i domenet.
            </BodyLong>
          </div>
        </Section>

        <Section
          id="katalog"
          eyebrow="Oppslag"
          title="Tabellkatalog"
          lead={`Alle ${tables.length} tabeller med kolonner, typer, constraints og indekser.`}
        >
          <div className="portal-prose">
            <BodyLong>
              Katalogen er generert fra samme migrerte skjema som diagrammene. «Obligatorisk» betyr NOT NULL. Hele
              constraint- og indeksdefinisjonen står under hver tabell, også delvise indekser som ikke kan vises i
              ER-diagrammet.
            </BodyLong>
          </div>
          <TableCatalog tables={model.tables} />
        </Section>
      </div>
    </DatabaseModelProvider>
  );
}

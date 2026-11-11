import type { ReactNode } from "react";
import { BodyLong, Heading, Tag } from "@navikt/ds-react";
import { Refs } from "./Refs";
import { BEGREPER, S, VURDERING, type Ref, type Status } from "./data";
import s from "./domain.module.css";

const P = ({ children }: { children: ReactNode }) => <BodyLong spacing>{children}</BodyLong>;
const C = ({ children }: { children: ReactNode }) => <code className="arch-mono">{children}</code>;

function Kilder({ refs }: { refs: readonly Ref[] }) {
  return (
    <BodyLong spacing size="small">
      Kilder: <Refs refs={refs} />.
    </BodyLong>
  );
}

export function OversiktTekst() {
  return (
    <>
      <P>
        Hotsak håndterer søknader og bestillinger om hjelpemidler, med en egen saksmodell for barnebriller. <C>Sak</C>{" "}
        holder felles saksdata. <C>Behandling</C> beskriver arbeidet med saken og utfallet, mens <C>Vedtak</C> holder
        beslutningen og grunnlaget.
      </P>
      <P>
        Diagrammet viser begreper og referanser, ikke tabeller eller en komplett prosess. Hele linjer viser innhold og
        samling i modellene. Stiplede linjer viser ID-referanser. De innebærer ikke at objektene skal lagres som ett
        aggregate.
      </P>
    </>
  );
}

export function OversiktKilder() {
  return <Kilder refs={[S.sak, S.sakBase, S.behandling, S.brev]} />;
}

export function BegreperTabell() {
  return (
    <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Begreper og ansvar, tabell">
      <table className={s.table}>
        <caption>Sentrale begreper i dagens kode</caption>
        <thead>
          <tr>
            <th scope="col">Begrep</th>
            <th scope="col">Ansvar og avgrensning</th>
            <th scope="col">Kilde</th>
          </tr>
        </thead>
        <tbody>
          {BEGREPER.map((b) => (
            <tr key={b.term}>
              <th scope="row">{b.term}</th>
              <td>{b.text}</td>
              <td>
                <Refs refs={b.refs} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GrenserTekst() {
  return (
    <>
      <P>
        I DDD avgrenser en <em>bounded context</em> hvor en modell og ordene i den har samme betydning. Pakker og
        Gradle-moduler gir synlige kodegrenser i Hotsak, men viser ikke at hvert område har sin egen domenemodell eller
        kan endres uavhengig. Områdene i diagrammet er kandidater, ikke vedtatte bounded contexts.
      </P>
    </>
  );
}

export function GrenserEtter() {
  return (
    <>
      <P>
        <C>OppgaveMapper</C> oversetter og beriker eksterne oppgaver med lokale saksdata. Det er en konkret mekanisme som
        skjermer lokale konsumenter fra deler av den eksterne modellen, slik et <em>anti-corruption layer</em> skal
        gjøre. Skjermingen er ikke fullstendig: blant annet <C>Oppgavetilknytning</C> bruker eksternt oppgavekodeverk.
      </P>
      <Kilder refs={[S.oppgaveMapper, S.oppgavetilknytning, S.moduler]} />
      <div className={s.note}>
        <BodyLong spacing>
          <strong>Aggregate er en konsistensgrense, ikke en stor objektgraf.</strong> <C>SakRepository</C> laster
          saksvarianter fra flere DAO-er innenfor en TransactionContext. Det gir et sted å samle lagring og lesing, men
          dokumenterer ikke alene hvilke regler som alltid må gjelde i én transaksjon. Behandling og brev har også egne
          DAO-er og tjenester.
        </BodyLong>
        <Kilder refs={[S.sakRepository, S.behandlingFlere, S.transaction]} />
      </div>
    </>
  );
}

export function DddStyrker() {
  return (
    <>
      <Heading level="3" size="small" spacing>
        Språket følger arbeidet
      </Heading>
      <P>
        Sak, behandlingsutfall, henleggelsesårsak, vilkårsvurdering og totrinnskontroll er faglige navn, ikke generiske
        «record»-objekter. Navn som <C>endreBehandlingsutfall</C> og <C>klargjørBehandlingTilFerdigstilling</C>{" "}
        beskriver handlingene. Dette støtter et <em>ubiquitous language</em>: et felles språk mellom fagpersoner og
        utviklere. Om teamet bruker ordene likt, må fagpersonene bekrefte.
      </P>
      <Kilder refs={[S.utfall, S.behandlingFlere]} />

      <Heading level="3" size="small" spacing>
        Typer skiller identitet og utfall
      </Heading>
      <P>
        <C>SakId</C>, <C>BehandlingId</C>, <C>OppgaveId</C> og <C>BrevId</C> gir egne typer rundt identitetene. De
        reduserer risikoen for å sende en oppgave-ID der en sak-ID forventes. En entitet identifiseres av ID-en, ikke av
        at alle feltene er like. Likhetsreglene ligger i <C>LongId</C> i et eksternt bibliotek.
      </P>
      <P>
        Et sealed <C>Behandlingsutfall</C> gjør de tillatte utfallsvariantene eksplisitte.{" "}
        <C>Totrinnskontroll.TilGodkjenning.ferdigstill</C> returnerer en annen type for ferdig kontroll. Det uttrykker
        en tilstandsovergang i modellen og gir mer presise alternativer enn én klasse med alle felter nullable.
      </P>
      <Kilder refs={[S.sakId, S.utfall, S.totrinnskontrollOvergang]} />

      <Heading level="3" size="small" spacing>
        Særregler har egne modeller
      </Heading>
      <P>
        <C>SakBase</C> skiller Behovsmeldingssak og Barnebrillesak, mens felles data ligger i Sak.{" "}
        <C>VilkårsvurderingBarnebriller</C> beregner samlet resultat fra vilkårene i konstruktøren. Det plasserer
        faglige sammenhenger i navngitte modeller fremfor i en udifferensiert samling felter.
      </P>
      <P>
        Regler finnes også eksplisitt utenfor entitetene. <C>Saksregler</C> kontrollerer at brev for innhenting av
        opplysninger er sendt når dokumentasjon mangler før godkjenning. <C>BehandlingService</C> kontrollerer
        kombinasjonen sakstype og utfall. Dette er <em>domain services</em>. Modellen er ikke gjennomgående en «rich
        domain model», men reglene har konkrete steder å utvikles videre.
      </P>
      <Kilder refs={[S.sakBase, S.vilkarsvurderingKonstruktor, S.saksregler, S.behandlingValider]} />

      <Heading level="3" size="small" spacing>
        Historikk og hendelser bruker egne begreper
      </Heading>
      <P>
        <C>Sakshendelse.VedtakFattet</C>, <C>MidlertidigVedtakHendelse</C> og <C>VedtakFattetHendelse</C> navngir noe
        som har skjedd. Det støtter <em>domain events</em> og skiller midlertidig ferdigstilling fra senere oppfølging.
        Sakshistorikk og periodisert saksstatus gir sporbarhet, men lagringen er ikke dokumentasjon på event sourcing.
      </P>
      <Kilder refs={[S.vedtakServiceMidlertidig, S.sakshendelse, S.saksstatusTidsrom]} />
    </>
  );
}

export function Forbedringer() {
  return (
    <>
      <Heading level="3" size="small" spacing>
        1. Avklar aggregate-grenser og uttrykk invarianter ett sted
      </Heading>
      <P>
        Beskriv hvilke regler Sak, Behandling og Vedtak må håndheve atomisk. En <em>invariant</em> er en regel som må
        holde etter hver tillatt endring. Behandling kan vise hindringer for ferdigstilling, men beregningen ligger i{" "}
        <C>BehandlingDao</C>, mens sakstypekontrollen ligger i BehandlingService. Flytt rene beslutninger til en
        navngitt domeneregel med et eksplisitt beslutningsgrunnlag. Tjenesten henter data og håndterer transaksjonen.
      </P>
      <P>
        Dette gjør reglene testbare uten SQL. Kostnaden er et nytt skille mellom innhenting og beslutning. Ikke flytt
        databaseoppslag inn i entitetene, og ikke gjør hele saksobjektgrafen til ett aggregate for å få «mer DDD».
      </P>
      <Kilder refs={[S.behandlingDaoCall, S.behandlingDaoKalkulering, S.behandlingQuery, S.behandlingValider]} />

      <Heading level="3" size="small" spacing>
        2. Gjør ugyldige utfall vanskeligere å representere
      </Heading>
      <P>
        Avvist bestilling kan konstrueres uten avvisningsårsak, fordi valideringen i bestillingsutfallet er kommentert
        ut. Henleggelse tillater null som årsak. Avklar når disse er lovlige utkast, og skill utkast fra ferdig utfall
        hvis kravene er ulike. Håndhev faglige krav ved riktig overgang, ikke nødvendigvis ved all innlesing av
        historiske data.
      </P>
      <P>
        Gevinsten er færre tilstandskombinasjoner som alle kallere må kontrollere. Strengere typer krever en kompatibel
        plan for eksisterende JSON og lagrede data. Ikke aktiver den utkommenterte valideringen uten å avklare utkast
        og historikk.
      </P>
      <Kilder refs={[S.utfallBestilling, S.utfallHenleggelse]} />

      <Heading level="3" size="small" spacing>
        3. Skill domeneregler fra transport og lagringsformat
      </Heading>
      <P>
        <C>Sak</C> og <C>Vedtak</C> har både <C>toJson()</C> og SQL-radmapping i samme fil. Behandlingsutfall har
        Jackson-annotasjoner, og Vedtaksgrunnlag inneholder JsonNode. Flytt API- og databaseoversetting til egne
        mapper-filer når reglene skal utvikles videre. Gi beslutningskritiske grunnlag egne typer. Behold JSON der
        innholdet er dynamisk, som breveditorens dokument.
      </P>
      <P>
        Dette reduserer koblingen mellom domeneregler og kontraktendringer. Det gir flere mapper-filer og mer
        oversetting. Å skrive om alt til et rent domenelag koster mer enn å starte med reglene som endres ofte.
      </P>
      <Kilder refs={[S.sakJson, S.vedtakJson, S.vedtakRow, S.utfall, S.vedtaksgrunnlag, S.brev]} />

      <Heading level="3" size="small" spacing>
        4. Gjør hendelsespublisering og ekstern oppfølging konsistente
      </Heading>
      <P>
        <C>opprettMidlertidigBehandlingsvedtak</C> oppdaterer databasen, ferdigstiller en ekstern oppgave og publiserer
        en Kafka-hendelse inne i transaksjonsblokken. Koden kommenterer at de eksterne operasjonene ligger utenfor
        transaksjonsgrensen. <C>KafkaService.dispatch</C> sender direkte til produsenten. En databaserollback kan derfor
        ikke rulle tilbake disse effektene.
      </P>
      <P>
        Vurder en <em>transactional outbox</em> for hendelser og idempotent oppfølging av eksterne operasjoner. Da lagres
        tilstand og publiseringsintensjon sammen. Det gir eventual consistency og krever retry, avstemming og
        overvåking. Det gir ikke en distribuert transaksjon eller automatisk «exactly once». Koden har ingen outbox i
        dag; OppgaveService har kommentarer som spør om en.
      </P>
      <Kilder refs={[S.vedtakServiceMidlertidig, S.vedtakServiceEffekter, S.kafkaDispatch, S.oppgaveOutbox]} />

      <Heading level="3" size="small" spacing>
        5. Avklar koblingen mellom behandling og vedtak
      </Heading>
      <P>
        BehandlingService har et kall som returnerer flere behandlinger for én sak. Vedtak refererer til sak, men ikke
        direkte til behandling. Det samme gjelder tabellen <C>vedtak_v1</C>. Avklar om ett vedtak skal tilhøre én
        bestemt behandling, og hvordan tidligere, feilregistrerte og gjeldende vedtak skal identifiseres. Hvis
        behandling eier beslutningen, bør koblingen uttrykkes i modell og lagring fremfor å utledes av felles SakId.
      </P>
      <P>
        En eksplisitt kobling gjør historiske forløp lettere å følge, men krever migrering og avklaring av eldre data.
        Ikke legg til en fremmednøkkel før eierskapet er bestemt.
      </P>
      <Kilder refs={[S.behandlingFlere, S.vedtak, S.vedtakBrevId]} />
    </>
  );
}

const STATUS_VARIANT: Record<Status, "success-moderate" | "warning-moderate" | "error-moderate" | "neutral-moderate"> = {
  Sterk: "success-moderate",
  Delvis: "warning-moderate",
  Svak: "error-moderate",
  Uavklart: "neutral-moderate",
};

export function VurderingTabell() {
  return (
    <div className={s.tableWrap} tabIndex={0} role="region" aria-label="DDD-vurdering, tabell">
      <table className={s.table}>
        <caption>DDD-vurdering ut fra det koden viser</caption>
        <thead>
          <tr>
            <th scope="col">Konsept</th>
            <th scope="col">Status i Hotsak</th>
            <th scope="col">Begrunnelse</th>
            <th scope="col">Kilde</th>
          </tr>
        </thead>
        <tbody>
          {VURDERING.map((v) => (
            <tr key={v.concept}>
              <th scope="row">{v.concept}</th>
              <td>
                <Tag size="xsmall" variant={STATUS_VARIANT[v.status]}>
                  {v.status}
                </Tag>
              </td>
              <td>{v.why}</td>
              <td>
                <Refs refs={v.refs} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Avklaringer() {
  return (
    <>
      <P>
        Koden er kilde til modellen over, men svarer ikke alene på faglig eierskap og fremtidige krav. Disse spørsmålene
        bør avklares før forslagene tas inn i domenelogikken.
      </P>
      <ul className={s.list}>
        <li>
          Betyr «behandling» et selvstendig beslutningsforløp, eller arbeid knyttet til én oppgave? Hva skal skje med
          historikken når oppgaven byttes?
        </li>
        <li>
          Hvilke kombinasjoner av sakstype og utfall er lovlige? BehandlingService avgrenser utfall til BESTILLING og
          SØKNAD, mens BARNEBRILLER har en egen modell og regelsti. <Refs refs={[S.behandlingValider]} />
        </li>
        <li>
          Er bruker- og innsenderopplysninger et historisk øyeblikksbilde for saken, eller skal de følge oppdateringer
          fra PDL?
        </li>
        <li>
          Hvilke regler må holde mellom brev, vedtak og behandling før ferdigstilling, og hvilke kan følges opp
          asynkront?
        </li>
        <li>
          Er brev og distribusjon og barnebrillevurdering egne bounded contexts med egne faglige begreper, eller moduler
          i samme context?
        </li>
        <li>
          Bruker fagpersonene og utviklerne de samme ordene som koden (ubiquitous language)? Vurderingen over kan ikke
          avgjøre det.
        </li>
        <li>
          Hvilke regler må alltid gjelde i én transaksjon, slik at Sak, Behandling og Vedtak kan få tydelige aggregate-grenser?
        </li>
        <li>
          Hvordan sammenligner LongId ID-er? Likhetsreglene ligger i et eksternt bibliotek som ikke er lest her.
        </li>
      </ul>
    </>
  );
}

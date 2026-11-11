import type { Tone } from "../../lib/tones.ts";

/**
 * Eneste datakilde for domenemodellsiden: noder, relasjoner, DDD-roller,
 * kildehenvisninger og vurderinger. Linjenumre gjelder hotsak-api-revisjonen i lib/sources.ts.
 */

export type RefBase = "app" | "core" | "migrations" | "root";
export type Ref = { base: RefBase; file: string; line?: number; end?: number };

const r = (base: RefBase, file: string, line?: number, end?: number): Ref => ({ base, file, line, end });

/** Alle kildehenvisninger. Linjer er kontrollert mot koden. */
export const S = {
  sak: r("app", "sak/Sak.kt", 21, 43),
  sakJson: r("app", "sak/Sak.kt", 59, 75),
  sakBrukerInnsender: r("app", "sak/Sak.kt", 34, 35),
  sakBase: r("app", "sak/SakBase.kt", 11, 19),
  behov: r("app", "sak/Behovsmeldingssak.kt", 8, 12),
  barnebrille: r("app", "sak/Barnebrillesak.kt", 12, 21),
  behandling: r("core", "behandling/Behandling.kt", 10, 22),
  behandlingId: r("core", "behandling/BehandlingId.kt", 10, 13),
  behandlingFlere: r("app", "sak/BehandlingService.kt", 38, 40),
  behandlingValider: r("app", "sak/BehandlingService.kt", 95, 115),
  behandlingDaoCall: r("app", "sak/BehandlingDao.kt", 124, 132),
  behandlingDaoKalkulering: r("app", "sak/BehandlingDao.kt", 443, 451),
  behandlingQuery: r("app", "sak/BehandlingQuery.kt", 25, 50),
  utfall: r("core", "behandling/Behandlingsutfall.kt", 40, 56),
  utfallVedtak: r("core", "behandling/Behandlingsutfall.kt", 58, 61),
  utfallBestilling: r("core", "behandling/Behandlingsutfall.kt", 70, 84),
  utfallHenleggelse: r("core", "behandling/Behandlingsutfall.kt", 104, 110),
  vedtak: r("app", "vedtak/Vedtak.kt", 17, 26),
  vedtakJson: r("app", "vedtak/Vedtak.kt", 29, 39),
  vedtakRow: r("app", "vedtak/Vedtak.kt", 41, 51),
  vedtaksgrunnlag: r("app", "vedtak/Vedtaksgrunnlag.kt", 6, 12),
  oppgavetilknytning: r("app", "oppgave/Oppgavetilknytning.kt", 20, 32),
  journalforingsoppgave: r("app", "oppgave/Oppgavetilknytning.kt", 37, 50),
  saksbehandlingsoppgave: r("app", "oppgave/Oppgavetilknytning.kt", 55, 64),
  oppgaveMapper: r("app", "oppgave/OppgaveMapper.kt", 44, 120),
  oppgaveMapperKlient: r("app", "oppgave/OppgaveMapper.kt", 321, 330),
  oppgaveMapperPerson: r("app", "oppgave/OppgaveMapper.kt", 70, 82),
  oppgaveOutbox: r("app", "oppgave/OppgaveService.kt", 180, 185),
  brev: r("app", "brev/Brev.kt", 20, 41),
  brevStatus: r("app", "brev/Brev.kt", 56, 63),
  brevId: r("app", "brev/Brev.kt", 37),
  brevServiceSaf: r("app", "brev/BrevService.kt", 328, 334),
  brevServiceKafka: r("app", "brev/BrevService.kt", 525, 536),
  brevdistribusjon: r("app", "brev/Brevdistribusjon.kt", 23, 55),
  brevdistribusjonJournalpost: r("app", "brev/Brevdistribusjon.kt", 35, 41),
  brevdistribusjonStatus: r("app", "brev/Brevdistribusjon.kt", 56, 58),
  vilkarsvurdering: r("app", "vilkarsvurdering/VilkårsvurderingBarnebriller.kt", 9, 29),
  vilkarsvurderingKonstruktor: r("app", "vilkarsvurdering/VilkårsvurderingBarnebriller.kt", 18, 29),
  totrinnskontroll: r("app", "sak/Totrinnskontroll.kt", 9, 12),
  totrinnskontrollOvergang: r("app", "sak/Totrinnskontroll.kt", 35, 53),
  saksregler: r("app", "sak/Saksregler.kt", 15, 53),
  sakRepository: r("app", "sak/SakRepository.kt", 13, 21),
  sakRepositoryBehov: r("app", "sak/SakRepository.kt", 22, 34),
  sakRepositoryBarnebrille: r("app", "sak/SakRepository.kt", 36, 54),
  transaction: r("app", "database/Transaction.kt", 3, 6),
  sakId: r("core", "sak/SakId.kt", 10, 18),
  sakshendelse: r("app", "sak/Sakshendelse.kt", 6, 30),
  vedtakServiceMidlertidig: r("app", "vedtak/VedtakService.kt", 86, 149),
  vedtakServiceEffekter: r("app", "vedtak/VedtakService.kt", 125, 147),
  vedtakServiceGrunnlag: r("app", "vedtak/VedtakService.kt", 400, 404),
  midlertidigHendelse: r("app", "vedtak/MidlertidigVedtakHendelse.kt", 14, 15),
  saksstatusTidsrom: r("migrations", "V216__saksstatus_constraint_v2.sql", 1, 13),
  vedtakBrevId: r("migrations", "V199__brev_v1.sql", 64, 65),
  kafkaDispatch: r("app", "kafka/KafkaService.kt", 20, 23),
  kafkaTopic: r("app", "kafka/KafkaService.kt", 40),
  hjelpemiddelFinn: r("app", "hjelpemiddel/HjelpemiddelService.kt", 137, 140),
  eksterntApi: r("app", "eksternt/DefaultEksterntApiDataProvider.kt", 29, 36),
  integrasjoner: r("app", "integrations/IntegrationModule.kt", 28, 41),
  moduler: r("root", "README.md", 20, 32),
  gradleModuler: r("root", "settings.gradle.kts", 15, 25),
} as const satisfies Record<string, Ref>;

export const refKey = (x: Ref) => `${x.base}:${x.file}`;
const noLine = (x: Ref): Ref => ({ base: x.base, file: x.file });

// ---------------------------------------------------------------------------
// Generell grafmodell
// ---------------------------------------------------------------------------

export type DddRoleName = "Entity" | "Value object" | "Aggregate-kandidat" | "ACL";

export type DddRole = {
  role: DddRoleName;
  /** «kandidat» betyr at koden viser mønsteret, men at teamet ikke har bekreftet rollen. */
  certainty: "belagt" | "kandidat";
  basis: string;
  refs: Ref[];
};

export type GNode = {
  id: string;
  label: string;
  sub?: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
  /** Ekstern modell eller referert begrep som Hotsak ikke eier. Tegnes med stiplet kant. */
  external?: boolean;
  desc: string;
  /** Funn i koden som ikke er en DDD-rolle, for eksempel sealed-hierarki. */
  kode?: string[];
  refs: Ref[];
  roles?: DddRole[];
  /** Trinn i et steg-for-steg-diagram. */
  step?: number;
  acl?: boolean;
};

export type LabelPos = [x: number, y: number, anchor: "start" | "middle" | "end"];

export type GEdge = {
  id: string;
  from: string;
  to: string;
  kind: string;
  label?: string;
  /** Hjørnepunkter. Første og siste punkt ligger på kanten av boksene. */
  pts: [number, number][];
  lp?: LabelPos;
  refs?: Ref[];
  step?: number;
  acl?: boolean;
};

export type GGroup = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  labelAt: [number, number];
  dashed?: boolean;
  tone?: Tone;
};

export type EdgeKind = { id: string; label: string; short: string; dashed: boolean };

// ---------------------------------------------------------------------------
// 1. Konseptuell modell
// ---------------------------------------------------------------------------

export const DOMAIN_KINDS: EdgeKind[] = [
  { id: "contains", label: "Inneholder eller samler", short: "Inneholder", dashed: false },
  { id: "ref", label: "ID-referanse", short: "ID-referanse", dashed: true },
];

export const DOMAIN_VIEW = { w: 1260, h: 600 };

export const DOMAIN_GROUPS: GGroup[] = [
  {
    id: "saksmodeller",
    label: "Saksmodeller (ikke en påstand om aggregate-grenser)",
    x: 500,
    y: 20,
    w: 745,
    h: 560,
    labelAt: [516, 566],
  },
];

const dn = (
  id: string,
  label: string,
  sub: string[],
  x: number,
  y: number,
  tone: Tone,
  rest: Pick<GNode, "desc" | "refs"> & Partial<GNode>,
  h = 60,
): GNode => ({ id, label, sub, x, y, w: 180, h, tone, ...rest });

export const DOMAIN_NODES: GNode[] = [
  dn(
    "sak",
    "Sak",
    ["Identitet, sakstype, status,", "kilde og kanal"],
    520,
    252,
    "accent",
    {
      desc: "Identitet, sakstype, søknadsreferanse, status, bruker, innsender og ansvarlig enhet. Søknaden er representert med ID og metadata, ikke som et komplett søknadsobjekt.",
      kode: ["Holder felles data for sakstypene."],
      refs: [S.sak],
      roles: [
        {
          role: "Entity",
          certainty: "belagt",
          basis: "Saken identifiseres av SakId, ikke av feltverdiene.",
          refs: [S.sak, S.sakId],
        },
      ],
    },
    90,
  ),
  dn("sakbase", "SakBase", ["Lukket sett saksmodeller"], 1050, 270, "accent", {
    desc: "Lukket (sealed) grensesnitt for saksvariantene. Gir sak, sakId, søknadId og brukerens fødselsnummer til alle varianter.",
    kode: ["sealed interface: kompilatoren kjenner alle varianter."],
    refs: [S.sakBase],
  }),
  dn("behov", "Behovsmeldingssak", ["Sak, endrede hjelpemidler", "og valgfritt vedtak"], 790, 170, "accent", {
    desc: "Samler felles sak, endrede hjelpemidler og et valgfritt vedtak. Saksmodellen skiller seg fra barnebrillesaken uten at alle særfeltene ligger i Sak. Vedtaket er med i modellen, men tegnet uten egen kobling i diagrammet.",
    refs: [S.behov],
    roles: [
      {
        role: "Aggregate-kandidat",
        certainty: "kandidat",
        basis:
          "SakRepository laster og lagrer varianten fra flere DAO-er i én TransactionContext. Det gir et samlepunkt, men dokumenterer ikke hvilke regler som alltid må gjelde i én transaksjon.",
        refs: [S.sakRepositoryBehov],
      },
    ],
  }),
  dn("brille", "Barnebrillesak", ["Sak, steg, vilkår, kontroll", "og vedtak"], 790, 370, "accent", {
    desc: "Samler steg, journalposter, vilkårsgrunnlag, vilkårsvurdering, utbetalingsmottaker, totrinnskontroll og vedtak. Vedtaket er med i modellen, men tegnet uten egen kobling i diagrammet.",
    refs: [S.barnebrille],
    roles: [
      {
        role: "Aggregate-kandidat",
        certainty: "kandidat",
        basis:
          "SakRepository henter varianten fra flere DAO-er i én TransactionContext. Samlepunktet er synlig, men teamet har ikke definert konsistensgrensen.",
        refs: [S.sakRepositoryBarnebrille],
      },
    ],
  }),
  dn("roller", "Bruker og innsender", ["Roller knyttet til saken"], 520, 400, "accent", {
    desc: "Sak har bruker og innsender som egne typer. Rollene beskriver hvem saken gjelder og hvem som sendte den inn.",
    refs: [S.sakBrukerInnsender],
  }),
  dn("endret", "Endrede hjelpemidler", ["Liste med endrede artikler"], 790, 54, "accent", {
    desc: "Behovsmeldingssaken samler en liste med endrede hjelpemidler.",
    refs: [S.behov],
  }),
  dn("vilkar", "Vilkårsvurdering", ["Grunnlag og resultat", "(barnebriller)"], 790, 490, "meta-lime", {
    desc: "Vilkårsvurderingen samler vilkår og beregnet resultat. Vilkårsgrunnlaget hører til barnebrillesaken.",
    kode: ["Sekundærkonstruktøren beregner resultatet fra vilkårene (vilkår.evaluer())."],
    refs: [S.vilkarsvurdering, S.vilkarsvurderingKonstruktor],
  }),
  dn("kontroll", "Totrinnskontroll", ["TilGodkjenning /", "Ferdigstilling"], 1050, 385, "meta-lime", {
    desc: "Totrinnskontroll skiller TilGodkjenning fra Ferdigstilling. Den er kontroll av beslutningen, ikke selve den faglige vurderingen.",
    kode: ["sealed interface. TilGodkjenning.ferdigstill(...) returnerer Ferdigstilling: en tilstandsovergang uttrykt som ny type."],
    refs: [S.totrinnskontroll, S.totrinnskontrollOvergang],
  }),
  dn("behandling", "Behandling", ["Operasjoner, utfall og", "ferdigstilling"], 280, 123, "info", {
    desc: "Refererer til sak og oppgave. Har utfall, ferdigstillingstidspunkter og beregnede operasjoner og hindringer. Flere behandlinger kan hentes for én sak.",
    kode: ["Hindringer for ferdigstilling beregnes i BehandlingDao, ikke i modellen."],
    refs: [S.behandling, S.behandlingFlere, S.behandlingDaoKalkulering],
    roles: [
      {
        role: "Entity",
        certainty: "belagt",
        basis: "Behandlingen har egen identitet (BehandlingId) og endres over tid: utfall, midlertidig og endelig ferdigstilling.",
        refs: [S.behandling, S.behandlingId],
      },
    ],
  }),
  dn("utfall", "Behandlingsutfall", ["Vedtak / bestilling /", "henleggelse / overføring"], 10, 57, "info", {
    desc: "Et lukket sett varianter: vedtak, bestilling, henleggelse og overføring. Bestillingsresultat er ikke det samme som vedtaksstatus.",
    kode: [
      "sealed interface med flere varianter.",
      "Avvist bestilling kan konstrueres uten avvisningsårsak: valideringen er kommentert ut.",
      "Henleggelse tillater null som årsak.",
    ],
    refs: [S.utfall, S.utfallBestilling, S.utfallHenleggelse],
    roles: [
      {
        role: "Value object",
        certainty: "kandidat",
        basis:
          "Variantene er data classes uten egen ID, så to like utfall er utskiftbare. Teksten kaller dem ikke value objects; rollen er utledet fra koden.",
        refs: [S.utfallVedtak],
      },
    ],
  }),
  dn("oppgave", "Ekstern oppgave", ["Lokal Oppgavetilknytning"], 10, 183, "neutral", {
    external: true,
    desc: "Lokal kobling til en ekstern oppgave. Journalføringsoppgave krever journalpost og kan mangle sak. Saksbehandlingsoppgave krever sak. Den lokale koblingen er ikke hele Oppgave-API-modellen.",
    kode: ["sealed interface Oppgavetilknytning med to varianter. Bruker eksternt oppgavekodeverk."],
    refs: [S.oppgavetilknytning, S.journalforingsoppgave, S.saksbehandlingsoppgave],
  }),
  dn("vedtak", "Vedtak", ["Status, dato og saksbehandler"], 280, 450, "success", {
    desc: "Vedtak har status og dato, saksbehandler og referanser til sak og søknad. Dagens Vedtak-modell har ikke en BehandlingId.",
    kode: ["toJson() og SQL-radmapping (toVedtak) ligger i samme fil som modellen."],
    refs: [S.vedtak, S.vedtakJson, S.vedtakRow],
    roles: [
      {
        role: "Entity",
        certainty: "belagt",
        basis: "Vedtaket har egen identitet (VedtakId) og egen status.",
        refs: [S.vedtak],
      },
    ],
  }),
  dn("grunnlag", "Vedtaksgrunnlag", ["Lagrer beslutningsdata"], 10, 450, "success", {
    desc: "Vedtaksgrunnlaget lagrer beslutningsdata som type og JSON-innhold.",
    kode: ["Innholdet er JsonNode, så grunnlaget har ikke en egen type per grunnlagstype."],
    refs: [S.vedtaksgrunnlag],
    roles: [
      {
        role: "Value object",
        certainty: "kandidat",
        basis: "Data class (type og data) uten egen ID. Rollen er utledet fra koden; teksten kaller den ikke value object.",
        refs: [S.vedtaksgrunnlag],
      },
    ],
  }),
  dn("brev", "Brev", ["Innhold og ferdigstilling"], 280, 270, "meta-purple", {
    desc: "Brev holder innhold og ferdigstilling. Ett brev har en liste med distribusjoner. Brevstatus utledes fra innholdets og distribusjonenes tilstand.",
    kode: ["brevstatus er en beregnet egenskap."],
    refs: [S.brev, S.brevStatus],
    roles: [
      {
        role: "Entity",
        certainty: "belagt",
        basis: "Brevet har egen identitet (BrevId) og endres fra utkast til ferdigstilt og distribuert.",
        refs: [S.brevId],
      },
    ],
  }),
  dn("distribusjon", "Brevdistribusjon", ["Journalføring og utsending"], 10, 270, "meta-purple", {
    desc: "Distribusjonen holder oppfølging av journalføring og utsending for én mottaker.",
    kode: ["isJournalført og isDistribuert utledes fra tidspunktene for journalføring og distribusjon."],
    refs: [S.brevdistribusjon, S.brevdistribusjonStatus],
    roles: [
      {
        role: "Entity",
        certainty: "belagt",
        basis: "Distribusjonen har egen identitet (BrevdistribusjonId).",
        refs: [S.brevdistribusjon],
      },
    ],
  }),
  dn("journal", "Journalpost", ["Ekstern arkivreferanse"], 10, 360, "neutral", {
    external: true,
    desc: "Distribusjonen peker på journalposten med JournalpostId. Journalposten ligger i arkivet.",
    refs: [S.brevdistribusjonJournalpost],
  }),
];

export const DOMAIN_EDGES: GEdge[] = [
  { id: "sakbase-behov", from: "sakbase", to: "behov", kind: "contains", label: "variant", pts: [[1050, 285], [1010, 285], [1010, 197], [970, 197]], lp: [1016, 245, "start"], refs: [S.sakBase] },
  { id: "sakbase-brille", from: "sakbase", to: "brille", kind: "contains", label: "variant", pts: [[1050, 309], [1010, 309], [1010, 397], [970, 397]], lp: [1016, 355, "start"], refs: [S.sakBase] },
  { id: "behov-sak", from: "behov", to: "sak", kind: "contains", label: "inneholder", pts: [[790, 197], [745, 197], [745, 275], [700, 275]], lp: [751, 245, "start"], refs: [S.behov] },
  { id: "brille-sak", from: "brille", to: "sak", kind: "contains", label: "inneholder", pts: [[790, 397], [745, 397], [745, 319], [700, 319]], lp: [751, 360, "start"], refs: [S.barnebrille] },
  { id: "sak-roller", from: "sak", to: "roller", kind: "contains", label: "har", pts: [[610, 342], [610, 400]], lp: [616, 376, "start"], refs: [S.sakBrukerInnsender] },
  { id: "behov-endret", from: "behov", to: "endret", kind: "contains", label: "samler", pts: [[880, 170], [880, 114]], lp: [886, 146, "start"], refs: [S.behov] },
  { id: "brille-vilkar", from: "brille", to: "vilkar", kind: "contains", label: "samler", pts: [[880, 430], [880, 490]], lp: [886, 465, "start"], refs: [S.barnebrille] },
  { id: "brille-kontroll", from: "brille", to: "kontroll", kind: "contains", label: "samler", pts: [[970, 412], [1050, 412]], lp: [1010, 426, "middle"], refs: [S.barnebrille] },
  { id: "behandling-utfall", from: "behandling", to: "utfall", kind: "contains", label: "har", pts: [[280, 140], [235, 140], [235, 87], [190, 87]], lp: [241, 115, "start"], refs: [S.behandling] },
  { id: "behandling-oppgave", from: "behandling", to: "oppgave", kind: "ref", label: "OppgaveId", pts: [[280, 160], [235, 160], [235, 213], [190, 213]], lp: [241, 195, "start"], refs: [S.behandling] },
  { id: "behandling-sak", from: "behandling", to: "sak", kind: "ref", label: "SakId", pts: [[460, 150], [490, 150], [490, 275], [520, 275]], lp: [484, 200, "end"], refs: [S.behandling] },
  { id: "vedtak-sak", from: "vedtak", to: "sak", kind: "ref", label: "SakId", pts: [[460, 480], [490, 480], [490, 319], [520, 319]], lp: [484, 400, "end"], refs: [S.vedtak] },
  { id: "vedtak-grunnlag", from: "vedtak", to: "grunnlag", kind: "contains", label: "har", pts: [[280, 480], [190, 480]], lp: [235, 474, "middle"], refs: [S.vedtak] },
  { id: "brev-sak", from: "brev", to: "sak", kind: "ref", label: "SakId", pts: [[460, 297], [520, 297]], lp: [490, 291, "middle"], refs: [S.brev] },
  { id: "brev-behandling", from: "brev", to: "behandling", kind: "ref", label: "valgfri BehandlingId", pts: [[370, 270], [370, 183]], lp: [376, 232, "start"], refs: [S.brev] },
  { id: "brev-distribusjon", from: "brev", to: "distribusjon", kind: "contains", label: "har", pts: [[280, 297], [190, 297]], lp: [235, 291, "middle"], refs: [S.brev] },
  { id: "distribusjon-journal", from: "distribusjon", to: "journal", kind: "ref", label: "JournalpostId", pts: [[100, 330], [100, 360]], lp: [106, 349, "start"], refs: [S.brevdistribusjonJournalpost] },
];

// ---------------------------------------------------------------------------
// 2. Modellgrenser
// ---------------------------------------------------------------------------

export const CONTEXT_KINDS: EdgeKind[] = [
  { id: "intern", label: "Intern kobling mellom ansvarsområder", short: "Intern", dashed: false },
  { id: "ekstern", label: "Integrasjon mot ekstern modell", short: "Ekstern", dashed: true },
];

export const CONTEXT_VIEW = { w: 1110, h: 620 };

export const CONTEXT_GROUPS: GGroup[] = [
  {
    id: "hotsak",
    label: "Hotsak: ett API, interne ansvarsområder",
    x: 260,
    y: 20,
    w: 530,
    h: 540,
    labelAt: [276, 546],
  },
];

const cn = (
  id: string,
  label: string,
  sub: string[],
  x: number,
  y: number,
  tone: Tone,
  rest: Pick<GNode, "desc" | "refs"> & Partial<GNode>,
): GNode => ({ id, label, sub, x, y, w: 190, h: 64, tone, ...rest });

export const CONTEXT_NODES: GNode[] = [
  cn("c-sak", "Sak, behandling, vedtak", ["Saksmodeller, behandling,", "vedtak og oppgavekobling"], 290, 270, "accent", {
    desc: "Kjernen i Hotsak: sak, behandling, vedtak og lokal kobling til oppgaver. Kandidat til bounded context, ikke vedtatt.",
    refs: [S.sak, S.behandling, S.vedtak],
  }),
  cn("c-vilkar", "Vilkårsvurdering", ["Barnebriller"], 570, 70, "meta-lime", {
    desc: "Eget pakkeområde for vilkårsgrunnlag og vilkårsvurdering for barnebriller. Kandidat til bounded context, ikke vedtatt.",
    refs: [S.vilkarsvurdering],
  }),
  cn("c-brev", "Brev og distribusjon", ["Innhold, ferdigstilling,", "journalføring og utsending"], 570, 270, "meta-purple", {
    desc: "Eget pakkeområde for brev og distribusjon, med egne DAO-er og tjenester. Kandidat til bounded context, ikke vedtatt.",
    refs: [S.brev, S.brevdistribusjon],
  }),
  cn("c-mapper", "OppgaveMapper", ["Lokal visningsmodell", "ACL mot Oppgave-API"], 570, 440, "warning", {
    acl: true,
    desc: "Oversetter og beriker eksterne oppgaver med lokale saksdata. Skjermer lokale konsumenter fra deler av den eksterne modellen, slik et anti-corruption layer skal. Skjermingen er ikke fullstendig: Oppgavetilknytning bruker eksternt oppgavekodeverk.",
    refs: [S.oppgaveMapper, S.oppgavetilknytning],
    roles: [
      {
        role: "ACL",
        certainty: "kandidat",
        basis: "Konkret oversettelse fra ekstern oppgave til intern Oppgave. Skjermingen er delvis.",
        refs: [S.oppgaveMapper, S.oppgavetilknytning],
      },
    ],
  }),
  cn("x-graphql", "Eksterne konsumenter", ["GraphQL via api-eksternt"], 20, 270, "neutral", {
    external: true,
    desc: "api-eksternt er et GraphQL-API for konsumenter utenfor DigiHoT. Data hentes fra blant annet sak, behandling, oppgave og vedtak.",
    refs: [S.moduler, S.eksterntApi],
  }),
  cn("x-fh", "FinnHjelpemiddel", ["Produktdata"], 900, 70, "neutral", {
    external: true,
    desc: "Hotsak henter produktdata for hjelpemidler fra FinnHjelpemiddel via en egen klient.",
    refs: [S.hjelpemiddelFinn],
  }),
  cn("x-oebs", "OeBS", ["Hjelpemiddeloversikt", "og ordre"], 900, 168, "neutral", {
    external: true,
    desc: "Hotsak kaller OeBS for å hente en brukers hjelpemiddeloversikt når vedtaksgrunnlag opprettes.",
    refs: [S.vedtakServiceGrunnlag, S.integrasjoner],
  }),
  cn("x-arkiv", "SAF / Joark", ["Journalposter og dokumenter"], 900, 270, "neutral", {
    external: true,
    desc: "Hotsak leser journalposter og dokumenter fra SAF. Journalføringen av ferdigstilte brev utløses av en hendelse på Kafka.",
    refs: [S.brevServiceSaf, S.brevServiceKafka],
  }),
  cn("x-kafka", "Kafka", ["Hendelser til andre", "DigiHoT-tjenester"], 900, 358, "neutral", {
    external: true,
    desc: "Hotsak publiserer hendelser som MidlertidigVedtakHendelse og BrevdistribusjonOpprettetHendelse til andre tjenester.",
    refs: [S.kafkaDispatch, S.kafkaTopic, S.vedtakServiceEffekter],
  }),
  cn("x-oppgave", "Oppgave-API", ["Ekstern arbeidsfordeling"], 900, 440, "neutral", {
    external: true,
    desc: "Eksternt API for oppgaver og arbeidsfordeling. Hotsak lagrer bare en lokal Oppgavetilknytning.",
    refs: [S.oppgaveMapperKlient, S.oppgavetilknytning],
  }),
  cn("x-pdl", "PDL", ["Personopplysninger"], 900, 530, "neutral", {
    external: true,
    desc: "Persondataløsningen. OppgaveMapper henter personopplysninger via persontjenesten.",
    refs: [S.oppgaveMapperPerson],
  }),
];

export const CONTEXT_EDGES: GEdge[] = [
  { id: "sak-vilkar", from: "c-sak", to: "c-vilkar", kind: "intern", label: "bruker", pts: [[350, 270], [350, 102], [570, 102]], lp: [460, 96, "middle"], refs: [S.sakRepositoryBarnebrille] },
  { id: "sak-brev", from: "c-sak", to: "c-brev", kind: "intern", label: "koordinerer", pts: [[480, 302], [570, 302]], lp: [525, 296, "middle"], refs: [S.saksregler] },
  { id: "sak-mapper", from: "c-sak", to: "c-mapper", kind: "intern", label: "oppgavetilknytning", pts: [[330, 334], [330, 472], [570, 472]], lp: [450, 466, "middle"], refs: [S.oppgaveMapper] },
  { id: "graphql-sak", from: "x-graphql", to: "c-sak", kind: "ekstern", label: "leser", pts: [[210, 302], [290, 302]], lp: [250, 296, "middle"], refs: [S.eksterntApi] },
  { id: "sak-fh", from: "c-sak", to: "x-fh", kind: "ekstern", label: "klient", pts: [[310, 270], [310, 46], [850, 46], [850, 102], [900, 102]], lp: [580, 40, "middle"], refs: [S.hjelpemiddelFinn] },
  { id: "sak-oebs", from: "c-sak", to: "x-oebs", kind: "ekstern", label: "OeBS-klient", pts: [[480, 285], [530, 285], [530, 200], [900, 200]], lp: [715, 194, "middle"], refs: [S.vedtakServiceGrunnlag] },
  { id: "brev-arkiv", from: "c-brev", to: "x-arkiv", kind: "ekstern", label: "leser (SAF)", pts: [[760, 302], [900, 302]], lp: [830, 296, "middle"], refs: [S.brevServiceSaf] },
  { id: "brev-kafka", from: "c-brev", to: "x-kafka", kind: "ekstern", label: "hendelse", pts: [[760, 322], [830, 322], [830, 378], [900, 378]], lp: [865, 372, "middle"], refs: [S.brevServiceKafka] },
  { id: "sak-kafka", from: "c-sak", to: "x-kafka", kind: "ekstern", label: "hendelser", pts: [[480, 319], [510, 319], [510, 402], [900, 402]], lp: [715, 396, "middle"], refs: [S.vedtakServiceEffekter, S.kafkaDispatch] },
  { id: "mapper-oppgave", from: "c-mapper", to: "x-oppgave", kind: "ekstern", label: "klient", pts: [[760, 462], [900, 462]], lp: [830, 456, "middle"], acl: true, refs: [S.oppgaveMapperKlient] },
  { id: "mapper-pdl", from: "c-mapper", to: "x-pdl", kind: "ekstern", label: "persontjeneste", pts: [[760, 490], [800, 490], [800, 562], [900, 562]], lp: [850, 556, "middle"], acl: true, refs: [S.oppgaveMapperPerson] },
];

// ---------------------------------------------------------------------------
// 3. Forslag: beslutning adskilt fra koordinering
// ---------------------------------------------------------------------------

export const PROPOSAL_KINDS: EdgeKind[] = [{ id: "flyt", label: "Flyt", short: "Flyt", dashed: false }];

export const PROPOSAL_VIEW = { w: 1000, h: 400 };

const pn = (
  id: string,
  label: string,
  sub: string[],
  x: number,
  y: number,
  tone: Tone,
  step: number,
  rest: Pick<GNode, "desc" | "refs">,
): GNode => ({ id, label, sub, x, y, w: 190, h: 64, tone, step, ...rest });

export const TODAY_GROUPS: GGroup[] = [
  {
    id: "tx",
    label: "transaction { … } i opprettMidlertidigBehandlingsvedtak",
    x: 10,
    y: 20,
    w: 965,
    h: 350,
    labelAt: [26, 44],
  },
  {
    id: "utenfor",
    label: "Effekter utenfor transaksjonsgrensen",
    x: 735,
    y: 66,
    w: 230,
    h: 290,
    labelAt: [750, 342],
    dashed: true,
    tone: "warning",
  },
];

export const TODAY_NODES: GNode[] = [
  pn("t-hent", "Hent data", ["Sak, artikler og grunnlag", "fra DAO-er og OeBS"], 30, 90, "info", 1, {
    desc: "Tjenesten henter saken, artikler og bygger vedtaksgrunnlag, blant annet med et kall til OeBS, før noe lagres.",
    refs: [S.vedtakServiceMidlertidig, S.vedtakServiceGrunnlag],
  }),
  pn("t-lagre", "Lagre vedtak og hendelse", ["Vedtak og Sakshendelse", "VedtakFattet"], 270, 90, "success", 2, {
    desc: "Tjenesten oppretter vedtaket og lagrer sakshendelsen i databasen.",
    refs: [S.vedtakServiceMidlertidig, S.sakshendelse],
  }),
  pn("t-klargjor", "Klargjør behandling", ["Midlertidig ferdigstilling", "i BehandlingService"], 510, 90, "info", 3, {
    desc: "Behandlingen settes til midlertidig ferdigstilt. Sakstypekontroll ligger i BehandlingService og beregning av hindringer i BehandlingDao, ikke i en egen domeneregel.",
    refs: [S.behandlingDaoKalkulering, S.behandlingValider],
  }),
  pn("t-oppgave", "Ferdigstill ekstern oppgave", ["Kall til Oppgave-API"], 755, 90, "warning", 4, {
    desc: "Oppgaven ferdigstilles i et eksternt system. Koden kommenterer at dette gjøres til slutt fordi det medfører endringer utenfor transaksjonsgrensen. En databaserollback kan ikke reversere det.",
    refs: [S.vedtakServiceEffekter],
  }),
  pn("t-kafka", "Publiser hendelse på Kafka", ["MidlertidigVedtakHendelse"], 755, 240, "warning", 5, {
    desc: "Hendelsen sendes direkte til Kafka-produsenten inne i transaksjonsblokken. En rollback kan ikke trekke tilbake meldingen.",
    refs: [S.vedtakServiceEffekter, S.kafkaDispatch, S.midlertidigHendelse],
  }),
];

export const TODAY_EDGES: GEdge[] = [
  { id: "t1", from: "t-hent", to: "t-lagre", kind: "flyt", pts: [[220, 122], [270, 122]], step: 2 },
  { id: "t2", from: "t-lagre", to: "t-klargjor", kind: "flyt", pts: [[460, 122], [510, 122]], step: 3 },
  { id: "t3", from: "t-klargjor", to: "t-oppgave", kind: "flyt", pts: [[700, 122], [755, 122]], step: 4 },
  { id: "t4", from: "t-oppgave", to: "t-kafka", kind: "flyt", pts: [[850, 154], [850, 240]], step: 5 },
];

export const PROPOSAL_GROUPS: GGroup[] = [
  { id: "forslag", label: "Forslag, ikke dagens kode", x: 10, y: 10, w: 980, h: 380, labelAt: [26, 34], dashed: true, tone: "accent" },
];

export const PROPOSAL_NODES: GNode[] = [
  pn("p-tjeneste", "Application service", ["Henter data og", "koordinerer"], 30, 140, "info", 1, {
    desc: "Tjenesten henter data og håndterer transaksjonen, men tar ikke selve beslutningen. Dagens VedtakService henter, avgjør og lagrer i samme metode.",
    refs: [S.vedtakServiceMidlertidig],
  }),
  pn("p-grunnlag", "Beslutningsgrunnlag", ["Sakstype, utfall,", "brev og notater"], 270, 140, "info", 2, {
    desc: "Et eksplisitt grunnlag med det regelen trenger, uten databasetilgang. I dag hentes slike opplysninger med SQL i BehandlingDao og BehandlingQuery.",
    refs: [S.behandlingQuery, S.behandlingDaoCall],
  }),
  pn("p-regel", "Ren domeneregel", ["Tillatt operasjon /", "navngitte hindringer"], 510, 140, "meta-lime", 3, {
    desc: "En navngitt regel uten SQL og I/O som returnerer tillatt operasjon eller hindringer. Gjør reglene testbare uten database. Dagens sakstypekontroll ligger i BehandlingService og beregning av hindringer i BehandlingDao.",
    refs: [S.behandlingValider, S.behandlingDaoKalkulering],
  }),
  pn("p-db", "Én databasetransaksjon", ["Tilstand + outbox-hendelse"], 750, 140, "success", 5, {
    desc: "Tilstanden og hendelsen som skal publiseres lagres sammen (transactional outbox). Mønsteret finnes ikke i dagens kode; OppgaveService har kommentarer som spør om en outbox.",
    refs: [S.oppgaveOutbox, S.vedtakServiceEffekter],
  }),
  pn("p-etter", "Etter commit", ["Publisering og idempotent", "oppfølging"], 750, 300, "warning", 6, {
    desc: "Publisering til Kafka og oppfølging av eksterne operasjoner skjer etter commit og må tåle gjentakelse. Gir eventual consistency og krever retry, avstemming og overvåking. Ikke en distribuert transaksjon og ikke automatisk «exactly once».",
    refs: [S.kafkaDispatch, S.vedtakServiceEffekter],
  }),
];

export const PROPOSAL_EDGES: GEdge[] = [
  { id: "f1", from: "p-tjeneste", to: "p-grunnlag", kind: "flyt", pts: [[220, 172], [270, 172]], step: 2 },
  { id: "f2", from: "p-grunnlag", to: "p-regel", kind: "flyt", pts: [[460, 172], [510, 172]], step: 3 },
  { id: "f3", from: "p-regel", to: "p-db", kind: "flyt", label: "tillatt", pts: [[700, 172], [750, 172]], lp: [725, 166, "middle"], step: 4 },
  { id: "f4", from: "p-regel", to: "p-tjeneste", kind: "flyt", label: "hindringer", pts: [[605, 204], [605, 260], [125, 260], [125, 204]], lp: [365, 254, "middle"], step: 4 },
  { id: "f5", from: "p-db", to: "p-etter", kind: "flyt", label: "etter commit", pts: [[845, 204], [845, 300]], lp: [851, 256, "start"], step: 6 },
];

export const PROPOSAL_STEPS: string[] = [
  "Tjenesten henter data.",
  "Dataene samles i et beslutningsgrunnlag.",
  "En ren domeneregel avgjør.",
  "Regelen gir enten tillatt operasjon eller navngitte hindringer, som tjenesten viser tilbake.",
  "Tilstand og outbox-hendelse lagres i én databasetransaksjon.",
  "Publisering og oppfølging skjer etter commit og er idempotent.",
];

// ---------------------------------------------------------------------------
// Begreper og ansvar (tabell)
// ---------------------------------------------------------------------------

export type Begrep = { term: string; text: string; refs: Ref[] };

export const BEGREPER: Begrep[] = [
  { term: "Sak", text: DOMAIN_NODES[0].desc, refs: [noLine(S.sak)] },
  {
    term: "Behovsmeldingssak",
    text: "Samler felles sak, endrede hjelpemidler og et valgfritt vedtak. Saksmodellen skiller seg fra barnebrillesaken uten å legge alle særfeltene i Sak.",
    refs: [noLine(S.behov)],
  },
  {
    term: "Barnebrillesak",
    text: "Samler steg, journalposter, vilkårsgrunnlag, vilkårsvurdering, utbetalingsmottaker, totrinnskontroll og vedtak.",
    refs: [noLine(S.barnebrille)],
  },
  {
    term: "Behandling",
    text: "Refererer til sak og oppgave. Har utfall, ferdigstillingstidspunkter og beregnede operasjoner og hindringer. Flere behandlinger kan hentes for én sak.",
    refs: [noLine(S.behandling), S.behandlingFlere],
  },
  {
    term: "Behandlingsutfall",
    text: "Et lukket sett varianter: vedtak, bestilling, henleggelse og overføring. Bestillingsresultat er ikke det samme som vedtaksstatus.",
    refs: [noLine(S.utfall)],
  },
  {
    term: "Vedtak og vedtaksgrunnlag",
    text: "Vedtak har status og dato, saksbehandler og referanser til sak og søknad. Vedtaksgrunnlaget lagrer beslutningsdata. Dagens Vedtak-modell har ikke en BehandlingId.",
    refs: [noLine(S.vedtak), noLine(S.vedtaksgrunnlag)],
  },
  {
    term: "Oppgavetilknytning",
    text: "Lokal kobling til en ekstern oppgave. Journalføringsoppgave krever journalpost og kan mangle sak. Saksbehandlingsoppgave krever sak. Den lokale koblingen er ikke hele Oppgave-API-modellen.",
    refs: [noLine(S.oppgavetilknytning)],
  },
  {
    term: "Brev og distribusjon",
    text: "Brev holder innhold og ferdigstilling. Distribusjon holder oppfølging av journalføring og utsending. Ett brev har en liste med distribusjoner. Brevstatus utledes fra innholdets og distribusjonenes tilstand.",
    refs: [noLine(S.brev), noLine(S.brevdistribusjon)],
  },
  {
    term: "Vilkårsvurdering og totrinnskontroll",
    text: "Vilkårsvurderingen samler vilkår og beregnet resultat. Totrinnskontroll skiller TilGodkjenning fra Ferdigstilling. De er ulike begreper: faglig vurdering og kontroll av beslutningen.",
    refs: [noLine(S.vilkarsvurdering), noLine(S.totrinnskontroll)],
  },
];

// ---------------------------------------------------------------------------
// DDD-vurdering
// ---------------------------------------------------------------------------

export type Status = "Sterk" | "Delvis" | "Svak" | "Uavklart";

export type Vurdering = { concept: string; status: Status; why: string; refs: Ref[] };

export const VURDERING: Vurdering[] = [
  {
    concept: "Ubiquitous language",
    status: "Uavklart",
    why: "Navnene i koden er faglige (Sak, Behandlingsutfall, Totrinnskontroll). Koden viser ikke om fagpersonene bruker de samme ordene.",
    refs: [S.utfall, S.totrinnskontroll],
  },
  {
    concept: "Value objects og ID-typer",
    status: "Delvis",
    why: "SakId, BehandlingId og BrevId er egne typer. Likhetsreglene ligger i LongId i et eksternt bibliotek som ikke er lest her. Behandlingsutfall og Vedtaksgrunnlag er data classes uten ID.",
    refs: [S.sakId, S.behandlingId, S.utfallVedtak],
  },
  {
    concept: "Entities",
    status: "Delvis",
    why: "Sak, Behandling, Vedtak, Brev og Brevdistribusjon har egen ID. Modellene er data classes med lite atferd; reglene ligger i tjenester og DAO-er.",
    refs: [S.sak, S.behandling, S.vedtak, S.brev],
  },
  {
    concept: "Sealed utfall og tilstandsovergang",
    status: "Sterk",
    why: "Behandlingsutfall og Totrinnskontroll er sealed. TilGodkjenning.ferdigstill returnerer en egen type for ferdig kontroll.",
    refs: [S.utfall, S.totrinnskontrollOvergang],
  },
  {
    concept: "Invarianter i modellen",
    status: "Svak",
    why: "Valideringen av avvisningsårsak er kommentert ut, og henleggelse tillater null som årsak. Sakstypekontrollen ligger i BehandlingService og beregning av hindringer i BehandlingDao.",
    refs: [S.utfallBestilling, S.utfallHenleggelse, S.behandlingValider, S.behandlingDaoKalkulering],
  },
  {
    concept: "Aggregate som konsistensgrense",
    status: "Uavklart",
    why: "SakRepository samler saksvarianter i én TransactionContext, men koden dokumenterer ikke hvilke regler som alltid må gjelde i én transaksjon.",
    refs: [S.sakRepository, S.transaction],
  },
  {
    concept: "Bounded context",
    status: "Uavklart",
    why: "Pakker og Gradle-moduler gir synlige kodegrenser. De viser ikke at hvert område har egen modell eller kan endres uavhengig.",
    refs: [S.moduler, S.gradleModuler],
  },
  {
    concept: "Anti-corruption layer",
    status: "Delvis",
    why: "OppgaveMapper oversetter og beriker eksterne oppgaver. Oppgavetilknytning bruker likevel eksternt oppgavekodeverk.",
    refs: [S.oppgaveMapper, S.oppgavetilknytning],
  },
  {
    concept: "Domain events",
    status: "Delvis",
    why: "Sakshendelse er sealed, og MidlertidigVedtakHendelse navngir noe som har skjedd. Hendelsene sendes direkte til Kafka inne i transaksjonsblokken, uten outbox.",
    refs: [S.sakshendelse, S.midlertidigHendelse, S.vedtakServiceEffekter],
  },
  {
    concept: "Repository",
    status: "Delvis",
    why: "SakRepository samler lagring og lesing av saksvariantene. Behandling bruker DAO-ene direkte fra tjenestene.",
    refs: [S.sakRepository, S.behandlingFlere],
  },
  {
    concept: "Domain service",
    status: "Delvis",
    why: "Saksregler og BehandlingService.validerBehandlingsutfall samler domeneregler utenfor entitetene. Tjenestene blander henting, transaksjon og regel.",
    refs: [S.saksregler, S.behandlingValider],
  },
  {
    concept: "Domeneregler uavhengig av transport og lagring",
    status: "Svak",
    why: "Sak og Vedtak har toJson() og SQL-radmapping i samme fil som modellen. Behandlingsutfall har Jackson-annotasjoner, og Vedtaksgrunnlag inneholder JsonNode.",
    refs: [S.sakJson, S.vedtakJson, S.utfall],
  },
];

// ---------------------------------------------------------------------------
// Nøkkeltall til hero, talt fra dataene over
// ---------------------------------------------------------------------------

const allRefs: Ref[] = [
  ...DOMAIN_NODES.flatMap((n) => [...n.refs, ...(n.roles?.flatMap((x) => x.refs) ?? [])]),
  ...CONTEXT_NODES.flatMap((n) => n.refs),
  ...VURDERING.flatMap((v) => v.refs),
];

export const STATS = {
  begreper: DOMAIN_NODES.length,
  relasjoner: DOMAIN_EDGES.length,
  inneholder: DOMAIN_EDGES.filter((e) => e.kind === "contains").length,
  referanser: DOMAIN_EDGES.filter((e) => e.kind === "ref").length,
  eksterneModeller: CONTEXT_NODES.filter((n) => n.external).length,
  kildefiler: new Set(allRefs.map(refKey)).size,
  vurderinger: VURDERING.length,
};

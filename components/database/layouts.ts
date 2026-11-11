import type { Tone } from "@/lib/tones";

/**
 * Håndsatte koordinater per utsnitt. Tabellnavnene er uten schema for public; arkivtabeller har prefikset «arkiv.».
 * Boksene er 272 brede og får høyde fra antall viste kolonner (se geometry.ts). Boksbredden gir plass til tekst på 12 px. scripts/er-layout.test.mjs
 * sjekker at alle tabellene finnes i schema.json, at ingen bokser overlapper og at linjene kan rutes uten å krysse bokser.
 */
export type ViewId = "kjerne" | "barnebriller" | "alle";

export interface LayoutPlacement {
  table: string;
  x: number;
  y: number;
  tone?: Tone;
}

export interface LayoutGroup {
  label: string;
  tone: Tone;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  id: ViewId;
  label: string;
  title: string;
  description: string;
  width: number;
  height: number;
  placements: LayoutPlacement[];
  groups: LayoutGroup[];
}

const KJERNE: LayoutPlacement[] = [
  { table: "journalforing_v1", x: 40, y: 40, tone: "info" },
  { table: "oppgave_v1", x: 40, y: 200, tone: "info" },
  { table: "behandling_v1", x: 40, y: 380, tone: "info" },
  { table: "saksstatus_v1", x: 402, y: 40, tone: "warning" },
  { table: "sak_v1", x: 402, y: 200, tone: "accent" },
  { table: "brev_v1", x: 402, y: 380, tone: "meta-purple" },
  { table: "vedtaksgrunnlag_v1", x: 764, y: 40, tone: "success" },
  { table: "vedtak_v1", x: 764, y: 200, tone: "success" },
  { table: "brevmottaker_v1", x: 764, y: 380, tone: "meta-purple" },
  { table: "brevdistribusjon_v1", x: 764, y: 592, tone: "meta-purple" },
];

const BARNEBRILLER: LayoutPlacement[] = [
  { table: "vilkarsvurdering_vilkar_v1", x: 40, y: 40, tone: "success" },
  { table: "vilkarsvurdering_v1", x: 402, y: 40, tone: "success" },
  { table: "vilkarsgrunnlag_v1", x: 402, y: 160, tone: "warning" },
  { table: "barnebrillegrunnlag_v1", x: 402, y: 260, tone: "warning" },
  { table: "satsberegning_v1", x: 402, y: 360, tone: "warning" },
  { table: "sak_v1", x: 764, y: 200, tone: "accent" },
  { table: "totrinnskontroll_v1", x: 1126, y: 40, tone: "info" },
  { table: "utbetalingsmottaker_v1", x: 1126, y: 180, tone: "meta-purple" },
  { table: "vedtak_v1", x: 1126, y: 300, tone: "success" },
  { table: "utbetaling_v1", x: 1126, y: 454, tone: "meta-purple" },
];

const ALLE: LayoutPlacement[] = [
    { table: "ansatt_v1", x: 60, y: 80 },
    { table: "enhet_v1", x: 60, y: 198 },
    { table: "kommune_v1", x: 60, y: 316 },
    { table: "bydel_v1", x: 60, y: 434 },
    { table: "endringslogg_lest_v1", x: 60, y: 552 },
    { table: "scheduled_tasks", x: 60, y: 726 },
    { table: "isokategorisering_v1", x: 60, y: 844 },
    { table: "arkiv.person_v1", x: 422, y: 80 },
    { table: "arkiv.intern_oppgave_v1", x: 422, y: 252 },
    { table: "arkiv.intern_oppgavehistorikk_v1", x: 422, y: 406 },
    { table: "arkiv.sakstildeling_v1", x: 422, y: 542 },
    { table: "arkiv.faktum_v1", x: 422, y: 678 },
    { table: "journalforing_v1", x: 784, y: 80 },
    { table: "oppgave_v1", x: 784, y: 234 },
    { table: "oppgavebehandling_v1", x: 784, y: 406 },
    { table: "oppgavegrunnlag_v1", x: 784, y: 524 },
    { table: "behandling_v1", x: 784, y: 678 },
    { table: "brev_v1", x: 1146, y: 80 },
    { table: "brevmottaker_v1", x: 1146, y: 288 },
    { table: "brevdistribusjon_v1", x: 1146, y: 496 },
    { table: "vedtak_v1", x: 1508, y: 80 },
    { table: "vedtaksgrunnlag_v1", x: 1508, y: 234 },
    { table: "utbetaling_v1", x: 1508, y: 370 },
    { table: "vilkarsvurdering_v1", x: 1508, y: 506 },
    { table: "vilkarsvurdering_vilkar_v1", x: 1508, y: 624 },
    { table: "sak_v1", x: 1870, y: 80 },
    { table: "saksstatus_v1", x: 1870, y: 234 },
    { table: "sakshistorikk_v1", x: 1870, y: 388 },
    { table: "saksnotat_v1", x: 1870, y: 524 },
    { table: "steg_v1", x: 1870, y: 714 },
    { table: "endret_hjelpemiddel_v2", x: 1870, y: 832 },
    { table: "oebsinformasjon_v1", x: 1870, y: 950 },
    { table: "mottaker_v1", x: 1870, y: 1086 },
    { table: "tilbakemelding_v1", x: 1870, y: 1240 },
    { table: "barnebrillegrunnlag_v1", x: 2232, y: 80 },
    { table: "bruker_v1", x: 2232, y: 180 },
    { table: "hast_v1", x: 2232, y: 316 },
    { table: "henleggelse_v1", x: 2232, y: 416 },
    { table: "innsender_v1", x: 2232, y: 516 },
    { table: "omrade_v1", x: 2232, y: 634 },
    { table: "stonadsklassifisering_v1", x: 2232, y: 734 },
    { table: "vilkarsgrunnlag_v1", x: 2232, y: 834 },
    { table: "satsberegning_v1", x: 2232, y: 934 },
    { table: "utbetalingsmottaker_v1", x: 2232, y: 1034 },
    { table: "totrinnskontroll_v1", x: 2232, y: 1152 },
];

const ALLE_GRUPPER: LayoutGroup[] = [
    { label: "Organisasjon", tone: "neutral", x: 40, y: 44, w: 312, h: 602 },
    { label: "Teknisk", tone: "neutral", x: 40, y: 690, w: 312, h: 230 },
    { label: "Arkiv", tone: "neutral", x: 402, y: 44, w: 312, h: 746 },
    { label: "Behandling og oppgave", tone: "info", x: 764, y: 44, w: 312, h: 836 },
    { label: "Brev", tone: "meta-purple", x: 1126, y: 44, w: 312, h: 618 },
    { label: "Vedtak, vilkår og utbetaling", tone: "success", x: 1488, y: 44, w: 312, h: 692 },
    { label: "Sak", tone: "accent", x: 1850, y: 44, w: 312, h: 1308 },
    { label: "Sakens detaljer", tone: "warning", x: 2212, y: 44, w: 312, h: 1220 },
];

export const LAYOUTS: Record<ViewId, Layout> = {
  kjerne: {
    id: "kjerne",
    label: "Kjerne",
    title: "Sak, behandling, vedtak og brev",
    description:
      "Utsnitt av sak, behandling, oppgave, journalføring, vedtak, vedtaksgrunnlag, brev, brevmottaker, brevdistribusjon og saksstatus.",
    width: 1120,
    height: 790,
    placements: KJERNE,
    groups: [],
  },
  barnebriller: {
    id: "barnebriller",
    label: "Barnebriller",
    title: "Vilkår, kontroll og utbetaling",
    description:
      "Utsnitt for barnebriller. En vurdering har vilkår, og en utbetaling refererer til både sak og vedtak.",
    width: 1438,
    height: 590,
    placements: BARNEBRILLER,
    groups: [],
  },
  alle: {
    id: "alle",
    label: "Hele skjemaet",
    title: "Alle tabeller i public og arkiv",
    description: "Alle tabellene, gruppert etter tema, med alle faktiske foreign keys.",
    width: 2544,
    height: 1392,
    placements: ALLE,
    groups: ALLE_GRUPPER,
  },
};

export const VIEW_IDS: ViewId[] = ["kjerne", "barnebriller", "alle"];

import Link from "next/link";
import { BodyLong, Heading } from "@navikt/ds-react";
import { navPage } from "@/lib/navigation";

const domain = navPage("/applikasjoner/hotsak/domenemodell");
const database = navPage("/applikasjoner/hotsak/databasemodell");

export default function HomePage() {
  return (
    <div className="arch-page">
      <header className="portal-hero arch-hero">
        <div className="arch-hero__text">
          <Heading level="1" size="xlarge" spacing>
            Team HOT
          </Heading>
          <BodyLong className="arch-hero__lead">
            Arkitekturportal for Hjelpemidler og tilrettelegging i Nav. Her samles modellene
            av applikasjonene teamet forvalter.
          </BodyLong>
        </div>
      </header>

      <section className="arch-section" aria-labelledby="applikasjoner-title">
        <div className="arch-card">
          <Heading level="2" size="medium" id="applikasjoner-title">
            <Link href="/applikasjoner">Applikasjoner</Link>
          </Heading>
          <BodyLong>Hotsak</BodyLong>
          <ul className="arch-card__list">
            <li>
              <Link href={domain.href}>{domain.label}</Link>
            </li>
            <li>
              <Link href={database.href}>{database.label}</Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

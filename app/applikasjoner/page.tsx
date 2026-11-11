import type { Metadata } from "next";
import Link from "next/link";
import { BodyLong, Heading } from "@navikt/ds-react";

export const metadata: Metadata = { title: "Applikasjoner · Team HOT" };

export default function ApplikasjonerPage() {
  return (
    <div className="portal-prose">
      <Heading level="1" size="xlarge" spacing>
        Applikasjoner
      </Heading>
      <BodyLong spacing>Applikasjonene teamet har dokumentert i portalen.</BodyLong>
      <ul>
        <li>
          <Link href="/applikasjoner/hotsak">Hotsak</Link>
        </li>
      </ul>
    </div>
  );
}

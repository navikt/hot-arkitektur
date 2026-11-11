import type { Metadata } from "next";
import Link from "next/link";
import { BodyLong, Heading } from "@navikt/ds-react";
import { navPage } from "@/lib/navigation";

export const metadata: Metadata = { title: "Hotsak · Team HOT" };

const domain = navPage("/applikasjoner/hotsak/domenemodell");
const database = navPage("/applikasjoner/hotsak/databasemodell");

export default function HotsakPage() {
  return (
    <div className="portal-prose">
      <Heading level="1" size="xlarge" spacing>
        Hotsak
      </Heading>
      <BodyLong spacing>Modellene som beskriver Hotsak.</BodyLong>
      <ul>
        <li>
          <Link href={domain.href}>{domain.label}</Link>
        </li>
        <li>
          <Link href={database.href}>{database.label}</Link>
        </li>
      </ul>
    </div>
  );
}

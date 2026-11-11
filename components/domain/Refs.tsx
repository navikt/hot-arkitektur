import { app, core, migrations } from "@/lib/sources";
import { Source } from "@/components/page/Source";
import type { Ref, RefBase } from "./data";

const BASE: Record<RefBase, string> = { app, core, migrations, root: "" };

/** Kildehenvisninger som lenker til hotsak-api på fastlåst revisjon. */
export function Refs({ refs }: { refs: readonly Ref[] }) {
  return (
    <>
      {refs.map((r, i) => (
        <span key={`${r.base}${r.file}${r.line}${r.end}`}>
          {i > 0 && ", "}
          <Source path={`${BASE[r.base]}${r.file}`} line={r.line} end={r.end} />
        </span>
      ))}
    </>
  );
}

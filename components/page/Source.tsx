import { Link } from "@navikt/ds-react";
import { sourceUrl } from "@/lib/sources";

interface SourceProps {
  path: string;
  line?: number;
  end?: number;
  label?: string;
}

export function Source({ path, line, end, label = path.split("/").at(-1) }: SourceProps) {
  const lines = line ? (end ? `linje ${line} til ${end}` : `linje ${line}`) : null;
  return (
    <Link href={sourceUrl(path, line, end)} data-source-path={path}>
      {label}
      {lines ? `, ${lines}` : ""}
    </Link>
  );
}

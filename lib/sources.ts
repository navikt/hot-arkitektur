export const revision = "dadbd18b8ee2b16900673289e1ca5726c2fbce7d";
export const repository = `https://github.com/navikt/hotsak-api/blob/${revision}/`;
export const app = "app/src/main/kotlin/no/nav/hjelpemidler/saksbehandling/";
export const core = "core/src/main/kotlin/no/nav/hjelpemidler/saksbehandling/core/";
export const migrations = "app/src/main/resources/db/migration/";

export function sourceUrl(path: string, line?: number, end?: number): string {
  const fragment = line ? `#L${line}${end ? `-L${end}` : ""}` : "";
  return `${repository}${path}${fragment}`;
}

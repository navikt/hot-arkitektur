import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";

const root = new URL("../", import.meta.url);
const apiDirectory = path.resolve(fileURLToPath(root), process.env.HOTSAK_API_DIR ?? "../hotsak-api");
const migrationDirectory = pathToFileURL(path.join(apiDirectory, "app/src/main/resources/db/migration") + path.sep);
const output = new URL("data/schema.json", root);
if (!existsSync(migrationDirectory)) {
    console.error(
        `Fant ikke Flyway-skriptene i ${fileURLToPath(migrationDirectory)}.\n` +
            "Sjekk ut navikt/hotsak-api ved siden av dette repoet, eller sett HOTSAK_API_DIR til stien til hotsak-api.",
    );
    process.exit(1);
}
const filenames = (await readdir(migrationDirectory))
    .filter((name) => /^(B|V)\d+__.*\.sql$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
const migrations = await Promise.all(
    filenames.map(async (name) => ({
        name,
        sql: await readFile(new URL(name, migrationDirectory), "utf8"),
    })),
);
const repeatable = "R__oppgavestatus_for.sql";
migrations.push({
    name: repeatable,
    sql: await readFile(new URL(repeatable, migrationDirectory), "utf8"),
});
const fingerprint = createHash("sha256")
    .update(migrations.map(({ name, sql }) => `${name}\n${sql}`).join("\n"))
    .digest("hex");

if (process.argv.includes("--check")) {
    const saved = JSON.parse(await readFile(output, "utf8"));
    if (saved.fingerprint !== fingerprint) {
        throw new Error("Flyway-skriptene er endret. Kjør pnpm schema og gjennomgå databasemodellen.");
    }
    console.log("Databasemodellen samsvarer med Flyway-skriptene.");
} else {
    const db = new PGlite({ extensions: { btree_gist } });
    const adaptations = [];
    try {
        // Samme arkivskjema som Flyway-oppsettet i app/build.gradle.kts.
        await db.exec("CREATE SCHEMA arkiv;");
        for (const { name, sql } of migrations) {
            let executable = sql;
            if (name === "V176__pg_stat_statements.sql") {
                adaptations.push({
                    migration: name,
                    reason: "pg_stat_statements utelates i PGlite. Utvidelsen endrer ikke domenetabellene.",
                });
                continue;
            }
            if (name === "B170__Baseline.sql") {
                executable = executable.replace(
                    /CREATE COLLATION IF NOT EXISTS "numeric" \(PROVIDER = icu, LOCALE = 'en-u-kn-true'\);/,
                    "",
                );
                adaptations.push({
                    migration: name,
                    reason: "ICU-collation numeric utelates i PGlite. Den brukes ikke i tabellconstraints.",
                });
            }
            try {
                await db.exec(executable);
            } catch (cause) {
                throw new Error(`Kunne ikke anvende ${name}: ${cause.message}`, {
                    cause,
                });
            }
        }
        const { rows: columns } = await db.query(`
      SELECT n.nspname AS schema, c.relname AS table_name, a.attname AS name,
             format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull AS not_null,
             pg_get_expr(d.adbin, d.adrelid) AS default_value
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE n.nspname IN ('public', 'arkiv') AND c.relkind = 'r'
        AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY n.nspname, c.relname, a.attnum
    `);
        const { rows: constraints } = await db.query(`
      SELECT n.nspname AS schema, c.relname AS table_name, con.conname AS name,
             con.contype AS type, pg_get_constraintdef(con.oid) AS definition,
             rn.nspname AS target_schema, rc.relname AS target_table,
             ARRAY(SELECT a.attname FROM unnest(con.conkey) WITH ORDINALITY k(num, pos)
                   JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.num
                   ORDER BY k.pos) AS columns,
             ARRAY(SELECT a.attname FROM unnest(con.confkey) WITH ORDINALITY k(num, pos)
                   JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.num
                   ORDER BY k.pos) AS target_columns
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_class rc ON rc.oid = con.confrelid
      LEFT JOIN pg_namespace rn ON rn.oid = rc.relnamespace
      WHERE n.nspname IN ('public', 'arkiv') AND c.relkind = 'r'
      ORDER BY n.nspname, c.relname, con.conname
    `);
        const { rows: indexes } = await db.query(`
      SELECT n.nspname AS schema, c.relname AS table_name,
             ic.relname AS name, pg_get_indexdef(i.indexrelid) AS definition,
             i.indisunique AS is_unique, pg_get_expr(i.indpred, i.indrelid) AS predicate,
             ARRAY(SELECT a.attname FROM unnest(i.indkey) WITH ORDINALITY k(num, pos)
                   JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.num
                   WHERE k.pos <= i.indnkeyatts ORDER BY k.pos) AS columns
      FROM pg_index i
      JOIN pg_class c ON c.oid = i.indrelid
      JOIN pg_class ic ON ic.oid = i.indexrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname IN ('public', 'arkiv')
      ORDER BY n.nspname, c.relname, ic.relname
    `);
        const data = {
            fingerprint,
            migrations: migrations.map(({ name }) => name),
            adaptations,
            columns,
            constraints,
            indexes,
        };
        await writeFile(output, `${JSON.stringify(data, null, 2)}\n`);
        console.log(`Skrev ${fileURLToPath(output)} fra ${migrations.length} migreringsfiler.`);
    } finally {
        await db.close();
    }
}

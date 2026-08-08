// Shared SQL helpers: a formatter and a lightweight identifier/CTE
// extractor used by the dbt converter and the naming linter.

export type SqlDialect = "snowflake" | "tsql" | "postgres" | "mysql" | "bigquery";

const KEYWORDS = [
  "select", "from", "where", "group by", "order by", "having", "limit", "qualify",
  "inner join", "left join", "right join", "full join", "cross join", "join",
  "union all", "union", "except", "intersect", "with", "on", "and", "or",
  "case", "when", "then", "else", "end", "as", "distinct", "over", "partition by",
  "insert into", "update", "delete from", "values", "set", "create table",
  "create or replace table", "create view", "returning",
];

const NEWLINE_BEFORE = [
  "select", "from", "where", "group by", "order by", "having", "limit", "qualify",
  "inner join", "left join", "right join", "full join", "cross join", "join",
  "union all", "union", "except", "intersect",
];

const LIT = String.fromCharCode(1);
const KW = String.fromCharCode(2);

/**
 * Formats SQL by stashing literals and comments first, so they are never
 * rewritten. That is the usual failure mode of regex-based formatters.
 */
export function formatSql(sql: string, opts: { upper: boolean; indent: number }): string {
  const { upper, indent } = opts;
  const pad = " ".repeat(indent);

  // 1. Protect literals and comments behind sentinels
  const vault: string[] = [];
  const stash = (m: string) => LIT + (vault.push(m) - 1) + LIT;
  let out = sql
    .replace(/--[^\r\n]*/g, stash)
    .replace(/\/\*[\s\S]*?\*\//g, stash)
    .replace(/'(?:[^']|'')*'/g, stash)
    .replace(/"(?:[^"]|"")*"/g, stash);

  // 2. Normalise whitespace. Only trim *inside* brackets: removing the space
  //    after ")" would glue it to the next token, producing ")as alias".
  out = out
    .replace(/[ \t\r\n]+/g, " ")
    .replace(/ *, */g, ", ")
    .replace(/\( +/g, "(")
    .replace(/ +\)/g, ")")
    .trim();

  // 3. Case-normalise keywords (longest first so "group by" beats "by")
  for (const kw of [...KEYWORDS].sort((a, b) => b.length - a.length)) {
    const re = new RegExp("\\b" + kw.replace(/ /g, "\\s+") + "\\b", "gi");
    out = out.replace(re, upper ? kw.toUpperCase() : kw.toLowerCase());
  }

  // 4. Break before major clauses. Each placed keyword is tokenised so a
  //    shorter one can't later split it ("inner join" being cut at "join").
  const kwVault: string[] = [];
  for (const kw of [...NEWLINE_BEFORE].sort((a, b) => b.length - a.length)) {
    const target = upper ? kw.toUpperCase() : kw;
    const re = new RegExp("\\s+(" + target.replace(/ /g, "\\s+") + ")\\b", "g");
    out = out.replace(re, (_m, k: string) => "\n" + KW + (kwVault.push(k) - 1) + KW);
  }
  out = out.replace(new RegExp(KW + "(\\d+)" + KW, "g"), (_m, i: string) => kwVault[Number(i)]);

  // 5. Split the select list and indent it
  const lines: string[] = [];
  for (const line of out.split("\n")) {
    const m = line.match(/^(select\s+distinct|select|SELECT\s+DISTINCT|SELECT)\s+(.*)$/);
    if (m && m[2]) {
      lines.push(m[1]);
      const parts: string[] = [];
      let depth = 0;
      let buf = "";
      for (const ch of m[2]) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "," && depth === 0) { parts.push(buf.trim()); buf = ""; continue; }
        buf += ch;
      }
      if (buf.trim()) parts.push(buf.trim());
      parts.forEach((p, i) => lines.push(pad + p + (i < parts.length - 1 ? "," : "")));
    } else {
      lines.push(line.replace(/\s+(and|or|AND|OR)\s+/g, "\n" + pad + "$1 "));
    }
  }

  // 6. Restore protected chunks
  return lines
    .join("\n")
    .replace(new RegExp(LIT + "(\\d+)" + LIT, "g"), (_m, i: string) => vault[Number(i)])
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Physical tables referenced in FROM/JOIN, ignoring CTE names. */
export function extractTables(sql: string): { tables: string[]; ctes: string[] } {
  const stripped = sql.replace(/--[^\r\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");

  const ctes: string[] = [];
  for (const m of stripped.matchAll(/(?:with|,)\s+([a-zA-Z_][\w$]*)\s+as\s*\(/gi)) ctes.push(m[1]);

  const tables: string[] = [];
  for (const m of stripped.matchAll(/\b(?:from|join)\s+([a-zA-Z_][\w$]*(?:\.[a-zA-Z_][\w$]*){0,2})/gi)) {
    const t = m[1];
    if (!ctes.some((c) => c.toLowerCase() === t.toLowerCase()) && !tables.includes(t)) tables.push(t);
  }
  return { tables, ctes };
}

/** Column names / aliases from the outermost SELECT list. */
export function extractSelectColumns(sql: string): string[] {
  const stripped = sql.replace(/--[^\r\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  const idx = stripped.toLowerCase().lastIndexOf("select");
  if (idx < 0) return [];
  const after = stripped.slice(idx + 6);

  let depth = 0;
  let fromIdx = after.length;
  for (let i = 0; i < after.length; i++) {
    if (after[i] === "(") depth++;
    else if (after[i] === ")") depth--;
    else if (depth === 0 && /\bfrom\b/i.test(after.slice(i, i + 6)) && /\s/.test(after[i - 1] ?? " ")) {
      fromIdx = i;
      break;
    }
  }

  const parts: string[] = [];
  let d = 0;
  let buf = "";
  for (const ch of after.slice(0, fromIdx)) {
    if (ch === "(") d++;
    if (ch === ")") d--;
    if (ch === "," && d === 0) { parts.push(buf); buf = ""; continue; }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);

  return parts
    .map((p) => {
      const t = p.trim().replace(/\s+/g, " ");
      const alias = t.match(/\bas\s+([a-zA-Z_"][\w$"]*)$/i);
      if (alias) return alias[1].replace(/"/g, "");
      return (t.split(/[\s.]/).pop() ?? t).replace(/"/g, "");
    })
    .filter((c) => c && c !== "*");
}

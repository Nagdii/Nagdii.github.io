// ─────────────────────────────────────────────────────────────
// Star-schema inference from a flat transactional table.
//
// The interesting part is dimension grouping: rather than relying on
// column-name prefixes alone, we detect functional dependencies
// (A implies B when every value of A maps to exactly one value of B) and
// cluster columns that describe the same entity.
// ─────────────────────────────────────────────────────────────

export type Dialect = "snowflake" | "tsql" | "postgres";
export type Role = "measure" | "date" | "degenerate" | "dimension" | "ignore";
export type ColType = "date" | "number" | "integer" | "boolean" | "text";

export interface Column {
  name: string;
  type: ColType;
  role: Role;
  distinct: number;
  nulls: number;
  distinctRatio: number;
  samples: string[];
}

export interface Dimension {
  name: string;
  key: string;
  columns: string[];
}

export interface Model {
  factName: string;
  dimensions: Dimension[];
  dateColumns: string[];
  degenerates: string[];
  measures: string[];
  rowCount: number;
}

/** Split delimited text, honouring quoted fields and embedded newlines. */
export function parseDelimited(text: string): { headers: string[]; rows: string[][] } {
  const head = text.slice(0, 5000);
  const counts: [string, number][] = [
    [",", (head.match(/,/g) || []).length],
    ["\t", (head.match(/\t/g) || []).length],
    [";", (head.match(/;/g) || []).length],
    ["|", (head.match(/\|/g) || []).length],
  ];
  const delim = counts.sort((a, b) => b[1] - a[1])[0][0];

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === delim) { row.push(field); field = ""; continue; }
    if (c === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = []; field = "";
      continue;
    }
    field += c;
  }
  row.push(field.replace(/\r$/, ""));
  if (row.some((v) => v.trim() !== "")) rows.push(row);

  const headers = (rows.shift() ?? []).map((h, i) => h.trim() || `column_${i + 1}`);
  return { headers, rows };
}

const DATE_RE = [
  /^\d{4}-\d{1,2}-\d{1,2}([ T].*)?$/,
  /^\d{1,2}\/\d{1,2}\/\d{4}( .*)?$/,
  /^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/,
];
const MEASURE_RE = /(amount|amt|qty|quantity|price|cost|total|revenue|sales|discount|tax|value|margin|profit|salary|balance|weight|units|spend|net|gross|fee)/i;
const KEY_RE = /(_id$|^id$|_no$|_num$|number$|_code$|_key$|invoice|transaction|order_id|receipt)/i;

function inferType(values: string[]): ColType {
  const v = values.filter((x) => x !== "" && x != null);
  if (!v.length) return "text";
  const test = v.slice(0, 400);
  if (test.every((x) => DATE_RE.some((r) => r.test(x.trim())))) return "date";
  if (test.every((x) => /^-?[\d,]+(\.\d+)?$/.test(x.trim().replace(/[$€£%]/g, "")))) {
    return test.every((x) => !x.includes(".")) ? "integer" : "number";
  }
  if (test.every((x) => /^(true|false|yes|no|y|n|0|1)$/i.test(x.trim()))) return "boolean";
  return "text";
}

export function profile(headers: string[], rows: string[][]): Column[] {
  return headers.map((name, i) => {
    const values = rows.map((r) => (r[i] ?? "").trim());
    const nonNull = values.filter((v) => v !== "");
    const set = new Set(nonNull);
    const type = inferType(values);
    const distinctRatio = rows.length ? set.size / rows.length : 0;

    let role: Role;
    if (type === "date") role = "date";
    else if ((type === "number" || type === "integer") && MEASURE_RE.test(name) && !KEY_RE.test(name)) role = "measure";
    else if (distinctRatio > 0.92 && (KEY_RE.test(name) || type === "integer")) role = "degenerate";
    else if (type === "number") role = "measure";
    else if (distinctRatio > 0.92) role = "degenerate";
    else role = "dimension";

    return {
      name, type, role,
      distinct: set.size,
      nulls: values.length - nonNull.length,
      distinctRatio,
      samples: [...set].slice(0, 3),
    };
  });
}

/** True when every value of `a` maps to exactly one value of `b`. */
function determines(rows: string[][], a: number, b: number): boolean {
  const seen = new Map<string, string>();
  for (const r of rows) {
    const av = (r[a] ?? "").trim();
    const bv = (r[b] ?? "").trim();
    if (av === "") continue;
    const prev = seen.get(av);
    if (prev === undefined) seen.set(av, bv);
    else if (prev !== bv) return false;
  }
  return seen.size > 0;
}

/** Sanitise for use as a SQL identifier, preserving any _id/_key suffix. */
const col = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** Sanitise and strip key suffixes, for naming an entity rather than a column. */
const entity = (s: string) => col(s).replace(/(_id|_key|_code|_no|_num)$/, "");

const firstToken = (s: string) => col(s).split("_")[0];

export function buildModel(columns: Column[], rows: string[][], factName: string): Model {
  const idx = new Map(columns.map((c, i) => [c.name, i]));
  const dimCols = columns.filter((c) => c.role === "dimension");

  // Name prefixes are a far stronger signal than functional dependency on small
  // samples, where unrelated columns often correlate by accident.
  const families = new Map<string, Column[]>();
  for (const c of dimCols) {
    const t = firstToken(c.name);
    if (!families.has(t)) families.set(t, []);
    families.get(t)!.push(c);
  }

  const claimed = new Set<string>();
  const dimensions: Dimension[] = [];

  for (const [token, cols] of families) {
    if (cols.length < 2) continue;
    const ranked = [...cols].sort((a, b) => b.distinct - a.distinct);
    dimensions.push({ name: `dim_${token}`, key: ranked[0].name, columns: ranked.map((c) => c.name) });
    ranked.forEach((c) => claimed.add(c.name));
  }

  // Leftovers have no prefix family of their own, so a functional dependency
  // here is meaningful: attach them to whichever dimension key determines them.
  for (const c of dimCols) {
    if (claimed.has(c.name)) continue;
    const host = dimensions.find(
      (d) => c.distinct <= (dimCols.find((x) => x.name === d.key)?.distinct ?? 0) &&
        determines(rows, idx.get(d.key)!, idx.get(c.name)!),
    );
    if (host) host.columns.push(c.name);
    else dimensions.push({ name: `dim_${entity(c.name) || "attribute"}`, key: c.name, columns: [c.name] });
    claimed.add(c.name);
  }

  return {
    factName: `fct_${entity(factName) || "transactions"}`,
    dimensions,
    dateColumns: columns.filter((c) => c.role === "date").map((c) => c.name),
    degenerates: columns.filter((c) => c.role === "degenerate").map((c) => c.name),
    measures: columns.filter((c) => c.role === "measure").map((c) => c.name),
    rowCount: rows.length,
  };
}

// ── SQL generation ───────────────────────────────────────────

function sqlType(t: ColType, d: Dialect): string {
  const text = d === "tsql" ? "nvarchar(255)" : "varchar(255)";
  switch (t) {
    case "date": return d === "tsql" ? "date" : "date";
    case "integer": return d === "tsql" ? "bigint" : "bigint";
    case "number": return d === "tsql" ? "decimal(18,4)" : "numeric(18,4)";
    case "boolean": return d === "tsql" ? "bit" : "boolean";
    default: return text;
  }
}

function identity(d: Dialect): string {
  if (d === "snowflake") return "int autoincrement start 1 increment 1";
  if (d === "tsql") return "int identity(1,1)";
  return "int generated always as identity";
}

export function generateDDL(model: Model, columns: Column[], d: Dialect, staging: string): string {
  const typeOf = (n: string) => sqlType(columns.find((c) => c.name === n)?.type ?? "text", d);
  const q = (n: string) => col(n) || n;
  const out: string[] = [
    `-- Star schema generated from ${staging} (${model.rowCount.toLocaleString()} rows)`,
    `-- ${model.dimensions.length} dimensions · ${model.measures.length} measures\n`,
  ];

  if (model.dateColumns.length) {
    out.push(`-- Conformed date dimension, shared by every date role`);
    out.push(`create table dim_date (
    date_key        int primary key,
    full_date       date not null,
    year            int,
    quarter         int,
    month           int,
    month_name      ${sqlType("text", d)},
    day_of_month    int,
    day_name        ${sqlType("text", d)},
    is_weekend      ${sqlType("boolean", d)}
);\n`);
  }

  for (const dim of model.dimensions) {
    const attrs = dim.columns.filter((c) => c !== dim.key);
    out.push(`create table ${dim.name} (
    ${q(dim.name.replace("dim_", ""))}_key ${identity(d)} primary key,
    ${q(dim.key)} ${typeOf(dim.key)} not null,${attrs.length ? "\n" + attrs.map((a) => `    ${q(a)} ${typeOf(a)}`).join(",\n") + "," : ""}
    valid_from      date,
    valid_to        date,
    is_current      ${sqlType("boolean", d)}
);`);
    out.push(`create unique index ux_${dim.name}_nk on ${dim.name} (${q(dim.key)}, valid_from);\n`);
  }

  const factCols = [
    ...model.dateColumns.map((c) => `    ${q(c)}_key int not null`),
    ...model.dimensions.map((dm) => `    ${q(dm.name.replace("dim_", ""))}_key int not null`),
    ...model.degenerates.map((c) => `    ${q(c)} ${typeOf(c)}`),
    ...model.measures.map((c) => `    ${q(c)} ${typeOf(c)}`),
  ];
  out.push(`create table ${model.factName} (
    ${model.factName.replace("fct_", "")}_key ${identity(d)} primary key,
${factCols.join(",\n")},
    loaded_at       ${d === "tsql" ? "datetime2" : "timestamp"}
);`);

  const fks = [
    ...model.dateColumns.map(
      (c) => `alter table ${model.factName} add constraint fk_${q(c)} foreign key (${q(c)}_key) references dim_date (date_key);`,
    ),
    ...model.dimensions.map((dm) => {
      const k = `${q(dm.name.replace("dim_", ""))}_key`;
      return `alter table ${model.factName} add constraint fk_${dm.name} foreign key (${k}) references ${dm.name} (${k});`;
    }),
  ];
  out.push("\n" + fks.join("\n"));
  return out.join("\n");
}

export function generateETL(model: Model, d: Dialect, staging: string): string {
  const q = (n: string) => col(n) || n;
  const out: string[] = [`-- Load dimensions first, then resolve surrogate keys on the fact\n`];

  for (const dim of model.dimensions) {
    const cols = dim.columns;
    out.push(`insert into ${dim.name} (${cols.map(q).join(", ")}, valid_from, is_current)
select distinct
    ${cols.map((c) => `"${c}"`).join(",\n    ")},
    ${d === "tsql" ? "cast(getdate() as date)" : "current_date"},
    ${d === "tsql" ? "1" : "true"}
from ${staging}
where "${dim.key}" is not null;\n`);
  }

  const joins = model.dimensions
    .map(
      (dm) =>
        `left join ${dm.name} on ${dm.name}."${dm.key}" = s."${dm.key}" and ${dm.name}.is_current = ${d === "tsql" ? "1" : "true"}`,
    )
    .join("\n");

  const selects = [
    ...model.dateColumns.map((c) =>
      d === "tsql"
        ? `    convert(int, format(s."${c}", 'yyyyMMdd')) as ${q(c)}_key`
        : `    to_number(to_char(s."${c}", 'YYYYMMDD')) as ${q(c)}_key`,
    ),
    ...model.dimensions.map((dm) => `    ${dm.name}.${q(dm.name.replace("dim_", ""))}_key`),
    ...model.degenerates.map((c) => `    s."${c}"`),
    ...model.measures.map((c) => `    s."${c}"`),
  ];

  out.push(`insert into ${model.factName} (
${[
  ...model.dateColumns.map((c) => `    ${q(c)}_key`),
  ...model.dimensions.map((dm) => `    ${q(dm.name.replace("dim_", ""))}_key`),
  ...model.degenerates.map((c) => `    ${q(c)}`),
  ...model.measures.map((c) => `    ${q(c)}`),
].join(",\n")}
)
select
${selects.join(",\n")}
from ${staging} s
${joins};`);

  return out.join("\n");
}

export function generateDbt(model: Model, staging: string): string {
  const q = (n: string) => col(n) || n;
  const files: string[] = [];

  for (const dim of model.dimensions) {
    files.push(`-- models/marts/${dim.name}.sql
{{ config(materialized='table') }}

with source as (
    select distinct
        ${dim.columns.map((c) => `"${c}"`).join(",\n        ")}
    from {{ ref('${staging}') }}
    where "${dim.key}" is not null
)

select
    {{ dbt_utils.generate_surrogate_key(['"${dim.key}"']) }} as ${q(dim.name.replace("dim_", ""))}_key,
    ${dim.columns.map((c) => `"${c}" as ${q(c)}`).join(",\n    ")}
from source`);
  }

  files.push(`-- models/marts/${model.factName}.sql
{{ config(materialized='incremental', unique_key='${model.factName.replace("fct_", "")}_key') }}

select
    {{ dbt_utils.generate_surrogate_key([${model.degenerates.map((c) => `'"${c}"'`).join(", ") || "'*'"}]) }} as ${model.factName.replace("fct_", "")}_key,
${[
  ...model.dateColumns.map((c) => `    cast(to_char("${c}", 'YYYYMMDD') as int) as ${q(c)}_key`),
  ...model.dimensions.map((dm) => `    {{ dbt_utils.generate_surrogate_key(['"${dm.key}"']) }} as ${q(dm.name.replace("dim_", ""))}_key`),
  ...model.degenerates.map((c) => `    "${c}" as ${q(c)}`),
  ...model.measures.map((c) => `    "${c}" as ${q(c)}`),
].join(",\n")}
from {{ ref('${staging}') }}`);

  return files.join("\n\n");
}

export const TEMPLATE_CSV = `order_id,order_date,customer_id,customer_name,customer_city,customer_segment,product_id,product_name,product_category,store_id,store_region,quantity,unit_price,discount_amount,sales_amount
ORD-1001,2026-01-14,CUST-004,Nadia Rashid,Montreal,Retail,SKU-88,Wool Coat,Outerwear,ST-02,East,1,189.00,0.00,189.00
ORD-1002,2026-01-14,CUST-011,Omar Haddad,Toronto,Wholesale,SKU-12,Cotton Tee,Tops,ST-05,Central,4,24.50,8.00,90.00
ORD-1003,2026-01-15,CUST-004,Nadia Rashid,Montreal,Retail,SKU-31,Denim Jeans,Bottoms,ST-02,East,2,79.00,10.00,148.00
ORD-1004,2026-01-16,CUST-027,Sara Bennani,Vancouver,Retail,SKU-88,Wool Coat,Outerwear,ST-09,West,1,189.00,20.00,169.00
ORD-1005,2026-01-16,CUST-011,Omar Haddad,Toronto,Wholesale,SKU-12,Cotton Tee,Tops,ST-05,Central,10,24.50,25.00,220.00
ORD-1006,2026-01-17,CUST-052,Youssef Adel,Calgary,Retail,SKU-45,Leather Belt,Accessories,ST-07,West,1,45.00,0.00,45.00
ORD-1007,2026-01-18,CUST-027,Sara Bennani,Vancouver,Retail,SKU-31,Denim Jeans,Bottoms,ST-09,West,1,79.00,0.00,79.00
ORD-1008,2026-01-19,CUST-063,Lina Moreau,Montreal,Retail,SKU-77,Silk Scarf,Accessories,ST-02,East,3,32.00,6.00,90.00`;

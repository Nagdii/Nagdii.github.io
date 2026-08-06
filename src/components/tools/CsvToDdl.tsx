import { useMemo, useRef, useState } from "react";
import { CodeBlock, Field, Select } from "./ui";
import { parseDelimited, profile, type Dialect } from "./starSchema";

const SAMPLE = `product_id,product_name,category,unit_price,in_stock,launched_on
SKU-88,Wool Coat,Outerwear,189.00,true,2025-09-01
SKU-12,Cotton Tee,Tops,24.50,true,2024-03-15
SKU-31,Denim Jeans,Bottoms,79.00,false,2025-01-20
SKU-45,Leather Belt,Accessories,45.00,true,2023-11-05`;

type Out = "ddl" | "seed" | "copy";

const sqlType = (t: string, d: Dialect) => {
  const text = d === "tsql" ? "nvarchar(255)" : "varchar(255)";
  if (t === "date") return "date";
  if (t === "integer") return "bigint";
  if (t === "number") return d === "tsql" ? "decimal(18,4)" : "numeric(18,4)";
  if (t === "boolean") return d === "tsql" ? "bit" : "boolean";
  return text;
};

const ident = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export default function CsvToDdl() {
  const [raw, setRaw] = useState(SAMPLE);
  const [table, setTable] = useState("raw_products");
  const [dialect, setDialect] = useState<Dialect>("snowflake");
  const [out, setOut] = useState<Out>("ddl");
  const fileRef = useRef<HTMLInputElement>(null);

  const { headers, rows } = useMemo(() => parseDelimited(raw), [raw]);
  const cols = useMemo(() => profile(headers, rows), [headers, rows]);

  const code = useMemo(() => {
    if (!headers.length || !rows.length) return "-- Paste or upload a CSV to begin.";

    if (out === "ddl") {
      const widest = Math.max(...cols.map((c) => ident(c.name).length));
      const body = cols
        .map((c) => `    ${ident(c.name).padEnd(widest)} ${sqlType(c.type, dialect)}${c.nulls === 0 ? " not null" : ""}`)
        .join(",\n");
      return `-- Inferred from ${rows.length.toLocaleString()} sampled rows\ncreate table ${table} (\n${body}\n);`;
    }

    if (out === "seed") {
      const yml = cols
        .map(
          (c) =>
            `      - name: ${ident(c.name)}\n        description: "TODO"\n        tests:\n${
              c.nulls === 0 ? "          - not_null\n" : ""
            }${c.distinct === rows.length ? "          - unique\n" : ""}`.replace(/tests:\n$/, ""),
        )
        .join("");
      return `# seeds/_seeds.yml\nversion: 2\n\nseeds:\n  - name: ${table}\n    description: "Loaded from CSV"\n    config:\n      column_types:\n${cols
        .map((c) => `        ${ident(c.name)}: ${sqlType(c.type, dialect)}`)
        .join("\n")}\n    columns:\n${yml}`;
    }

    if (dialect === "snowflake") {
      return `-- Stage and load\ncreate or replace stage stg_${table};\n-- snowsql: PUT file://${table}.csv @stg_${table};\n\ncopy into ${table}\nfrom @stg_${table}/${table}.csv\nfile_format = (type = csv field_optionally_enclosed_by = '"' skip_header = 1)\non_error = 'abort_statement';`;
    }
    if (dialect === "tsql") {
      return `bulk insert ${table}\nfrom 'C:\\data\\${table}.csv'\nwith (\n    format = 'CSV',\n    firstrow = 2,\n    fieldterminator = ',',\n    rowterminator = '0x0a'\n);`;
    }
    return `\\copy ${table} from '${table}.csv' with (format csv, header true);`;
  }, [out, cols, headers, rows, table, dialect]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setRaw(String(r.result ?? ""));
    r.readAsText(f);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Drop a CSV and get the <code className="text-accent-300">CREATE TABLE</code> with inferred types, a dbt
            seed config, and the load command for your platform. Columns with no blanks are marked{" "}
            <code className="text-accent-300">not null</code>; fully distinct columns get a{" "}
            <code className="text-accent-300">unique</code> test.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-accent-500/40 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-300 transition hover:bg-accent-500/20"
            >
              Upload CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={onFile} className="hidden" />
            <button
              onClick={() => setRaw(SAMPLE)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500/50"
            >
              Load example
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Table name">
              <input
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent-500/60"
              />
            </Field>
            <Field label="Dialect">
              <Select
                value={dialect}
                onChange={(e) => setDialect(e.target.value as Dialect)}
                options={[
                  { value: "snowflake", label: "Snowflake" },
                  { value: "tsql", label: "SQL Server" },
                  { value: "postgres", label: "PostgreSQL" },
                ]}
              />
            </Field>
          </div>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
          className="h-56 w-full rounded-xl border border-white/10 bg-ink-950 p-3 font-mono text-[11px] leading-relaxed text-slate-300 outline-none transition focus:border-accent-500/60"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {([["ddl", "CREATE TABLE"], ["seed", "dbt seed config"], ["copy", "Load command"]] as [Out, string][]).map(
          ([k, label]) => (
            <button
              key={k}
              onClick={() => setOut(k)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                out === k
                  ? "border-accent-500/50 bg-accent-500/15 text-accent-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25"
              }`}
            >
              {label}
            </button>
          ),
        )}
      </div>
      <CodeBlock code={code} filename={out === "seed" ? "_seeds.yml" : `${table}.sql`} />
    </div>
  );
}

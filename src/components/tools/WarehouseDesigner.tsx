import { useMemo, useRef, useState } from "react";
import { CodeBlock, Select } from "./ui";
import {
  buildModel, generateDbt, generateDDL, generateETL, parseDelimited, profile,
  TEMPLATE_CSV, type Column, type Dialect, type Role,
} from "./starSchema";

const ROLE_LABEL: Record<Role, string> = {
  measure: "Measure (fact)",
  date: "Date",
  degenerate: "Degenerate dim",
  dimension: "Dimension",
  ignore: "Ignore",
};

const ROLE_STYLE: Record<Role, string> = {
  measure: "border-accent-500/40 bg-accent-500/10 text-accent-300",
  date: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  degenerate: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  dimension: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  ignore: "border-white/10 bg-white/5 text-slate-500",
};

type Output = "ddl" | "etl" | "dbt";

export default function WarehouseDesigner() {
  const [raw, setRaw] = useState(TEMPLATE_CSV);
  const [overrides, setOverrides] = useState<Record<string, Role>>({});
  const [dialect, setDialect] = useState<Dialect>("snowflake");
  const [output, setOutput] = useState<Output>("ddl");
  const [factName, setFactName] = useState("sales");
  const [staging, setStaging] = useState("stg_transactions");
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseDelimited(raw), [raw]);

  const columns: Column[] = useMemo(() => {
    const base = profile(parsed.headers, parsed.rows);
    return base.map((c) => (overrides[c.name] ? { ...c, role: overrides[c.name] } : c));
  }, [parsed, overrides]);

  const model = useMemo(
    () => buildModel(columns.filter((c) => c.role !== "ignore"), parsed.rows, factName),
    [columns, parsed.rows, factName],
  );

  const code = useMemo(() => {
    if (!parsed.headers.length || !parsed.rows.length) return "-- Paste or upload a transactional extract to begin.";
    if (output === "ddl") return generateDDL(model, columns, dialect, staging);
    if (output === "etl") return generateETL(model, dialect, staging);
    return generateDbt(model, staging);
  }, [output, model, columns, dialect, staging, parsed]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ""));
    reader.readAsText(f);
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE_CSV], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "warehouse-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Star layout: fact at centre, dimensions evenly spaced around it
  const points = useMemo(() => {
    const dims = [...model.dateColumns.map((d) => ({ label: `dim_date (${d})`, kind: "date" as const })),
      ...model.dimensions.map((d) => ({ label: d.name, kind: "dim" as const }))];
    const R = 138;
    return dims.map((d, i) => {
      const angle = (i / Math.max(1, dims.length)) * Math.PI * 2 - Math.PI / 2;
      return { ...d, x: 300 + Math.cos(angle) * R * 1.55, y: 175 + Math.sin(angle) * R };
    });
  }, [model]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Paste a flat transactional extract, one row per line item, and this proposes a star schema. It profiles
            every column, then detects <span className="text-accent-300">functional dependencies</span> to work out
            which fields describe the same entity, so <code className="text-accent-300">customer_name</code> and{" "}
            <code className="text-accent-300">customer_city</code> land in one dimension rather than four. Override
            anything it gets wrong.
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
              onClick={downloadTemplate}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500/50"
            >
              Download template
            </button>
            <button
              onClick={() => { setRaw(TEMPLATE_CSV); setOverrides({}); }}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500/50"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Excel: <span className="text-slate-400">File → Save As → CSV UTF-8</span>. Parsing happens in your
            browser, nothing is uploaded.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Fact name</span>
              <input
                value={factName}
                onChange={(e) => setFactName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent-500/60"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Source table</span>
              <input
                value={staging}
                onChange={(e) => setStaging(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent-500/60"
              />
            </label>
          </div>
        </div>

        <textarea
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setOverrides({}); }}
          spellCheck={false}
          className="h-72 w-full rounded-xl border border-white/10 bg-ink-950 p-3 font-mono text-[11px] leading-relaxed text-slate-300 outline-none transition focus:border-accent-500/60"
        />
      </div>

      {/* Column profile with role overrides */}
      {columns.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Column</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Distinct</th>
                <th className="px-3 py-2.5 font-semibold">Nulls</th>
                <th className="px-3 py-2.5 font-semibold">Sample</th>
                <th className="px-3 py-2.5 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((c) => (
                <tr key={c.name} className="border-t border-white/5">
                  <td className="px-3 py-2 font-mono text-slate-200">{c.name}</td>
                  <td className="px-3 py-2 text-slate-400">{c.type}</td>
                  <td className="px-3 py-2 font-mono text-slate-400">
                    {c.distinct}
                    <span className="ml-1 text-slate-600">({Math.round(c.distinctRatio * 100)}%)</span>
                  </td>
                  <td className={`px-3 py-2 font-mono ${c.nulls ? "text-amber-300" : "text-slate-600"}`}>{c.nulls}</td>
                  <td className="max-w-[190px] truncate px-3 py-2 text-slate-500">{c.samples.join(", ")}</td>
                  <td className="px-3 py-2">
                    <select
                      value={c.role}
                      onChange={(e) => setOverrides((o) => ({ ...o, [c.name]: e.target.value as Role }))}
                      className={`rounded-md border px-2 py-1 text-[11px] font-medium outline-none ${ROLE_STYLE[c.role]}`}
                    >
                      {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                        <option key={r} value={r} className="bg-ink-900 text-slate-200">
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Star diagram */}
      {model.dimensions.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950 p-4">
          <svg width={600} height={350} viewBox="0 0 600 350" className="mx-auto min-w-[600px]">
            {points.map((p, i) => (
              <line key={i} x1={300} y1={175} x2={p.x} y2={p.y} stroke="#334155" strokeWidth={1.25} />
            ))}
            {points.map((p, i) => (
              <g key={`n${i}`}>
                <rect
                  x={p.x - 74} y={p.y - 15} width={148} height={30} rx={8}
                  fill={p.kind === "date" ? "rgba(245,158,11,0.10)" : "rgba(56,189,248,0.10)"}
                  stroke={p.kind === "date" ? "#f59e0b" : "#38bdf8"}
                />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10.5" fontFamily="ui-monospace, monospace"
                  fill={p.kind === "date" ? "#fde68a" : "#bae6fd"}>
                  {p.label.length > 21 ? p.label.slice(0, 20) + "…" : p.label}
                </text>
              </g>
            ))}
            <rect x={300 - 88} y={175 - 24} width={176} height={48} rx={10}
              fill="rgba(16,185,129,0.14)" stroke="#34d399" strokeWidth={1.5} />
            <text x={300} y={172} textAnchor="middle" fontSize="12" fontFamily="ui-monospace, monospace" fill="#a7f3d0">
              {model.factName}
            </text>
            <text x={300} y={187} textAnchor="middle" fontSize="9.5" fill="#6ee7b7">
              {model.measures.length} measures · {model.rowCount.toLocaleString()} rows
            </text>
          </svg>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {([["ddl", "Schema DDL"], ["etl", "Load SQL"], ["dbt", "dbt models"]] as [Output, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setOutput(k)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              output === k
                ? "border-accent-500/50 bg-accent-500/15 text-accent-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto w-44">
          <Select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            options={[
              { value: "snowflake", label: "Snowflake" },
              { value: "tsql", label: "SQL Server" },
              { value: "postgres", label: "PostgreSQL" },
            ]}
          />
        </div>
      </div>

      <CodeBlock code={code} filename={output === "dbt" ? "models/marts/*.sql" : `${model.factName}.sql`} />
    </div>
  );
}

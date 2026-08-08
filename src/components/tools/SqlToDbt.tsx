import { useMemo, useState } from "react";
import { CodeBlock, Field, Select, TextInput } from "./ui";
import { extractTables, formatSql } from "./sqlUtils";

const SAMPLE = `select
    o.order_id,
    o.order_date,
    c.customer_name,
    sum(o.sales_amount) as total_sales
from analytics.raw_orders o
left join analytics.raw_customers c on c.customer_id = o.customer_id
where o.order_date >= '2026-01-01'
group by 1, 2, 3`;

type Mat = "view" | "table" | "incremental" | "ephemeral";

export default function SqlToDbt() {
  const [sql, setSql] = useState(SAMPLE);
  const [model, setModel] = useState("fct_orders");
  const [mat, setMat] = useState<Mat>("table");
  const [uniqueKey, setUniqueKey] = useState("order_id");
  const [asSource, setAsSource] = useState(true);
  const [sourceName, setSourceName] = useState("analytics");

  const { tables, ctes } = useMemo(() => extractTables(sql), [sql]);

  const converted = useMemo(() => {
    if (!sql.trim()) return "-- Paste a SQL query to convert.";

    let body = sql;
    for (const t of tables) {
      const bare = t.split(".").pop()!;
      const replacement = asSource ? `{{ source('${sourceName}', '${bare}') }}` : `{{ ref('${bare}') }}`;
      body = body.replace(new RegExp(`\\b${t.replace(/\./g, "\\.")}\\b`, "g"), replacement);
    }

    const cfg = [`    materialized='${mat}'`];
    if (mat === "incremental") {
      cfg.push(`    unique_key='${uniqueKey}'`, `    on_schema_change='append_new_columns'`);
    }

    const header = `{{ config(\n${cfg.join(",\n")}\n) }}`;
    const incFilter =
      mat === "incremental"
        ? `\n\n{% if is_incremental() %}\n  -- only process rows newer than what's already loaded\n  where order_date > (select coalesce(max(order_date), '1900-01-01') from {{ this }})\n{% endif %}`
        : "";

    return `-- models/${model}.sql\n${header}\n\n${formatSql(body, { upper: false, indent: 4 })}${incFilter}`;
  }, [sql, tables, model, mat, uniqueKey, asSource, sourceName]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Turns ad-hoc SQL into a dbt model: swaps hard-coded table names for{" "}
            <code className="text-accent-300">source()</code> or <code className="text-accent-300">ref()</code>, adds
            the config block, and scaffolds the{" "}
            <code className="text-accent-300">is_incremental()</code> guard. CTE names are left alone, only real
            tables get rewritten.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Model name">
              <TextInput value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
            <Field label="Materialization">
              <Select
                value={mat}
                onChange={(e) => setMat(e.target.value as Mat)}
                options={[
                  { value: "view", label: "view" },
                  { value: "table", label: "table" },
                  { value: "incremental", label: "incremental" },
                  { value: "ephemeral", label: "ephemeral" },
                ]}
              />
            </Field>
            <Field label="Reference as">
              <Select
                value={asSource ? "source" : "ref"}
                onChange={(e) => setAsSource(e.target.value === "source")}
                options={[
                  { value: "source", label: "source()" },
                  { value: "ref", label: "ref()" },
                ]}
              />
            </Field>
            {asSource ? (
              <Field label="Source name">
                <TextInput value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
              </Field>
            ) : (
              <Field label="Unique key">
                <TextInput value={uniqueKey} onChange={(e) => setUniqueKey(e.target.value)} />
              </Field>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {tables.length} table{tables.length === 1 ? "" : "s"} detected
            {tables.length ? `: ${tables.join(", ")}` : ""}
            {ctes.length ? ` · ${ctes.length} CTE(s) skipped` : ""}
          </p>
        </div>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
          className="h-64 w-full rounded-xl border border-white/10 bg-ink-950 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none transition focus:border-accent-500/60"
        />
      </div>
      <CodeBlock code={converted} filename={`models/${model}.sql`} />
    </div>
  );
}

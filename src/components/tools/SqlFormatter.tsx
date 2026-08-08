import { useMemo, useState } from "react";
import { CodeBlock, Field, Select } from "./ui";
import { formatSql } from "./sqlUtils";

const SAMPLE = `select c.customer_id, c.customer_name, sum(o.sales_amount) as total_sales, count(distinct o.order_id) as orders from raw.orders o inner join raw.customers c on c.customer_id = o.customer_id left join raw.stores s on s.store_id = o.store_id where o.order_date >= '2026-01-01' and o.status not in ('cancelled','returned') group by c.customer_id, c.customer_name having sum(o.sales_amount) > 1000 order by total_sales desc`;

export default function SqlFormatter() {
  const [sql, setSql] = useState(SAMPLE);
  const [upper, setUpper] = useState(false);
  const [indent, setIndent] = useState(4);

  const formatted = useMemo(() => {
    try {
      return sql.trim() ? formatSql(sql, { upper, indent }) : "-- Paste SQL to format.";
    } catch {
      return "-- Could not format that input.";
    }
  }, [sql, upper, indent]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Tokenises before rewriting, so string literals and comments are left exactly as written, which is the usual
            failure of regex-based formatters. Breaks the select list at bracket depth zero, so window functions and
            nested calls stay on one line.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Keyword case">
              <Select
                value={upper ? "upper" : "lower"}
                onChange={(e) => setUpper(e.target.value === "upper")}
                options={[
                  { value: "lower", label: "lowercase (dbt style)" },
                  { value: "upper", label: "UPPERCASE" },
                ]}
              />
            </Field>
            <Field label="Indent">
              <Select
                value={String(indent)}
                onChange={(e) => setIndent(Number(e.target.value))}
                options={[
                  { value: "2", label: "2 spaces" },
                  { value: "4", label: "4 spaces" },
                ]}
              />
            </Field>
          </div>
          <button
            onClick={() => setSql(SAMPLE)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500/50"
          >
            Load example
          </button>
        </div>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
          className="h-56 w-full rounded-xl border border-white/10 bg-ink-950 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none transition focus:border-accent-500/60"
        />
      </div>
      <CodeBlock code={formatted} filename="formatted.sql" />
    </div>
  );
}

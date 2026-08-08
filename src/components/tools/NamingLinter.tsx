import { useMemo, useState } from "react";
import { Field, Select } from "./ui";

const SAMPLE = `stg_orders
StagingCustomers
int_order_payments
fct_sales
Dim_Product
sales_fact
rpt revenue daily
stg_orders_v2
dim_date
tmp_backup_final`;

type Kind = "model" | "column";

interface Issue {
  name: string;
  level: "error" | "warn" | "ok";
  messages: string[];
  suggestion: string;
}

const PREFIXES = ["stg_", "int_", "fct_", "dim_", "rpt_", "mart_", "base_"];
const RESERVED = ["select", "from", "where", "order", "group", "table", "user", "date", "case", "end", "index", "key"];

function toSnake(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s\-.]+/g, "_")
    .toLowerCase()
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function lint(name: string, kind: Kind): Issue {
  const msgs: string[] = [];
  const snake = toSnake(name);

  if (name !== name.toLowerCase()) msgs.push("Contains uppercase, use snake_case");
  if (/\s/.test(name)) msgs.push("Contains spaces, will need quoting everywhere");
  if (/-/.test(name)) msgs.push("Contains hyphens, invalid unquoted");
  if (/__/.test(name)) msgs.push("Double underscore");
  if (/^_|_$/.test(name)) msgs.push("Leading or trailing underscore");
  if (RESERVED.includes(name.toLowerCase())) msgs.push("Reserved SQL word");
  if (/(_v\d+|_final|_new|_old|_copy|_backup|_tmp|^tmp_|^temp_|_test)$|^tmp_/i.test(name))
    msgs.push("Versioned or temporary name, git already tracks history");
  if (name.length > 40) msgs.push("Longer than 40 characters");

  let suggestion = snake;

  if (kind === "model") {
    const hasPrefix = PREFIXES.some((p) => snake.startsWith(p));
    if (!hasPrefix) {
      msgs.push(`Missing layer prefix (${PREFIXES.map((p) => p.replace("_", "")).join(", ")})`);
      // "sales_fact" → "fct_sales"
      const m = snake.match(/^(.*)_(fact|facts|dim|dimension)$/);
      suggestion = m ? `${m[2].startsWith("fact") ? "fct" : "dim"}_${m[1]}` : `stg_${snake}`;
    }
    if (/^(fct|dim)_.*s$/.test(snake) && /^dim_/.test(snake)) {
      msgs.push("Dimensions are conventionally singular");
      suggestion = suggestion.replace(/s$/, "");
    }
  } else {
    if (/^(id)$/i.test(name)) {
      msgs.push("Bare `id` is ambiguous, prefix it with the entity");
      suggestion = "entity_id";
    }
    if (/(_flg|_ind)$/i.test(name)) {
      msgs.push("Use is_/has_ for booleans rather than _flg/_ind");
      suggestion = "is_" + snake.replace(/(_flg|_ind)$/i, "");
    }
    if (/^(dt|dte)_|_dt$/i.test(name)) {
      msgs.push("Abbreviated date, prefer _date or _at");
      suggestion = snake.replace(/^dt e?_|_dt$/i, "") + "_date";
    }
  }

  const level: Issue["level"] = msgs.some((m) =>
    /uppercase|spaces|hyphens|Reserved|prefix/i.test(m),
  )
    ? "error"
    : msgs.length
      ? "warn"
      : "ok";

  return { name, level, messages: msgs, suggestion: suggestion === name ? "" : suggestion };
}

export default function NamingLinter() {
  const [raw, setRaw] = useState(SAMPLE);
  const [kind, setKind] = useState<Kind>("model");

  const results = useMemo(
    () => raw.split("\n").map((l) => l.trim()).filter(Boolean).map((n) => lint(n, kind)),
    [raw, kind],
  );

  const counts = useMemo(
    () => ({
      error: results.filter((r) => r.level === "error").length,
      warn: results.filter((r) => r.level === "warn").length,
      ok: results.filter((r) => r.level === "ok").length,
    }),
    [results],
  );

  const style = {
    error: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    ok: "border-accent-500/40 bg-accent-500/10 text-accent-300",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Paste model or column names, one per line. Flags casing, spacing, reserved words, missing layer prefixes,
            and the versioned names that quietly accumulate in every warehouse, then suggests the fix.
          </p>
          <Field label="Linting">
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              options={[
                { value: "model", label: "Model / table names" },
                { value: "column", label: "Column names" },
              ]}
            />
          </Field>
          <div className="flex gap-2 text-xs">
            <span className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-rose-200">
              {counts.error} errors
            </span>
            <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-200">
              {counts.warn} warnings
            </span>
            <span className="rounded-lg border border-accent-500/40 bg-accent-500/10 px-2.5 py-1 text-accent-300">
              {counts.ok} clean
            </span>
          </div>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
          className="h-64 w-full rounded-xl border border-white/10 bg-ink-950 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none transition focus:border-accent-500/60"
        />
      </div>

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className={`rounded-xl border px-4 py-3 ${style[r.level]}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-sm font-semibold">{r.name}</span>
              {r.suggestion && (
                <span className="font-mono text-xs opacity-80">→ {r.suggestion}</span>
              )}
            </div>
            {r.messages.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-xs opacity-90">
                {r.messages.map((m, j) => (
                  <li key={j}>· {m}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

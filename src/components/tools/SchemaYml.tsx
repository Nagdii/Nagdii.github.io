import { useMemo, useState } from "react";
import { CodeBlock, Field, Select, TextInput } from "./ui";

const SAMPLE = `order_id
order_date
customer_id
customer_name
status
quantity
sales_amount`;

const NOT_NULL = /(_id$|^id$|_date$|_at$|amount|qty|quantity|status|name)/i;
const UNIQUE = /(^id$|_id$|_key$)/i;
const ACCEPTED = /(status|type|category|segment|flag|is_)/i;
const RELATION = /^(.+)_id$/i;

function describe(name: string): string {
  const words = name.replace(/_/g, " ").replace(/\bid\b/i, "identifier").trim();
  return words.charAt(0).toUpperCase() + words.slice(1) + ".";
}

export default function SchemaYml() {
  const [raw, setRaw] = useState(SAMPLE);
  const [model, setModel] = useState("stg_orders");
  const [grain, setGrain] = useState("order_id");
  const [style, setStyle] = useState<"tests" | "contract">("tests");

  const columns = useMemo(
    () =>
      raw
        .split(/[\n,]/)
        .map((c) => c.trim().replace(/[",;]/g, ""))
        .filter(Boolean),
    [raw],
  );

  const yml = useMemo(() => {
    if (!columns.length) return "# Paste a column list to begin.";

    const lines: string[] = ["version: 2", "", "models:", `  - name: ${model}`, `    description: "TODO: what this model represents, and its grain."`];

    if (style === "contract") {
      lines.push("    config:", "      contract:", "        enforced: true");
    }

    lines.push("    columns:");

    for (const c of columns) {
      lines.push(`      - name: ${c}`);
      lines.push(`        description: "${describe(c)}"`);
      if (style === "contract") lines.push(`        data_type: ${/(_id$|^id$)/i.test(c) ? "varchar" : /amount|price|qty|quantity/i.test(c) ? "numeric" : /_date$|_at$/i.test(c) ? "date" : "varchar"}`);

      const tests: string[] = [];
      if (c === grain) tests.push("          - unique", "          - not_null");
      else {
        if (UNIQUE.test(c) && c !== grain) tests.push("          - not_null");
        else if (NOT_NULL.test(c)) tests.push("          - not_null");
      }

      const rel = c.match(RELATION);
      if (rel && c !== grain) {
        tests.push(
          "          - relationships:",
          `              to: ref('dim_${rel[1].toLowerCase()}')`,
          `              field: ${c}`,
        );
      }
      if (ACCEPTED.test(c)) {
        tests.push("          - accepted_values:", "              values: ['TODO', 'TODO']");
      }

      if (tests.length) {
        lines.push("        tests:");
        lines.push(...tests);
      }
    }

    return lines.join("\n");
  }, [columns, model, grain, style]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Paste column names, one per line or comma separated, and get a{" "}
            <code className="text-accent-300">schema.yml</code> with descriptions and sensible tests already wired.
            Anything ending in <code className="text-accent-300">_id</code> gets a{" "}
            <code className="text-accent-300">relationships</code> test pointed at the matching dimension, so you
            only fill in the gaps.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Model name">
              <TextInput value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
            <Field label="Grain (unique key)">
              <TextInput value={grain} onChange={(e) => setGrain(e.target.value)} />
            </Field>
          </div>
          <Field label="Output" hint="Contracts add data_type and enforce the schema at build time.">
            <Select
              value={style}
              onChange={(e) => setStyle(e.target.value as "tests" | "contract")}
              options={[
                { value: "tests", label: "Tests only" },
                { value: "contract", label: "Tests + model contract" },
              ]}
            />
          </Field>
          <p className="text-xs text-slate-500">{columns.length} columns detected.</p>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
          className="h-64 w-full rounded-xl border border-white/10 bg-ink-950 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none transition focus:border-accent-500/60"
        />
      </div>
      <CodeBlock code={yml} filename={`models/${model}.yml`} />
    </div>
  );
}

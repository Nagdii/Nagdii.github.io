import { useState } from "react";
import Section from "./Section";
import DbtLineage from "./tools/DbtLineage";
import DateDimension from "./tools/DateDimension";
import SnowflakeCost from "./tools/SnowflakeCost";
import DaxPatterns from "./tools/DaxPatterns";

const TOOLS = [
  {
    id: "lineage",
    name: "dbt Lineage Visualizer",
    blurb: "Paste models, see the DAG",
    Component: DbtLineage,
  },
  {
    id: "cost",
    name: "Snowflake Cost Estimator",
    blurb: "Model warehouse spend before the invoice",
    Component: SnowflakeCost,
  },
  {
    id: "date",
    name: "Date Dimension Generator",
    blurb: "Calendar tables with fiscal periods",
    Component: DateDimension,
  },
  {
    id: "dax",
    name: "DAX Time Intelligence",
    blurb: "Correct measures, no divide-by-zero",
    Component: DaxPatterns,
  },
];

export default function Tools() {
  const [active, setActive] = useState(TOOLS[0].id);
  const Current = TOOLS.find((t) => t.id === active)!.Component;

  return (
    <Section
      id="tools"
      eyebrow="Free Tools"
      title="Built for analytics engineers"
      lead="Small utilities I reach for on real projects. Everything runs in your browser — no sign-up, no upload, nothing leaves the page."
      className="bg-ink-900/40"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-xl border p-4 text-left transition ${
                on
                  ? "border-accent-500/50 bg-accent-500/10"
                  : "border-white/10 bg-ink-900 hover:border-white/25"
              }`}
            >
              <div className={`text-sm font-semibold ${on ? "text-accent-300" : "text-white"}`}>{t.name}</div>
              <div className="mt-1 text-xs text-slate-400">{t.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900 p-5 sm:p-7">
        <Current />
      </div>
    </Section>
  );
}

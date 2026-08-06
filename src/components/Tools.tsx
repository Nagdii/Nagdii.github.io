import { useState } from "react";
import Section from "./Section";
import DbtLineage from "./tools/DbtLineage";
import DateDimension from "./tools/DateDimension";
import SnowflakeCost from "./tools/SnowflakeCost";
import DaxPatterns from "./tools/DaxPatterns";
import WarehouseDesigner from "./tools/WarehouseDesigner";
import CsvToDdl from "./tools/CsvToDdl";
import SchemaYml from "./tools/SchemaYml";
import SqlToDbt from "./tools/SqlToDbt";
import NamingLinter from "./tools/NamingLinter";
import SqlFormatter from "./tools/SqlFormatter";
import PowerQuerySnippets from "./tools/PowerQuerySnippets";

const TOOLS = [
  { id: "warehouse", group: "Modeling", name: "Data Warehouse Designer", blurb: "Flat extract → star schema", Component: WarehouseDesigner },
  { id: "lineage", group: "Modeling", name: "dbt Lineage Visualizer", blurb: "Paste models, see the DAG", Component: DbtLineage },
  { id: "date", group: "Modeling", name: "Date Dimension Generator", blurb: "Calendar tables with fiscal periods", Component: DateDimension },

  { id: "csv", group: "dbt & SQL", name: "CSV → DDL & Seed", blurb: "Infer types, emit CREATE TABLE", Component: CsvToDdl },
  { id: "schema", group: "dbt & SQL", name: "schema.yml Generator", blurb: "Descriptions and tests, prefilled", Component: SchemaYml },
  { id: "sqldbt", group: "dbt & SQL", name: "SQL → dbt Model", blurb: "Add refs, config and incremental", Component: SqlToDbt },
  { id: "format", group: "dbt & SQL", name: "SQL Formatter", blurb: "Literal-safe pretty printer", Component: SqlFormatter },
  { id: "naming", group: "dbt & SQL", name: "Naming Linter", blurb: "Catch casing and prefix drift", Component: NamingLinter },

  { id: "dax", group: "Power BI", name: "DAX Time Intelligence", blurb: "Correct measures, no divide-by-zero", Component: DaxPatterns },
  { id: "pq", group: "Power BI", name: "Power Query Snippets", blurb: "Pagination, folding, fuzzy merge", Component: PowerQuerySnippets },

  { id: "cost", group: "Platform", name: "Snowflake Cost Estimator", blurb: "Model spend before the invoice", Component: SnowflakeCost },
];

const GROUPS = ["Modeling", "dbt & SQL", "Power BI", "Platform"];

export default function Tools() {
  const [active, setActive] = useState(TOOLS[0].id);
  const Current = TOOLS.find((t) => t.id === active)!.Component;

  return (
    <Section
      id="tools"
      eyebrow="Free Tools"
      title="Built for analytics engineers"
      lead={`${TOOLS.length} utilities I reach for on real projects. Everything runs in your browser — no sign-up, no upload, nothing leaves the page.`}
      className="bg-ink-900/40"
    >
      <div className="space-y-5">
        {GROUPS.map((g) => (
          <div key={g}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{g}</p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.filter((t) => t.group === g).map((t) => {
                const on = t.id === active;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      on ? "border-accent-500/50 bg-accent-500/10" : "border-white/10 bg-ink-900 hover:border-white/25"
                    }`}
                  >
                    <div className={`text-sm font-semibold ${on ? "text-accent-300" : "text-white"}`}>{t.name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{t.blurb}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-ink-900 p-5 sm:p-7">
        <Current />
      </div>
    </Section>
  );
}

import { useMemo, useState } from "react";
import { CodeBlock, Field, Select, TextInput } from "./ui";

type Pattern =
  | "ytd" | "qtd" | "mtd" | "py" | "yoy" | "yoyPct"
  | "rolling12" | "movingAvg3" | "runningTotal" | "pctOfTotal";

const PATTERNS: { value: Pattern; label: string; note: string }[] = [
  { value: "ytd", label: "Year to date", note: "Resets each fiscal year." },
  { value: "qtd", label: "Quarter to date", note: "Resets each quarter." },
  { value: "mtd", label: "Month to date", note: "Resets each month." },
  { value: "py", label: "Prior year", note: "Same period, previous year." },
  { value: "yoy", label: "Year over year (Δ)", note: "Absolute change vs prior year." },
  { value: "yoyPct", label: "Year over year (%)", note: "Guarded against divide-by-zero." },
  { value: "rolling12", label: "Rolling 12 months", note: "Trailing twelve months." },
  { value: "movingAvg3", label: "3-month moving average", note: "Smooths seasonality." },
  { value: "runningTotal", label: "Running total", note: "Cumulative across all time." },
  { value: "pctOfTotal", label: "% of total", note: "Share of the removed-filter total." },
];

function build(p: Pattern, measure: string, dateTable: string, dateCol: string, fiscalEnd: string) {
  const m = measure.startsWith("[") ? measure : `[${measure}]`;
  const name = m.slice(1, -1);
  const dt = `'${dateTable}'`;
  const dcol = `${dt}[${dateCol}]`;
  const ye = fiscalEnd ? `, "${fiscalEnd}"` : "";

  const src: Record<Pattern, string> = {
    ytd: `${name} YTD =\nTOTALYTD ( ${m}, ${dcol}${ye} )`,
    qtd: `${name} QTD =\nTOTALQTD ( ${m}, ${dcol} )`,
    mtd: `${name} MTD =\nTOTALMTD ( ${m}, ${dcol} )`,
    py: `${name} PY =\nCALCULATE ( ${m}, SAMEPERIODLASTYEAR ( ${dcol} ) )`,
    yoy: `${name} YoY =\nVAR _current = ${m}\nVAR _prior   = CALCULATE ( ${m}, SAMEPERIODLASTYEAR ( ${dcol} ) )\nRETURN\n    IF ( NOT ISBLANK ( _current ) && NOT ISBLANK ( _prior ), _current - _prior )`,
    yoyPct: `${name} YoY % =\nVAR _current = ${m}\nVAR _prior   = CALCULATE ( ${m}, SAMEPERIODLASTYEAR ( ${dcol} ) )\nRETURN\n    DIVIDE ( _current - _prior, _prior )`,
    rolling12: `${name} Rolling 12M =\nCALCULATE (\n    ${m},\n    DATESINPERIOD ( ${dcol}, MAX ( ${dcol} ), -12, MONTH )\n)`,
    movingAvg3: `${name} 3M Moving Avg =\nAVERAGEX (\n    DATESINPERIOD ( ${dcol}, MAX ( ${dcol} ), -3, MONTH ),\n    CALCULATE ( ${m} )\n)`,
    runningTotal: `${name} Running Total =\nCALCULATE (\n    ${m},\n    FILTER ( ALLSELECTED ( ${dcol} ), ${dcol} <= MAX ( ${dcol} ) )\n)`,
    pctOfTotal: `${name} % of Total =\nDIVIDE (\n    ${m},\n    CALCULATE ( ${m}, REMOVEFILTERS ( ${dt} ) )\n)`,
  };
  return src[p];
}

export default function DaxPatterns() {
  const [measure, setMeasure] = useState("Total Sales");
  const [dateTable, setDateTable] = useState("Date");
  const [dateCol, setDateCol] = useState("Date");
  const [fiscalEnd, setFiscalEnd] = useState("");
  const [selected, setSelected] = useState<Pattern[]>(["ytd", "py", "yoyPct", "rolling12"]);

  const code = useMemo(
    () =>
      selected.length
        ? selected.map((p) => build(p, measure || "Measure", dateTable || "Date", dateCol || "Date", fiscalEnd)).join("\n\n")
        : "-- Select at least one pattern.",
    [selected, measure, dateTable, dateCol, fiscalEnd],
  );

  function toggle(p: Pattern) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <p className="text-sm leading-relaxed text-slate-400">
          Time intelligence is where most DAX goes wrong, usually a missing divide guard or a date table that
          isn't marked. Pick your patterns and get correct, formatted measures you can paste straight into Tabular
          Editor.
        </p>
        <Field label="Base measure">
          <TextInput value={measure} onChange={(e) => setMeasure(e.target.value)} placeholder="Total Sales" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date table">
            <TextInput value={dateTable} onChange={(e) => setDateTable(e.target.value)} />
          </Field>
          <Field label="Date column">
            <TextInput value={dateCol} onChange={(e) => setDateCol(e.target.value)} />
          </Field>
        </div>
        <Field label="Fiscal year end" hint="Leave blank for a calendar year.">
          <Select
            value={fiscalEnd}
            onChange={(e) => setFiscalEnd(e.target.value)}
            options={[
              { value: "", label: "31 December (calendar)" },
              { value: "01/31", label: "31 January" },
              { value: "03/31", label: "31 March" },
              { value: "06/30", label: "30 June" },
              { value: "09/30", label: "30 September" },
            ]}
          />
        </Field>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="flex flex-wrap gap-2">
          {PATTERNS.map((p) => {
            const on = selected.includes(p.value);
            return (
              <button
                key={p.value}
                onClick={() => toggle(p.value)}
                title={p.note}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-accent-500/50 bg-accent-500/15 text-accent-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <CodeBlock code={code} filename="measures.dax" />
        <p className="text-xs text-slate-500">
          Assumes a contiguous date table marked with <span className="text-slate-400">Mark as Date Table</span>.
          without it, time intelligence silently returns wrong results.
        </p>
      </div>
    </div>
  );
}

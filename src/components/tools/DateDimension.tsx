import { useMemo, useState } from "react";
import { CodeBlock, Field, Select, TextInput } from "./ui";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Dialect = "snowflake" | "tsql" | "postgres";

/** ISO-8601 week number. */
function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function buildPreview(start: string, fiscalStart: number, rows: number) {
  const out: Record<string, string>[] = [];
  const d = new Date(start + "T00:00:00Z");
  if (isNaN(d.getTime())) return out;

  for (let i = 0; i < rows; i++) {
    const cur = new Date(d.getTime() + i * 86400000);
    const m = cur.getUTCMonth() + 1;
    const y = cur.getUTCFullYear();
    // Fiscal year rolls forward once the calendar month reaches the fiscal start month
    const fy = m >= fiscalStart ? y + 1 : y;
    const fp = ((m - fiscalStart + 12) % 12) + 1;
    out.push({
      date_key: `${y}${String(m).padStart(2, "0")}${String(cur.getUTCDate()).padStart(2, "0")}`,
      date: cur.toISOString().slice(0, 10),
      day_name: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][cur.getUTCDay()],
      month_name: MONTHS[m - 1],
      quarter: `Q${Math.floor((m - 1) / 3) + 1}`,
      iso_week: String(isoWeek(cur)),
      fiscal_year: `FY${fy}`,
      fiscal_period: `P${fp}`,
      is_weekend: cur.getUTCDay() === 0 || cur.getUTCDay() === 6 ? "TRUE" : "FALSE",
    });
  }
  return out;
}

function sqlFor(dialect: Dialect, start: string, end: string, fiscalStart: number) {
  const fy =
    dialect === "tsql"
      ? `CASE WHEN MONTH(d) >= ${fiscalStart} THEN YEAR(d) + 1 ELSE YEAR(d) END`
      : `CASE WHEN EXTRACT(MONTH FROM d) >= ${fiscalStart} THEN EXTRACT(YEAR FROM d) + 1 ELSE EXTRACT(YEAR FROM d) END`;

  if (dialect === "snowflake") {
    return `-- Snowflake date dimension, ${start} to ${end}
create or replace table dim_date as
with bounds as (
    select '${start}'::date as start_date, '${end}'::date as end_date
),
days as (
    select dateadd(day, seq4(), (select start_date from bounds))::date as d
    from table(generator(rowcount => 40000))
    qualify d <= (select end_date from bounds)
)
select
    to_number(to_char(d, 'YYYYMMDD'))          as date_key,
    d                                          as date,
    year(d)                                    as year,
    quarter(d)                                 as quarter,
    month(d)                                   as month,
    monthname(d)                               as month_name,
    day(d)                                     as day_of_month,
    dayofweek(d)                               as day_of_week,
    dayname(d)                                 as day_name,
    weekiso(d)                                 as iso_week,
    ${fy} as fiscal_year,
    mod(month(d) - ${fiscalStart} + 12, 12) + 1                as fiscal_period,
    iff(dayofweek(d) in (0, 6), true, false)   as is_weekend,
    date_trunc('month', d)                     as month_start,
    last_day(d)                                as month_end
from days
order by d;`;
  }

  if (dialect === "tsql") {
    return `-- SQL Server date dimension, ${start} to ${end}
;with days as (
    select cast('${start}' as date) as d
    union all
    select dateadd(day, 1, d) from days where d < cast('${end}' as date)
)
select
    convert(int, format(d, 'yyyyMMdd'))        as date_key,
    d                                          as [date],
    year(d)                                    as [year],
    datepart(quarter, d)                       as [quarter],
    month(d)                                   as [month],
    datename(month, d)                         as month_name,
    day(d)                                     as day_of_month,
    datepart(weekday, d)                       as day_of_week,
    datename(weekday, d)                       as day_name,
    datepart(iso_week, d)                      as iso_week,
    ${fy} as fiscal_year,
    ((month(d) - ${fiscalStart} + 12) % 12) + 1                as fiscal_period,
    case when datepart(weekday, d) in (1, 7) then 1 else 0 end as is_weekend,
    datefromparts(year(d), month(d), 1)        as month_start,
    eomonth(d)                                 as month_end
into dim_date
from days
option (maxrecursion 0);`;
  }

  return `-- PostgreSQL date dimension, ${start} to ${end}
create table dim_date as
select
    to_char(d, 'YYYYMMDD')::int                as date_key,
    d::date                                    as date,
    extract(year from d)::int                  as year,
    extract(quarter from d)::int               as quarter,
    extract(month from d)::int                 as month,
    to_char(d, 'Month')                        as month_name,
    extract(day from d)::int                   as day_of_month,
    extract(dow from d)::int                   as day_of_week,
    to_char(d, 'Day')                          as day_name,
    extract(week from d)::int                  as iso_week,
    ${fy} as fiscal_year,
    mod(extract(month from d)::int - ${fiscalStart} + 12, 12) + 1 as fiscal_period,
    extract(dow from d) in (0, 6)              as is_weekend,
    date_trunc('month', d)::date               as month_start,
    (date_trunc('month', d) + interval '1 month - 1 day')::date as month_end
from generate_series('${start}'::date, '${end}'::date, interval '1 day') as d;`;
}

export default function DateDimension() {
  const [start, setStart] = useState("2023-01-01");
  const [end, setEnd] = useState("2027-12-31");
  const [dialect, setDialect] = useState<Dialect>("snowflake");
  const [fiscalStart, setFiscalStart] = useState(2);

  const sql = useMemo(() => sqlFor(dialect, start, end, fiscalStart), [dialect, start, end, fiscalStart]);
  const preview = useMemo(() => buildPreview(start, fiscalStart, 5), [start, fiscalStart]);
  const days = useMemo(() => {
    const a = new Date(start + "T00:00:00Z").getTime();
    const b = new Date(end + "T00:00:00Z").getTime();
    return isNaN(a) || isNaN(b) || b < a ? 0 : Math.floor((b - a) / 86400000) + 1;
  }, [start, end]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <p className="text-sm leading-relaxed text-slate-400">
          Every model needs a calendar table, and hand-rolling one wastes an afternoon. Set your range and fiscal
          year, get production-ready SQL with ISO weeks and fiscal periods already handled.
        </p>
        <Field label="Start date">
          <TextInput type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="End date">
          <TextInput type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
        <Field label="Warehouse dialect">
          <Select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            options={[
              { value: "snowflake", label: "Snowflake" },
              { value: "tsql", label: "SQL Server (T-SQL)" },
              { value: "postgres", label: "PostgreSQL" },
            ]}
          />
        </Field>
        <Field label="Fiscal year starts" hint={`FY labelled by the year it ends in. ${days.toLocaleString()} rows total.`}>
          <Select
            value={String(fiscalStart)}
            onChange={(e) => setFiscalStart(Number(e.target.value))}
            options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
          />
        </Field>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <CodeBlock code={sql} filename="dim_date.sql" />
        {preview.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  {Object.keys(preview[0]).map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {preview.map((r, i) => (
                  <tr key={i} className="border-t border-white/5">
                    {Object.values(r).map((v, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-2 font-mono">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

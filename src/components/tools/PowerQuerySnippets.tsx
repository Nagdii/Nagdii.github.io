import { useMemo, useState } from "react";
import { CodeBlock } from "./ui";

interface Snippet {
  id: string;
  name: string;
  blurb: string;
  code: string;
}

const SNIPPETS: Snippet[] = [
  {
    id: "unpivot",
    name: "Unpivot wide columns",
    blurb: "Turn month-per-column spreadsheets into tidy rows",
    code: `let
    Source = Excel.CurrentWorkbook(){[Name="Budget"]}[Content],
    Typed  = Table.TransformColumnTypes(Source, {{"Cost Centre", type text}}),
    // Everything except the key columns becomes attribute/value pairs
    Unpivoted = Table.UnpivotOtherColumns(
        Typed,
        {"Cost Centre", "Account"},
        "Month",
        "Amount"
    ),
    Cleaned = Table.TransformColumnTypes(Unpivoted, {
        {"Month", type text},
        {"Amount", type number}
    })
in
    Cleaned`,
  },
  {
    id: "paginate",
    name: "Paginated REST API",
    blurb: "Loop pages until the API stops returning rows",
    code: `let
    BaseUrl  = "https://api.example.com/v1/orders",
    PageSize = 500,

    GetPage = (page as number) as list =>
        let
            Response = Json.Document(
                Web.Contents(BaseUrl, [
                    Query   = [ page = Text.From(page), per_page = Text.From(PageSize) ],
                    Headers = [ Authorization = "Bearer " & ApiKey ]
                ])
            )
        in
            Response[data],

    // Keep requesting until a short page comes back
    Fetch = List.Generate(
        () => [ p = 1, rows = GetPage(1) ],
        each List.Count([rows]) > 0,
        each [ p = [p] + 1, rows = GetPage([p] + 1) ],
        each [rows]
    ),

    AllRows = List.Combine(Fetch),
    Table   = Table.FromRecords(AllRows)
in
    Table`,
  },
  {
    id: "fuzzy",
    name: "Fuzzy merge",
    blurb: "Join on near-matching text, with a similarity threshold",
    code: `let
    Left  = Source,
    Right = MasterList,
    Merged = Table.FuzzyNestedJoin(
        Left,  {"CustomerName"},
        Right, {"CanonicalName"},
        "Match",
        JoinKind.LeftOuter,
        [
            IgnoreCase = true,
            IgnoreSpace = true,
            SimilarityColumnName = "Similarity",
            Threshold = 0.8
        ]
    ),
    Expanded = Table.ExpandTableColumn(Merged, "Match", {"CanonicalName", "Similarity"})
in
    Expanded`,
  },
  {
    id: "errors",
    name: "Error handling",
    blurb: "Replace errors without silently losing rows",
    code: `let
    Source = PreviousStep,

    // Keep a flag so bad rows can be reported rather than hidden
    Flagged = Table.AddColumn(Source, "HasError", each
        try Number.From([Amount]) otherwise null, type nullable number),

    Safe = Table.TransformColumns(
        Flagged,
        {{"Amount", each try Number.From(_) otherwise 0, type number}}
    ),

    BadRows = Table.SelectRows(Flagged, each [HasError] = null)
    // Load BadRows to its own table so failures stay visible
in
    Safe`,
  },
  {
    id: "incremental",
    name: "Incremental refresh params",
    blurb: "RangeStart / RangeEnd filter Power BI requires",
    code: `// Create parameters RangeStart and RangeEnd as Date/Time first.
let
    Source = Sql.Database("server", "warehouse"),
    Orders = Source{[Schema="dbo", Item="fct_orders"]}[Data],

    // Must be a direct comparison for query folding to work
    Filtered = Table.SelectRows(Orders, each
        [order_date] >= RangeStart and [order_date] < RangeEnd
    )
in
    Filtered`,
  },
  {
    id: "calendar",
    name: "Calendar table",
    blurb: "Date dimension generated entirely in M",
    code: `let
    StartDate = #date(2023, 1, 1),
    EndDate   = #date(2027, 12, 31),
    Days      = Duration.Days(EndDate - StartDate) + 1,
    Dates     = List.Dates(StartDate, Days, #duration(1, 0, 0, 0)),
    Table     = Table.FromList(Dates, Splitter.SplitByNothing(), {"Date"}),
    Typed     = Table.TransformColumnTypes(Table, {{"Date", type date}}),
    Added = Table.AddColumn(Typed, "Year",      each Date.Year([Date]), Int64.Type),
    Added2 = Table.AddColumn(Added, "Month",    each Date.Month([Date]), Int64.Type),
    Added3 = Table.AddColumn(Added2, "MonthName", each Date.MonthName([Date]), type text),
    Added4 = Table.AddColumn(Added3, "Quarter", each "Q" & Text.From(Date.QuarterOfYear([Date])), type text),
    Added5 = Table.AddColumn(Added4, "IsWeekend", each Date.DayOfWeek([Date], Day.Monday) >= 5, type logical)
in
    Added5`,
  },
  {
    id: "folding",
    name: "Check query folding",
    blurb: "Find the step where folding breaks",
    code: `// Right-click any step → "View Native Query".
// If it's greyed out, folding stopped at or before that step.
//
// Folds:      SelectRows, SelectColumns, RenameColumns, Group, Join,
//             TransformColumnTypes, Distinct, Sort
// Breaks:     Table.Buffer, Table.AddIndexColumn, custom functions,
//             List.Generate, anything referencing another query's rows
//
// Rule of thumb: do every filter and join BEFORE the first
// non-folding step, so the warehouse does the heavy lifting.
let
    Source   = Sql.Database("server", "warehouse"),
    Orders   = Source{[Schema="dbo", Item="fct_orders"]}[Data],
    Filtered = Table.SelectRows(Orders, each [order_date] >= #date(2026,1,1)),  // folds
    Buffered = Table.Buffer(Filtered)                                            // folding stops here
in
    Buffered`,
  },
];

export default function PowerQuerySnippets() {
  const [active, setActive] = useState(SNIPPETS[0].id);
  const current = useMemo(() => SNIPPETS.find((s) => s.id === active)!, [active]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-2">
        <p className="mb-3 text-sm leading-relaxed text-slate-400">
          The M patterns worth keeping — the ones that are genuinely fiddly to write from memory, especially API
          pagination and query folding.
        </p>
        {SNIPPETS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              s.id === active
                ? "border-accent-500/50 bg-accent-500/10"
                : "border-white/10 bg-ink-950 hover:border-white/25"
            }`}
          >
            <div className={`text-sm font-semibold ${s.id === active ? "text-accent-300" : "text-white"}`}>
              {s.name}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">{s.blurb}</div>
          </button>
        ))}
      </div>
      <div className="lg:col-span-3">
        <CodeBlock code={current.code} filename={`${current.id}.pq`} />
      </div>
    </div>
  );
}

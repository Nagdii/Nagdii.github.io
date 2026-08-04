import { useMemo, useState } from "react";

const EXAMPLE = `-- models/staging/stg_orders.sql
select * from {{ source('shopify', 'orders') }}

-- models/staging/stg_customers.sql
select * from {{ source('shopify', 'customers') }}

-- models/staging/stg_payments.sql
select * from {{ source('stripe', 'payments') }}

-- models/intermediate/int_order_payments.sql
select o.order_id, sum(p.amount) as amount
from {{ ref('stg_orders') }} o
left join {{ ref('stg_payments') }} p using (order_id)
group by 1

-- models/marts/dim_customers.sql
select * from {{ ref('stg_customers') }}

-- models/marts/fct_orders.sql
select *
from {{ ref('int_order_payments') }}
join {{ ref('dim_customers') }} using (customer_id)

-- models/marts/rpt_revenue_daily.sql
select order_date, sum(amount) as revenue
from {{ ref('fct_orders') }}
group by 1`;

interface Node {
  id: string;
  label: string;
  kind: "source" | "model";
  deps: string[];
  layer: number;
}

function parse(text: string): { nodes: Node[]; error?: string } {
  const map = new Map<string, Node>();
  const headerRe = /^\s*--\s*(?:models\/)?(.+?)(?:\.sql)?\s*$/;
  const refRe = /\{\{\s*ref\(\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g;
  const srcRe = /\{\{\s*source\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g;

  let current: Node | null = null;
  for (const raw of text.split("\n")) {
    const header = raw.match(headerRe);
    // A comment line that isn't a jinja ref starts a new model block
    if (header && !raw.includes("{{")) {
      const path = header[1].trim();
      const name = path.split("/").pop()!;
      current = { id: name, label: name, kind: "model", deps: [], layer: 0 };
      map.set(name, current);
      continue;
    }
    if (!current) continue;

    for (const m of raw.matchAll(refRe)) {
      if (!current.deps.includes(m[1])) current.deps.push(m[1]);
    }
    for (const m of raw.matchAll(srcRe)) {
      const id = `${m[1]}.${m[2]}`;
      if (!map.has(id)) map.set(id, { id, label: id, kind: "source", deps: [], layer: 0 });
      if (!current.deps.includes(id)) current.deps.push(id);
    }
  }

  const nodes = [...map.values()];
  if (!nodes.length) return { nodes: [], error: "No models found. Start each block with a comment like `-- models/stg_orders.sql`." };

  // Longest-path layering, with a depth cap so cycles can't hang the browser
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depth = (id: string, seen: Set<string>): number => {
    const n = byId.get(id);
    if (!n || seen.has(id)) return 0;
    seen.add(id);
    let d = 0;
    for (const dep of n.deps) d = Math.max(d, depth(dep, seen) + 1);
    seen.delete(id);
    return d;
  };
  for (const n of nodes) n.layer = n.kind === "source" ? 0 : depth(n.id, new Set());

  const missing = nodes.flatMap((n) => n.deps.filter((d) => !byId.has(d)));
  return {
    nodes,
    error: missing.length ? `Unresolved ref(): ${[...new Set(missing)].join(", ")}` : undefined,
  };
}

const NODE_W = 152;
const NODE_H = 38;
const COL_GAP = 62;
const ROW_GAP = 18;

export default function DbtLineage() {
  const [text, setText] = useState(EXAMPLE);
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, error } = useMemo(() => parse(text), [text]);

  const layout = useMemo(() => {
    const layers = new Map<number, Node[]>();
    for (const n of nodes) {
      if (!layers.has(n.layer)) layers.set(n.layer, []);
      layers.get(n.layer)!.push(n);
    }
    const maxRows = Math.max(1, ...[...layers.values()].map((l) => l.length));
    const pos = new Map<string, { x: number; y: number }>();
    for (const [layer, list] of layers) {
      list.forEach((n, i) => {
        const colHeight = list.length * NODE_H + (list.length - 1) * ROW_GAP;
        const totalHeight = maxRows * NODE_H + (maxRows - 1) * ROW_GAP;
        pos.set(n.id, {
          x: layer * (NODE_W + COL_GAP),
          y: (totalHeight - colHeight) / 2 + i * (NODE_H + ROW_GAP),
        });
      });
    }
    return {
      pos,
      width: (layers.size || 1) * NODE_W + Math.max(0, layers.size - 1) * COL_GAP,
      height: maxRows * NODE_H + (maxRows - 1) * ROW_GAP,
    };
  }, [nodes]);

  const related = useMemo(() => {
    if (!hover) return null;
    const set = new Set<string>([hover]);
    const node = nodes.find((n) => n.id === hover);
    node?.deps.forEach((d) => set.add(d));
    nodes.filter((n) => n.deps.includes(hover)).forEach((n) => set.add(n.id));
    return set;
  }, [hover, nodes]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Paste dbt models and see the DAG without spinning up <code className="text-accent-300">dbt docs</code>.
            Parses <code className="text-accent-300">ref()</code> and{" "}
            <code className="text-accent-300">source()</code>, layers the graph by depth, and flags unresolved
            references. Nothing leaves your browser.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setText(EXAMPLE)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500/50"
            >
              Load example
            </button>
            <button
              onClick={() => setText("")}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500/50"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="h-64 w-full rounded-xl border border-white/10 bg-ink-950 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none transition focus:border-accent-500/60"
        />
      </div>

      <div>
        <div className="rounded-xl border border-white/10 bg-ink-950 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-sky-400" />
              source
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent-400" />
              model
            </span>
            <span>
              {nodes.filter((n) => n.kind === "model").length} models ·{" "}
              {nodes.filter((n) => n.kind === "source").length} sources
            </span>
          </div>

          {error && (
            <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {error}
            </p>
          )}

          {nodes.length > 0 && (
            <div className="overflow-auto">
              <svg
                width={layout.width + 8}
                height={layout.height + 8}
                viewBox={`-4 -4 ${layout.width + 8} ${layout.height + 8}`}
                className="min-w-full"
              >
                {nodes.flatMap((n) =>
                  n.deps.map((d) => {
                    const from = layout.pos.get(d);
                    const to = layout.pos.get(n.id);
                    if (!from || !to) return null;
                    const x1 = from.x + NODE_W;
                    const y1 = from.y + NODE_H / 2;
                    const x2 = to.x;
                    const y2 = to.y + NODE_H / 2;
                    const mid = (x1 + x2) / 2;
                    const lit = related?.has(n.id) && related?.has(d);
                    return (
                      <path
                        key={`${d}->${n.id}`}
                        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={lit ? "#34d399" : "#334155"}
                        strokeWidth={lit ? 2 : 1.25}
                      />
                    );
                  }),
                )}

                {nodes.map((n) => {
                  const p = layout.pos.get(n.id)!;
                  const dim = related ? !related.has(n.id) : false;
                  const isSource = n.kind === "source";
                  return (
                    <g
                      key={n.id}
                      transform={`translate(${p.x}, ${p.y})`}
                      opacity={dim ? 0.28 : 1}
                      onMouseEnter={() => setHover(n.id)}
                      onMouseLeave={() => setHover(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        width={NODE_W}
                        height={NODE_H}
                        rx={9}
                        fill={isSource ? "rgba(56,189,248,0.10)" : "rgba(16,185,129,0.10)"}
                        stroke={isSource ? "#38bdf8" : "#34d399"}
                        strokeWidth={hover === n.id ? 2 : 1}
                      />
                      <text
                        x={NODE_W / 2}
                        y={NODE_H / 2 + 4}
                        textAnchor="middle"
                        fontSize="11.5"
                        fontFamily="ui-monospace, monospace"
                        fill={isSource ? "#bae6fd" : "#a7f3d0"}
                      >
                        {n.label.length > 22 ? n.label.slice(0, 21) + "…" : n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">Hover any node to isolate its upstream and downstream edges.</p>
      </div>
    </div>
  );
}

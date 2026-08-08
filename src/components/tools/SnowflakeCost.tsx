import { useMemo, useState } from "react";
import { Field, Select, Stat, TextInput } from "./ui";

// Snowflake credits consumed per hour, per warehouse size
const SIZES = [
  { value: "XS", label: "X-Small", credits: 1 },
  { value: "S", label: "Small", credits: 2 },
  { value: "M", label: "Medium", credits: 4 },
  { value: "L", label: "Large", credits: 8 },
  { value: "XL", label: "X-Large", credits: 16 },
  { value: "2XL", label: "2X-Large", credits: 32 },
  { value: "3XL", label: "3X-Large", credits: 64 },
  { value: "4XL", label: "4X-Large", credits: 128 },
];

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function SnowflakeCost() {
  const [size, setSize] = useState("M");
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [daysPerMonth, setDaysPerMonth] = useState(22);
  const [clusters, setClusters] = useState(1);
  const [creditPrice, setCreditPrice] = useState(3);

  const current = SIZES.find((s) => s.value === size)!;

  const calc = useMemo(() => {
    const hours = Math.max(0, hoursPerDay) * Math.max(0, daysPerMonth);
    const credits = current.credits * hours * Math.max(1, clusters);
    return { hours, credits, monthly: credits * creditPrice, yearly: credits * creditPrice * 12 };
  }, [current, hoursPerDay, daysPerMonth, clusters, creditPrice]);

  // What one size down would save, the single most common Snowflake cost win
  const smaller = SIZES[Math.max(0, SIZES.findIndex((s) => s.value === size) - 1)];
  const saving = useMemo(() => {
    if (smaller.value === size) return 0;
    const credits = smaller.credits * calc.hours * Math.max(1, clusters);
    return calc.monthly - credits * creditPrice;
  }, [smaller, size, calc, clusters, creditPrice]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <p className="text-sm leading-relaxed text-slate-400">
          Warehouse spend compounds quietly. Model it before the invoice does. Credits scale 2× with every size
          step, so the sizing decision matters more than almost anything else you tune.
        </p>
        <Field label="Warehouse size">
          <Select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            options={SIZES.map((s) => ({ value: s.value, label: `${s.label} · ${s.credits} credit/hr` }))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hours / day">
            <TextInput
              type="number"
              min={0}
              max={24}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
            />
          </Field>
          <Field label="Days / month">
            <TextInput
              type="number"
              min={0}
              max={31}
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(Number(e.target.value))}
            />
          </Field>
          <Field label="Clusters">
            <TextInput
              type="number"
              min={1}
              max={10}
              value={clusters}
              onChange={(e) => setClusters(Number(e.target.value))}
            />
          </Field>
          <Field label="$ / credit">
            <TextInput
              type="number"
              min={0}
              step={0.25}
              value={creditPrice}
              onChange={(e) => setCreditPrice(Number(e.target.value))}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Compute hours / mo" value={calc.hours.toLocaleString()} />
          <Stat label="Credits / mo" value={calc.credits.toLocaleString()} />
          <Stat label="Cost / month" value={money(calc.monthly)} accent />
          <Stat label="Cost / year" value={money(calc.yearly)} accent />
        </div>

        {saving > 0 && (
          <div className="rounded-xl border border-accent-500/30 bg-accent-500/5 px-4 py-3 text-sm text-slate-300">
            Dropping to <span className="font-semibold text-accent-300">{smaller.label}</span> would save{" "}
            <span className="font-semibold text-accent-300">{money(saving)}/month</span> ({money(saving * 12)}/yr).
            Worth testing before you scale up.
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-2.5">Size</th>
                <th className="px-4 py-2.5">Credits/hr</th>
                <th className="px-4 py-2.5">Cost / month</th>
                <th className="px-4 py-2.5">Cost / year</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => {
                const c = s.credits * calc.hours * Math.max(1, clusters) * creditPrice;
                const active = s.value === size;
                return (
                  <tr
                    key={s.value}
                    className={`border-t border-white/5 ${active ? "bg-accent-500/10 text-white" : "text-slate-400"}`}
                  >
                    <td className="px-4 py-2.5 font-medium">{s.label}</td>
                    <td className="px-4 py-2.5 font-mono">{s.credits}</td>
                    <td className={`px-4 py-2.5 font-mono ${active ? "text-accent-300" : ""}`}>{money(c)}</td>
                    <td className="px-4 py-2.5 font-mono">{money(c * 12)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Estimate only. Excludes storage, cloud services, and serverless features. Default $3.00/credit reflects
          Enterprise on-demand; check your contract rate.
        </p>
      </div>
    </div>
  );
}

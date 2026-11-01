import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { STATUS_META } from "@/components/project/status";

const COLORS = {
  supported: "#1F9D68",
  uncertain: "#E8930C",
  conflict: "#E5322B",
  info: "#2F6BFF",
  unavailable: "#B9BCC2",
};

export default function CoverageChart({ claims = [], coverage = 0 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const counts = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {});
  const data = Object.keys(STATUS_META)
    .map((key) => ({ key, name: STATUS_META[key].label, value: counts[key] || 0 }))
    .filter((row) => row.value > 0);

  return (
    <div className="pop-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-extrabold leading-none">Evidence coverage</h3>
          <p className="mt-1 text-xs text-brand-ink/50">Share of claims backed by a number or a date</p>
        </div>
        <span className="rounded-full border-2 border-brand-ink bg-brand-yellow px-2.5 py-1 text-xs font-extrabold">
          {coverage}%
        </span>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-[132px] w-[132px] shrink-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.length ? data : [{ key: "none", name: "No claims", value: 1 }]}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={data.length > 1 ? 3 : 0}
                  stroke="#1B1D22"
                  strokeWidth={1.5}
                  startAngle={90}
                  endAngle={-270}
                >
                  {(data.length ? data : [{ key: "none" }]).map((row) => (
                    <Cell key={row.key} fill={COLORS[row.key] || "#E7E3DA"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full rounded-full border-2 border-brand-ink/10 bg-brand-cream" />
          )}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="font-display text-xl font-extrabold">{claims.length}</span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-1.5">
          {Object.keys(STATUS_META).map((key) => (
            <li key={key} className="flex items-center gap-2 text-xs">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full border border-brand-ink/30 ${STATUS_META[key].dot}`} />
              <span className="truncate font-semibold text-brand-ink/70">{STATUS_META[key].label}</span>
              <span className="ml-auto font-bold">{counts[key] || 0}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_HEIGHT = "clamp(14rem, 42vw, 17.5rem)";

function ExpenseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line/40 bg-surface px-3 py-2 text-sm shadow-xl">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-mono font-semibold tabular-nums text-ink">
        ${Number(payload[0].value).toFixed(2)}
      </p>
    </div>
  );
}

export default function ChartSection({ expenses }) {
  const currentMonthIndex = expenses.length - 1;

  return (
    <section className="card min-w-0 p-3 sm:p-5">
      <div className="min-w-0">
        <h2 className="card-title break-words">Spending — Last 6 Months</h2>
        <p className="mt-0.5 text-sm text-muted">
          A month-by-month look at your expenses.
        </p>
      </div>

      <div className="mt-4 min-w-0" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={expenses}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgb(var(--line))"
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              width={48}
            />
            <Tooltip
              content={<ExpenseTooltip />}
              cursor={{ fill: "rgb(var(--line))", fillOpacity: 0.12 }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {expenses.map((expense, index) => (
                <Cell
                  key={expense.month}
                  fill={
                    index === currentMonthIndex
                      ? "rgb(var(--cta))"
                      : index % 2 === 0
                        ? "rgb(var(--gold))"
                        : "rgb(var(--ochre))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

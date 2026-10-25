import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  getTotalMonthly,
  getActiveCount,
  getNextRenewal,
  getChangePercent,
} from "../utils";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconTone = "stat-icon-gold",
  compact = false,
}) {
  return (
    <article className="stat-card group">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 className="stat-label min-w-0 pt-1 leading-5">{title}</h2>
        {Icon && (
          <span className={`stat-icon ${iconTone}`} aria-hidden="true">
            <Icon size={19} strokeWidth={1.9} />
          </span>
        )}
      </div>

      <div className="mt-4 flex min-w-0 items-end justify-between gap-2">
        <p className={`stat-value min-w-0 break-words ${compact ? "stat-value-compact" : ""}`}>
          {value}
        </p>
        {trend !== undefined && trend !== null && trend !== 0 && (
          <span
            className={`stat-trend ${
              trend > 0 ? "stat-trend-up" : "stat-trend-down"
            }`}
            aria-label={`${trend > 0 ? "Increased" : "Decreased"} by ${Math.abs(
              trend,
            ).toFixed(1)} percent`}
          >
            {trend > 0 ? (
              <ArrowUpRight size={14} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={14} aria-hidden="true" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {subtitle && <p className="stat-description mt-2">{subtitle}</p>}
    </article>
  );
}

export function StatCards({ subscriptions, expenses }) {
  const totalMonthly = getTotalMonthly(subscriptions);
  const activeCount = getActiveCount(subscriptions);
  const change = getChangePercent(expenses);
  const nextRenewal = getNextRenewal(subscriptions);

  const spendChange = change === null ? 0 : change;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <StatCard
        title="Total Monthly Spending"
        value={`$${totalMonthly.toFixed(2)}`}
        subtitle="Per month across all subscriptions"
        icon={DollarSign}
        trend={spendChange}
        iconTone="stat-icon-gold"
      />

      <StatCard
        title="Active Subscriptions Count"
        value={activeCount.toString()}
        subtitle={`${activeCount} of ${subscriptions.length} active`}
        icon={Users}
        iconTone="stat-icon-success"
      />

      <StatCard
        title="Next Renewal"
        value={
          nextRenewal
            ? `${nextRenewal.name} · ${nextRenewal.daysLeft} days left`
            : "—"
        }
        subtitle={nextRenewal ? `Renewing on ${nextRenewal.renewalDate}` : "No renewals"}
        icon={Calendar}
        iconTone="stat-icon-ochre"
        compact
      />

      <StatCard
        title="Change vs Last Month"
        value={
          change === null
            ? "N/A"
            : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
        }
        subtitle={
          change === null
            ? "Not enough data"
            : change > 0
            ? "Spending increased"
            : "Spending decreased"
        }
        icon={TrendingUp}
        iconTone="stat-icon-cta"
      />
    </div>
  );
}

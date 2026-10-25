import { NavLink } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  ShoppingCart,
} from "lucide-react";

const tabs = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/subscriptions", label: "Subscriptions", icon: ShoppingCart },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function BottomTabBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-30 bg-brand text-canvas shadow-[0_-8px_24px_rgba(0,0,0,0.18)] lg:hidden"
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={`Navigate to ${label}`}
            className={({ isActive }) =>
              `flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-0.5 text-canvas transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-canvas sm:min-h-16 sm:min-w-16 sm:px-1 ${
                isActive ? "bg-brand-soft" : "hover:bg-brand-soft/40"
              }`
            }
          >
            <Icon size={18} className="shrink-0 sm:h-5 sm:w-5" aria-hidden="true" />
            <span className="max-w-full truncate font-sans text-[clamp(0.55rem,2.8vw,0.625rem)] font-medium leading-tight">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

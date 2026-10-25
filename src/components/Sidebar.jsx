import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  User,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/subscriptions", label: "Subscriptions", icon: ShoppingCart },
  { to: "/analytics", label: "Analytics", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      id="primary-navigation"
      className={`
        fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col
        bg-brand text-canvas shadow-xl transition-transform duration-300 ease-out
        motion-reduce:transition-none hidden lg:static lg:inset-auto lg:flex
        lg:translate-x-0 lg:shadow-none
      `}
    >
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center text-canvas">
            <ShoppingCart size={18} />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            SubManager
          </span>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas min-h-11 min-w-11 ${
                isActive
                  ? "bg-brand-soft text-canvas"
                  : "text-canvas hover:bg-brand-soft/30"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={18}
                className="text-canvas"
              />
              <span className="truncate text-sm font-semibold">{item.label}</span>
              {isActive && <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-canvas" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-2xl bg-brand-soft/10 p-4 border border-brand-soft/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center text-canvas font-bold">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold">Sub Manager</p>
              <p className="text-xs text-canvas">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

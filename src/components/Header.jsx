import { useState } from "react";
import {
  Bell,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";

export default function Header({ title, subtitle, notifications = [] }) {
  const { dark, toggleDark } = useDarkMode();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header
      className="
        header
        relative z-30
        flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2
        px-3 py-3 sm:px-4 md:px-6
        border-b border-line/30
        lg:border-b-0
      "
    >
      <div className="min-w-0 flex-1">
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 break-words text-xs leading-4 text-muted sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="relative z-50">
          <button
            type="button"
            className="relative rounded-xl p-3 text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={() => setNotificationsOpen((v) => !v)}
            aria-label={`Notifications${notifications.length ? `, ${notifications.length} upcoming renewals` : ""}`}
            aria-expanded={notificationsOpen}
            aria-controls="notifications-panel"
          >
            <Bell size={20} aria-hidden="true" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-xs font-bold text-canvas">
                {notifications.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                aria-hidden="true"
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <section
                id="notifications-panel"
                aria-label="Notifications"
                className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line/40 bg-surface shadow-2xl"
              >
                <div className="px-4 py-3 border-b border-line/30 font-semibold text-sm text-ink">
                  Upcoming renewals
                </div>
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-line/20">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cta"
                        />
                        <p className="text-sm text-ink">
                          {notification.daysLeft === 0
                            ? `Due today: ${notification.name}`
                            : `Due in ${notification.daysLeft} day${notification.daysLeft === 1 ? "" : "s"}: ${notification.name}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-5 text-sm text-muted">
                    No active renewals due in the next 7 days.
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl p-3 text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          onClick={toggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={dark}
        >
          {dark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-line/30">
          <div className="w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center text-canvas font-bold text-sm">
            <User size={16} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-ink leading-tight">
              Sub Manager
            </p>
            <p className="text-xs text-muted leading-tight">
              Admin · Active now
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

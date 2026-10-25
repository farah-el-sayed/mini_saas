import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { parseDateOnly } from "../utils.js";

const VIEW_STORAGE_KEY = "minisaas-subscriptions-view";

function getInitialView() {
  try {
    const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return storedView === "grid" ? "grid" : "table";
  } catch (error) {
    console.error("Could not load the saved subscriptions view.", error);
    return "table";
  }
}

export default function SubscriptionsTable({
  subscriptions,
  onOpenAdd,
  onEdit,
  onToggleStatus,
  onDelete,
  compact = false,
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState(getInitialView);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesName = subscription.name.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || subscription.status === statusFilter;

      return matchesName && matchesStatus;
    });
  }, [subscriptions, search, statusFilter]);

  const changeView = (nextView) => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, nextView);
      setView(nextView);
    } catch (error) {
      console.error("Could not save the subscriptions view.", error);
      window.alert("Could not save your view preference. Please try again.");
    }
  };

  const renderActionsMenu = (subscription) => {
    const isOpen = openMenuId === subscription.id;

    return (
      <div
        className="relative flex justify-end"
        ref={isOpen ? menuRef : null}
      >
        <button
          type="button"
          onClick={() =>
            setOpenMenuId((currentId) =>
              currentId === subscription.id ? null : subscription.id,
            )
          }
          aria-label={`Actions for ${subscription.name}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        >
          <MoreVertical size={18} aria-hidden="true" />
        </button>
        {isOpen && (
          <div
            role="menu"
            aria-label={`${subscription.name} actions`}
            className="absolute right-0 top-full z-20 mt-1 min-w-40 overflow-hidden rounded-xl border border-line/40 bg-surface py-1 shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpenMenuId(null);
                onEdit(subscription);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-canvas min-h-11"
            >
              <Pencil size={15} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpenMenuId(null);
                onToggleStatus(subscription.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-canvas min-h-11"
            >
              {subscription.status === "active" ? (
                <Pause size={15} aria-hidden="true" />
              ) : (
                <Play size={15} aria-hidden="true" />
              )}
              {subscription.status === "active" ? "Pause" : "Activate"}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpenMenuId(null);
                onDelete(subscription.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-canvas min-h-11"
            >
              <Trash2 size={15} aria-hidden="true" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const formatRenewalDate = (renewalDate) => {
    const date = parseDateOnly(renewalDate);
    if (!date) return renewalDate;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (openMenuId === null) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpenMenuId(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpenMenuId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId]);

  return (
    <>
      <section className={`card min-w-0 p-3 sm:p-4 ${className}`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-title">Subscriptions</h2>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div
              className="inline-flex rounded-xl border border-line/40 bg-canvas p-1"
              role="group"
              aria-label="Subscriptions view"
            >
              <button
                type="button"
                onClick={() => changeView("table")}
                aria-label="Table view"
                aria-pressed={view === "table"}
                className={`rounded-lg p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta ${
                  view === "table"
                    ? "bg-brand text-canvas"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <List size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => changeView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                className={`rounded-lg p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta ${
                  view === "grid"
                    ? "bg-brand text-canvas"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <LayoutGrid size={18} aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenAdd}
              className="btn btn-primary add-subscription-desktop"
            >
              <Plus size={16} aria-hidden="true" />
              Add Subscription
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search subscriptions by service name</span>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services..."
              className="subscription-search w-full rounded-lg border border-line/40 bg-surface py-3 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cta/40 min-h-11"
            />
          </label>

          <label>
            <span className="sr-only">Filter subscriptions by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="subscription-filter w-full rounded-lg border border-line/40 bg-surface px-3 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cta/40 sm:w-auto min-h-11"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <p className="py-10 text-center text-muted">
            No subscriptions match your search or filter.
          </p>
        ) : view === "grid" ? (
          <div
            className={`grid grid-cols-1 gap-4 ${
              compact ? "" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {filteredSubscriptions.map((subscription) => (
              <article
                key={subscription.id}
                className="card min-w-0 p-4 shadow-sm shadow-ink/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-heading text-lg font-semibold text-ink">
                      {subscription.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {subscription.category || "Uncategorized"}
                    </p>
                  </div>
                  {renderActionsMenu(subscription)}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/30 pt-3">
                  <span className="font-mono text-lg font-semibold tabular-nums text-ink">
                    ${Number(subscription.price).toFixed(2)}
                    <span className="ml-1 text-xs font-normal text-muted">
                      / {subscription.billingCycle === "annual" ? "year" : "month"}
                    </span>
                  </span>
                  <span
                    className={`tag ${
                      subscription.status === "active"
                        ? "tag-active"
                        : "tag-inactive"
                    }`}
                  >
                    {subscription.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted">
                  Renews{" "}
                  <span className="font-mono tabular-nums text-ink">
                    {formatRenewalDate(subscription.renewalDate)}
                  </span>
                </p>
              </article>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:hidden">
              {filteredSubscriptions.map((subscription) => (
                <article
                  key={subscription.id}
                  className="card min-w-0 p-3 shadow-sm shadow-ink/5"
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-heading text-base font-semibold text-ink">
                        {subscription.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {subscription.category || "Uncategorized"}
                      </p>
                    </div>
                    <span
                      className={`tag shrink-0 ${
                        subscription.status === "active"
                          ? "tag-active"
                          : "tag-inactive"
                      }`}
                    >
                      {subscription.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line/30 pt-3">
                    <span className="font-mono text-base font-semibold tabular-nums text-ink">
                      ${Number(subscription.price).toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-muted">
                        / {subscription.billingCycle === "annual" ? "year" : "month"}
                      </span>
                    </span>
                    <span className="text-xs text-muted">
                      Renews{" "}
                      <span className="font-mono tabular-nums text-ink">
                        {formatRenewalDate(subscription.renewalDate)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line/30 pt-3">
                    <button
                      type="button"
                      onClick={() => onEdit(subscription)}
                      className="flex min-h-11 items-center gap-2 rounded-lg border border-line/40 px-3 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    >
                      <Pencil size={15} aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(subscription.id)}
                      className="flex min-h-11 items-center gap-2 rounded-lg border border-line/40 px-3 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    >
                      {subscription.status === "active" ? (
                        <Pause size={15} aria-hidden="true" />
                      ) : (
                        <Play size={15} aria-hidden="true" />
                      )}
                      {subscription.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(subscription.id)}
                      className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-danger transition-colors hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="table-wrapper hidden sm:block">
              <table className="table min-w-[560px]">
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Price</th>
                    <th scope="col">Renewal Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td className="font-heading font-semibold text-ink">
                        <div>{subscription.name}</div>
                        <div className="mt-0.5 text-xs font-normal text-muted">
                          {subscription.category || "Uncategorized"}
                        </div>
                      </td>
                      <td className="font-mono tabular-nums">
                        ${Number(subscription.price).toFixed(2)}
                        <span className="ml-1 text-xs text-muted">
                          / {subscription.billingCycle === "annual" ? "yr" : "mo"}
                        </span>
                      </td>
                      <td className="font-mono text-xs tabular-nums">
                        {formatRenewalDate(subscription.renewalDate)}
                      </td>
                      <td>
                        <span
                          className={`tag ${
                            subscription.status === "active"
                              ? "tag-active"
                              : "tag-inactive"
                          }`}
                        >
                          {subscription.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="w-12">{renderActionsMenu(subscription)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}

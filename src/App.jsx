
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import BottomTabBar from "./components/BottomTabBar";
import AddSubscriptionModal from "./components/AddSubscriptionModal";
import NetworkErrorPage from "./components/NetworkErrorPage";
import NotFoundPage from "./components/NotFoundPage";
import { StatCards } from "./components/StatCard";
import SubscriptionsTable from "./components/SubscriptionsTable";

import { subscriptions as initialSubscriptions } from "./data/data";
import {
  createSubscriptionId,
  getMonthlyExpenseData,
  getUpcomingRenewals,
  normalizeSubscriptions,
  parseDateOnly,
  getTotalMonthly,
} from "./utils.js";

const STORAGE_KEY = "minisaas-subscriptions";
const BUDGET_STORAGE_KEY = "minisaas-monthly-budget";
const ChartSection = lazy(() => import("./components/ChartSection"));

function ChartLoadingState() {
  return (
    <section
      className="card flex min-h-64 items-center justify-center p-5 text-sm text-muted"
      role="status"
    >
      Loading spending chart...
    </section>
  );
}

function getNetworkIssue() {
  if (!navigator.onLine) return "offline";

  const networkInfoNavigator = /** @type {Navigator & {
    connection?: {
      effectiveType?: string;
      rtt?: number;
      addEventListener?: (type: string, listener: EventListener) => void;
      removeEventListener?: (type: string, listener: EventListener) => void;
    };
  }} */ (navigator);
  const connection = networkInfoNavigator.connection;
  const effectiveType = connection?.effectiveType;
  const isSlowType = effectiveType === "slow-2g" || effectiveType === "2g";
  const isHighLatency =
    typeof connection?.rtt === "number" && connection.rtt > 1500;

  return isSlowType || isHighLatency ? "slow" : null;
}

const pageDetails = {
  "/": {
    title: "Dashboard",
    subtitle: "Subscription overview for the current billing period",
  },
  "/subscriptions": {
    title: "Subscriptions",
    subtitle: "Manage your services, renewal dates, and status",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Explore your monthly subscription spending",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage your appearance and local subscription data",
  },
};

function loadSubscriptions() {
  try {
    const savedSubscriptions = window.localStorage.getItem(STORAGE_KEY);
    if (savedSubscriptions === null) return initialSubscriptions;

    const normalizedSubscriptions = normalizeSubscriptions(
      JSON.parse(savedSubscriptions),
    );
    if (normalizedSubscriptions) return normalizedSubscriptions;

    console.error("Saved subscriptions are invalid; using mock data instead.");
  } catch (error) {
    console.error("Could not load saved subscriptions; using mock data instead.", error);
  }

  return initialSubscriptions;
}

function loadMonthlyBudget() {
  try {
    const storedBudget = window.localStorage.getItem(BUDGET_STORAGE_KEY);
    if (storedBudget === null) return 0;

    const budget = Number(storedBudget);
    if (Number.isFinite(budget) && budget >= 0) return budget;
    console.error("Saved monthly budget is invalid; using no budget.");
  } catch (error) {
    console.error("Could not load the saved monthly budget.", error);
  }

  return 0;
}

export default function App() {
  const [subscriptions, setSubscriptions] = useState(loadSubscriptions);
  const [monthlyBudget, setMonthlyBudget] = useState(loadMonthlyBudget);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [networkIssue, setNetworkIssue] = useState(getNetworkIssue);
  const backupInputRef = useRef(null);
  const { pathname } = useLocation();
  const page = pageDetails[pathname] ?? pageDetails["/"];
  const monthlyExpenses = getMonthlyExpenseData(subscriptions);
  const upcomingRenewals = getUpcomingRenewals(subscriptions);
  const monthlySpending = getTotalMonthly(subscriptions);

  useEffect(() => {
    const updateNetworkIssue = () => setNetworkIssue(getNetworkIssue());
    const networkInfoNavigator = /** @type {Navigator & {
      connection?: {
        addEventListener?: (type: string, listener: EventListener) => void;
        removeEventListener?: (type: string, listener: EventListener) => void;
      };
    }} */ (navigator);
    const connection = networkInfoNavigator.connection;

    window.addEventListener("online", updateNetworkIssue);
    window.addEventListener("offline", updateNetworkIssue);
    connection?.addEventListener?.("change", updateNetworkIssue);

    return () => {
      window.removeEventListener("online", updateNetworkIssue);
      window.removeEventListener("offline", updateNetworkIssue);
      connection?.removeEventListener?.("change", updateNetworkIssue);
    };
  }, []);

  useEffect(() => {
    setBudgetDraft(monthlyBudget ? String(monthlyBudget) : "");
  }, [monthlyBudget]);

  const closeSubscriptionModal = useCallback(() => {
    setAddSubscriptionOpen(false);
    setEditingSubscription(null);
  }, []);

  if (networkIssue) {
    return (
      <NetworkErrorPage
        issue={networkIssue}
        onRetry={() => setNetworkIssue(getNetworkIssue())}
        onContinue={() => setNetworkIssue(null)}
      />
    );
  }

  const persistSubscriptions = (updatedSubscriptions) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedSubscriptions),
      );
      setSubscriptions(updatedSubscriptions);
      return true;
    } catch (error) {
      console.error("Could not persist subscription changes.", error);
      return false;
    }
  };

  const exportBackup = () => {
    try {
      const backup = {
        format: "submanager-backup",
        version: 1,
        exportedAt: new Date().toISOString(),
        subscriptions,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `submanager-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setSettingsMessage("Backup downloaded successfully.");
    } catch (error) {
      console.error("Could not export the subscription backup.", error);
      setSettingsMessage("The backup could not be downloaded. Please try again.");
    }
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSettingsMessage("Backup files must be smaller than 5 MB.");
      return;
    }

    try {
      const backup = JSON.parse(await file.text());
      if (
        backup?.format !== "submanager-backup" ||
        backup?.version !== 1
      ) {
        setSettingsMessage("This file is not a supported SubManager backup.");
        return;
      }

      const importedSubscriptions = normalizeSubscriptions(backup.subscriptions);
      if (!importedSubscriptions) {
        setSettingsMessage("The backup contains invalid subscription data.");
        return;
      }

      if (!window.confirm(`Replace your current data with ${importedSubscriptions.length} subscriptions?`)) {
        return;
      }

      if (!persistSubscriptions(importedSubscriptions)) {
        setSettingsMessage("Could not restore the backup. Your current data was kept.");
        return;
      }
      setSettingsMessage("Backup restored successfully.");
    } catch (error) {
      console.error("Could not import the subscription backup.", error);
      setSettingsMessage("Could not read this backup file. Check that it is valid JSON.");
    }
  };

  const saveMonthlyBudget = (event) => {
    event.preventDefault();
    const budget = budgetDraft.trim() === "" ? 0 : Number(budgetDraft);
    if (!Number.isFinite(budget) || budget < 0) {
      setSettingsMessage("Enter a valid, non-negative monthly budget.");
      return;
    }

    try {
      window.localStorage.setItem(BUDGET_STORAGE_KEY, String(budget));
      setMonthlyBudget(budget);
      setBudgetDraft(budget ? String(budget) : "");
      setSettingsMessage("Monthly budget saved.");
    } catch (error) {
      console.error("Could not save the monthly budget.", error);
      setSettingsMessage("Could not save the budget in this browser. Please try again.");
    }
  };

  const handleAdd = (newSub) => {
    const updatedSubscriptions = [
      { ...newSub, id: createSubscriptionId(subscriptions) },
      ...subscriptions,
    ];

    if (!persistSubscriptions(updatedSubscriptions)) {
      return "Could not save the subscription to this browser. Please try again.";
    }

    return true;
  };

  const updateSubscription = (id, updates) => {
    const updatedSubscriptions = subscriptions.map((subscription) =>
      subscription.id === id ? { ...subscription, ...updates, id } : subscription,
    );

    if (!persistSubscriptions(updatedSubscriptions)) {
      return "Could not save the subscription changes. Please try again.";
    }

    return true;
  };

  const toggleStatus = (id) => {
    const subscription = subscriptions.find((item) => item.id === id);
    if (!subscription) return;

    const updatedSubscriptions = subscriptions.map((item) =>
      item.id === id
        ? { ...item, status: item.status === "active" ? "inactive" : "active" }
        : item,
    );

    if (!persistSubscriptions(updatedSubscriptions)) {
      window.alert("Could not save the subscription status. Please try again.");
    }
  };

  const deleteSubscription = (id) => {
    const subscription = subscriptions.find((item) => item.id === id);
    if (!subscription) return;
    if (!window.confirm(`Delete ${subscription.name}? This cannot be undone.`)) return;

    const updatedSubscriptions = subscriptions.filter((item) => item.id !== id);
    if (!persistSubscriptions(updatedSubscriptions)) {
      window.alert("Could not delete the subscription. Please try again.");
    }
  };

  const openAddModal = () => {
    setEditingSubscription(null);
    setAddSubscriptionOpen(true);
  };

  const openEditModal = (subscription) => {
    setEditingSubscription(subscription);
    setAddSubscriptionOpen(true);
  };

  const saveSubscription = (subscription) =>
    editingSubscription
      ? updateSubscription(editingSubscription.id, subscription)
      : handleAdd(subscription);

  return (
    <div className="app-shell flex overflow-hidden bg-canvas text-ink">
      <Sidebar />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title={page.title}
          subtitle={page.subtitle}
          notifications={upcomingRenewals}
        />

        <div
          key={pathname}
          className="page-content min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-32 sm:p-4 sm:pb-32 md:p-6 md:pb-32 lg:pb-6"
        >
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <StatCards
                    subscriptions={subscriptions}
                    expenses={monthlyExpenses}
                  />
                  <section className="card mt-6 min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="card-title">Monthly budget</h2>
                        <p className="mt-1 text-sm text-muted">
                          {monthlyBudget > 0
                            ? `$${monthlySpending.toFixed(2)} of $${monthlyBudget.toFixed(2)} used`
                            : "Set a budget in Settings to track your spending."}
                        </p>
                      </div>
                      {monthlyBudget > 0 && (
                        <span className="text-sm font-semibold text-ink">
                          {Math.round((monthlySpending / monthlyBudget) * 100)}%
                        </span>
                      )}
                    </div>
                    {monthlyBudget > 0 && (
                      <div
                        className="mt-3 h-2 overflow-hidden rounded-full bg-canvas"
                        role="progressbar"
                        aria-label="Monthly budget used"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(
                          100,
                          Math.round((monthlySpending / monthlyBudget) * 100),
                        )}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${
                            monthlySpending > monthlyBudget
                              ? "bg-danger"
                              : "bg-cta"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (monthlySpending / monthlyBudget) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                    {monthlyBudget > 0 && monthlySpending > monthlyBudget && (
                      <p role="status" className="mt-2 text-sm font-semibold text-danger">
                        Your estimated monthly spending is over budget.
                      </p>
                    )}
                  </section>
                  <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-5">
                    <div className="min-w-0 2xl:col-span-3">
                      <Suspense fallback={<ChartLoadingState />}>
                        <ChartSection expenses={monthlyExpenses} />
                      </Suspense>
                    </div>
                    <div className="min-w-0 2xl:col-span-2">
                      <SubscriptionsTable
                        subscriptions={subscriptions}
                        onOpenAdd={openAddModal}
                        onEdit={openEditModal}
                        onToggleStatus={toggleStatus}
                        onDelete={deleteSubscription}
                        compact
                      />
                    </div>
                  </div>
                </>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <SubscriptionsTable
                  subscriptions={subscriptions}
                  onOpenAdd={openAddModal}
                  onEdit={openEditModal}
                  onToggleStatus={toggleStatus}
                  onDelete={deleteSubscription}
                  className="min-w-0"
                />
              }
            />
            <Route
              path="/analytics"
              element={
                <div className="space-y-6">
                  <StatCards
                    subscriptions={subscriptions}
                    expenses={monthlyExpenses}
                  />
                  <Suspense fallback={<ChartLoadingState />}>
                    <ChartSection expenses={monthlyExpenses} />
                  </Suspense>
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="grid w-full max-w-3xl gap-4 sm:gap-6">
                  <section className="card min-w-0 p-4 sm:p-5">
                    <h2 className="card-title">Appearance</h2>
                    <p className="mt-2 text-sm text-muted">
                      Use the theme button in the header to switch between light
                      and dark mode. Your preference is saved on this device.
                    </p>
                  </section>
                  <section className="card min-w-0 p-4 sm:p-5">
                    <h2 className="card-title">Monthly spending budget</h2>
                    <p className="mt-2 text-sm text-muted">
                      Set a monthly target in USD. Annual subscriptions are
                      converted to their monthly equivalent for this estimate.
                    </p>
                    <form
                      onSubmit={saveMonthlyBudget}
                      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
                    >
                      <label className="min-w-0 flex-1">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                          Budget (USD)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetDraft}
                          onChange={(event) => setBudgetDraft(event.target.value)}
                          placeholder="No budget set"
                          className="w-full min-h-11 rounded-lg border border-line/40 bg-canvas px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-cta/40"
                        />
                      </label>
                      <button type="submit" className="btn btn-primary">
                        Save budget
                      </button>
                    </form>
                  </section>
                  <section className="card min-w-0 p-4 sm:p-5">
                    <h2 className="card-title">Backup and restore</h2>
                    <p className="mt-2 text-sm text-muted">
                      Your data is stored in this browser. Download a backup
                      before changing devices or clearing browser data.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={exportBackup}
                        className="btn btn-primary"
                      >
                        Export backup
                      </button>
                      <button
                        type="button"
                        onClick={() => backupInputRef.current?.click()}
                        className="btn btn-ghost"
                      >
                        Import backup
                      </button>
                      <input
                        ref={backupInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={importBackup}
                        className="sr-only"
                        aria-label="Choose a SubManager backup file"
                      />
                    </div>
                    {settingsMessage && (
                      <p role="status" className="mt-3 text-sm text-muted">
                        {settingsMessage}
                      </p>
                    )}
                    <p className="mt-4 border-t border-line/30 pt-3 text-sm text-muted">
                      {subscriptions.length} subscription
                      {subscriptions.length === 1 ? "" : "s"} currently stored
                      in this browser.
                    </p>
                  </section>
                </div>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      <BottomTabBar />
      <button
        type="button"
        onClick={openAddModal}
        aria-label="Add subscription"
        className="mobile-add-fab fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cta text-canvas shadow-xl transition-colors hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta lg:hidden"
      >
        <Plus size={24} aria-hidden="true" />
      </button>
      <AddSubscriptionModal
        open={addSubscriptionOpen}
        onClose={closeSubscriptionModal}
        onAdd={saveSubscription}
        subscription={editingSubscription}
      />
    </div>
  );
}

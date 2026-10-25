/**
 * SubManager — utility helpers.
 *
 * All helpers are pure functions over the mock data so they can be unit-tested.
 */
import {
  monthlyExpenses as mockMonthlyExpenses,
  subscriptions as mockSubscriptions,
} from "./data/data.js";

/** Parse a valid YYYY-MM-DD date as a local calendar date. */
export function parseDateOnly(value) {
  if (typeof value !== "string") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Normalize and validate subscription records from storage or a backup. */
export function normalizeSubscriptions(value) {
  if (!Array.isArray(value)) return null;

  const ids = new Set();
  const normalized = [];

  for (const subscription of value) {
    if (!subscription || typeof subscription !== "object" || Array.isArray(subscription)) {
      return null;
    }

    const { id, name, price, renewalDate, status } = subscription;
    const normalizedId = typeof id === "string" ? id.trim() : "";
    const numericPrice = Number(price);
    if (
      !normalizedId ||
      ids.has(normalizedId) ||
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !parseDateOnly(renewalDate) ||
      !["active", "inactive"].includes(status)
    ) {
      return null;
    }

    const category = subscription.category ?? "Uncategorized";
    const billingCycle = subscription.billingCycle ?? "monthly";
    if (
      typeof category !== "string" ||
      !["monthly", "annual"].includes(billingCycle)
    ) {
      return null;
    }

    ids.add(normalizedId);
    normalized.push({
      ...subscription,
      id: normalizedId,
      name: name.trim(),
      price: numericPrice,
      category: category.trim() || "Uncategorized",
      billingCycle,
    });
  }

  return normalized;
}

function getUtcDay(year, month, day) {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month, day);
  return date.getTime();
}

/** Monthly equivalent of the stored price, preserving legacy monthly records. */
export function getMonthlyPrice(subscription) {
  const price = Number(subscription?.price);
  if (!Number.isFinite(price)) return 0;
  return subscription?.billingCycle === "annual" ? price / 12 : price;
}

/** Estimated monthly spending, excluding explicitly inactive subscriptions (USD). */
export function getTotalMonthly(subs = []) {
  const safeSubs = Array.isArray(subs) ? subs : [];

  return safeSubs.reduce((sum, subscription) => {
    if (
      !subscription ||
      typeof subscription !== "object" ||
      subscription.status === "inactive"
    ) {
      return sum;
    }

    return sum + getMonthlyPrice(subscription);
  }, 0);
}

/** Number of active subscriptions. */
export function getActiveCount(subs = []) {
  const safeSubs = Array.isArray(subs) ? subs : [];

  return safeSubs.filter(
    (subscription) =>
      subscription &&
      typeof subscription === "object" &&
      subscription.status === "active",
  ).length;
}

/**
 * Subscription renewing soonest + days left.
 * Returns null when the list is empty.
 */
export function getNextRenewal(subs = [], now = Date.now()) {
  const safeSubs = Array.isArray(subs) ? subs : [];
  if (safeSubs.length === 0) return null;

  const referenceTime = Number.isFinite(now) ? now : Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const referenceDate = new Date(referenceTime);
  const currentDay = getUtcDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  let closest = null;
  let closestDate = null;
  let closestDays = Infinity;

  for (const subscription of safeSubs) {
    if (
      !subscription ||
      typeof subscription !== "object" ||
      subscription.status === "inactive"
    ) {
      continue;
    }

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(subscription.renewalDate);
    const d = parseDateOnly(subscription.renewalDate);
    if (!dateParts || !d) continue;

    // Compare by day boundaries so "renewing in N days" is aligned to local date
    const renewalDay = getUtcDay(
      Number(dateParts[1]),
      Number(dateParts[2]) - 1,
      Number(dateParts[3]),
    );
    const daysLeft = Math.round((renewalDay - currentDay) / oneDay);

    if (daysLeft < closestDays && daysLeft >= 0) {
      closest = subscription;
      closestDate = d;
      closestDays = daysLeft;
    }
  }

  if (!closest) return null;

  return {
    ...closest,
    renewalDate: [
      closestDate.getFullYear().toString().padStart(4, "0"),
      (closestDate.getMonth() + 1).toString().padStart(2, "0"),
      closestDate.getDate().toString().padStart(2, "0"),
    ].join("-"),
    daysLeft: closestDays,
  };
}

/** Active renewals due within the next week, sorted by date. */
export function getUpcomingRenewals(subs = [], now = Date.now()) {
  const safeSubs = Array.isArray(subs) ? subs : [];
  const referenceDate = new Date(Number.isFinite(now) ? now : Date.now());
  const currentDay = getUtcDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  return safeSubs
    .filter(
      (subscription) =>
        subscription &&
        typeof subscription === "object" &&
        subscription.status === "active",
    )
    .flatMap((subscription) => {
      const dateParts =
        typeof subscription.renewalDate === "string"
          ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(subscription.renewalDate)
          : null;
      if (!dateParts || !parseDateOnly(subscription.renewalDate)) return [];

      const renewalDay = getUtcDay(
        Number(dateParts[1]),
        Number(dateParts[2]) - 1,
        Number(dateParts[3]),
      );
      const daysLeft = Math.round(
        (renewalDay - currentDay) / (24 * 60 * 60 * 1000),
      );
      return daysLeft >= 0 && daysLeft <= 7
        ? [{ ...subscription, daysLeft }]
        : [];
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/**
 * Percentage change between the last two months of expenses.
 * Returns null when fewer than 2 months are provided.
 */
export function getChangePercent(expenses = []) {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  if (safeExpenses.length < 2) return null;

  const latest = Number(safeExpenses[safeExpenses.length - 1]?.amount);
  const previous = Number(safeExpenses[safeExpenses.length - 2]?.amount);

  if (!Number.isFinite(latest) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }

  return ((latest - previous) / previous) * 100;
}

/** Last six monthly expense points, labeled relative to the current month. */
export function getMonthlyExpenseData(subs = [], now = new Date()) {
  const safeSubs = Array.isArray(subs) ? subs : [];
  const addedMonthlySpending =
    getTotalMonthly(safeSubs) - getTotalMonthly(mockSubscriptions);
  const lastMonthIndex = mockMonthlyExpenses.length - 1;

  return mockMonthlyExpenses.map((expense, index) => {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() + index - lastMonthIndex,
      1,
    );

    return {
      ...expense,
      month: monthDate.toLocaleDateString("en-US", { month: "short" }),
      amount:
        expense.amount + (index === lastMonthIndex ? addedMonthlySpending : 0),
    };
  });
}

/** Generate a subscription ID with a collision check against existing records. */
export function createSubscriptionId(existingSubscriptions = [], randomUUID) {
  const safeExisting = Array.isArray(existingSubscriptions) ? existingSubscriptions : [];
  const existingIds = new Set(
    safeExisting
      .filter(
        (subscription) =>
          subscription && typeof subscription === "object" && typeof subscription.id === "string",
      )
      .map(({ id }) => id),
  );
  const uuid =
    randomUUID ??
    (() =>
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

  let id;
  do {
    id = `sub_${uuid()}`;
  } while (existingIds.has(id));

  return id;
}

import assert from "node:assert/strict";
import test from "node:test";

import { subscriptions } from "../src/data/data.js";
import {
  createSubscriptionId,
  getChangePercent,
  getMonthlyExpenseData,
  getMonthlyPrice,
  getNextRenewal,
  getTotalMonthly,
  getUpcomingRenewals,
  normalizeSubscriptions,
  parseDateOnly,
} from "../src/utils.js";

test("monthly expenses cover the six months through the current month", () => {
  const expenses = getMonthlyExpenseData(subscriptions, new Date(2026, 0, 15));

  assert.deepEqual(
    expenses.map(({ month }) => month),
    ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  );
  assert.equal(expenses.length, 6);
});

test("adding a subscription updates the current month's chart value", () => {
  const addedSubscription = {
    id: "sub_test",
    name: "Test Service",
    price: 19.99,
    renewalDate: "2026-12-15",
    status: "active",
  };
  const expenses = getMonthlyExpenseData(
    [...subscriptions, addedSubscription],
    new Date(2026, 9, 24),
  );

  assert.equal(expenses.at(-1).month, "Oct");
  assert.ok(
    Math.abs(expenses.at(-1).amount - (119.8 + addedSubscription.price)) < 1e-9,
  );
});

test("annual subscriptions contribute their monthly equivalent to spending", () => {
  const annualSubscription = {
    id: "annual",
    name: "Annual Service",
    price: 120,
    billingCycle: "annual",
    status: "active",
  };

  assert.equal(getMonthlyPrice(annualSubscription), 10);
  assert.equal(getMonthlyPrice({ price: 12 }), 12);
  assert.equal(
    getTotalMonthly([
      annualSubscription,
      { price: 5 },
      { price: 100, status: "inactive" },
    ]),
    15,
  );
});

test("legacy subscription records normalize to monthly and uncategorized", () => {
  const normalized = normalizeSubscriptions([
    {
      id: " old-id ",
      name: "Legacy Service",
      price: "12.50",
      renewalDate: "2026-11-01",
      status: "active",
    },
  ]);

  assert.deepEqual(normalized, [
    {
      id: "old-id",
      name: "Legacy Service",
      price: 12.5,
      renewalDate: "2026-11-01",
      status: "active",
      category: "Uncategorized",
      billingCycle: "monthly",
    },
  ]);
});

test("backup validation rejects duplicate normalized IDs and invalid cycles", () => {
  const baseSubscription = {
    id: "duplicate",
    name: "Service",
    price: 10,
    renewalDate: "2026-11-01",
    status: "active",
  };

  assert.equal(
    normalizeSubscriptions([baseSubscription, { ...baseSubscription, id: " duplicate " }]),
    null,
  );
  assert.equal(
    normalizeSubscriptions([{ ...baseSubscription, billingCycle: "weekly" }]),
    null,
  );
});

test("upcoming renewals only include active subscriptions due within seven days", () => {
  const renewals = getUpcomingRenewals(
    [
      { id: "today", name: "Today", renewalDate: "2026-10-25", status: "active" },
      { id: "soon", name: "Soon", renewalDate: "2026-11-01", status: "active" },
      { id: "later", name: "Later", renewalDate: "2026-11-02", status: "active" },
      { id: "paused", name: "Paused", renewalDate: "2026-10-26", status: "inactive" },
    ],
    new Date(2026, 9, 25, 12).getTime(),
  );

  assert.deepEqual(
    renewals.map(({ id, daysLeft }) => ({ id, daysLeft })),
    [{ id: "today", daysLeft: 0 }, { id: "soon", daysLeft: 7 }],
  );
});

test("subscription IDs retry when a generated ID already exists", () => {
  const values = ["existing", "unique"];
  const id = createSubscriptionId(
    [{ id: "sub_existing" }],
    () => values.shift(),
  );

  assert.equal(id, "sub_unique");
});

test("subscription IDs are unique across consecutive creations", () => {
  const firstId = createSubscriptionId();
  const secondId = createSubscriptionId([{ id: firstId }]);

  assert.notEqual(firstId, secondId);
});

test("invalid subscription data is ignored when choosing the next renewal", () => {
  const nextRenewal = getNextRenewal([
    { name: "Broken", renewalDate: "invalid" },
    { name: "Healthy", renewalDate: "2026-10-28", price: 8, status: "active" },
    { name: "Past Renewal", renewalDate: "2026-10-01", price: 5, status: "active" },
    { name: "Paused", renewalDate: "2026-10-26", status: "inactive" },
  ]);

  assert.deepEqual(nextRenewal, {
    name: "Healthy",
    renewalDate: "2026-10-28",
    price: 8,
    status: "active",
    daysLeft: 3,
  });
});

test("date-only parsing rejects impossible dates without timezone shifting", () => {
  const parsedDate = parseDateOnly("2026-02-28");

  assert.ok(parsedDate instanceof Date);
  assert.equal(parsedDate.getFullYear(), 2026);
  assert.equal(parsedDate.getMonth(), 1);
  assert.equal(parsedDate.getDate(), 28);
  assert.equal(parseDateOnly("2026-02-31"), null);

  const now = new Date(2026, 9, 25, 23, 50).getTime();
  const nextRenewal = getNextRenewal(
    [
      { name: "Impossible", renewalDate: "2026-02-31" },
      { name: "Healthy", renewalDate: "2026-10-28" },
    ],
    now,
  );

  assert.equal(nextRenewal.name, "Healthy");
  assert.equal(nextRenewal.daysLeft, 3);
});

test("percentage change gracefully handles malformed expense arrays", () => {
  assert.equal(getChangePercent([]), null);
  assert.equal(getChangePercent([{ amount: "oops" }, { amount: 10 }]), null);
});

/**
 * SubManager — mock data for a subscription management dashboard.
 *
 * - subscriptions: 10 realistic services with status ("active"|"inactive").
 * - monthlyExpenses: spend for the last 6 months (for the chart).
 */
export const subscriptions = [
  {
    id: "sub_001",
    name: "Netflix",
    category: "Entertainment",
    price: 15.99,
    renewalDate: "2026-10-28",
    status: "active",
  },
  {
    id: "sub_002",
    name: "Figma",
    category: "Design",
    price: 12.0,
    renewalDate: "2026-10-30",
    status: "active",
  },
  {
    id: "sub_003",
    name: "GitHub Pro",
    category: "Developer",
    price: 22.0,
    renewalDate: "2026-11-05",
    status: "active",
  },
  {
    id: "sub_004",
    name: "Vercel",
    category: "Developer",
    price: 20.0,
    renewalDate: "2026-11-12",
    status: "inactive",
  },
  {
    id: "sub_005",
    name: "Spotify",
    category: "Entertainment",
    price: 10.99,
    renewalDate: "2026-10-22",
    status: "active",
  },
  {
    id: "sub_006",
    name: "Adobe Creative Cloud",
    category: "Design",
    price: 54.99,
    renewalDate: "2026-12-01",
    status: "active",
  },
  {
    id: "sub_007",
    name: "Notion",
    category: "Productivity",
    price: 10.0,
    renewalDate: "2026-10-18",
    status: "active",
  },
  {
    id: "sub_008",
    name: "Dropbox",
    category: "Storage",
    price: 16.58,
    renewalDate: "2026-11-20",
    status: "inactive",
  },
  {
    id: "sub_009",
    name: "Spotify (Student)",
    category: "Entertainment",
    price: 4.99,
    renewalDate: "2026-10-25",
    status: "active",
  },
  {
    id: "sub_010",
    name: "AWS",
    category: "Developer",
    price: 14.75,
    renewalDate: "2026-10-15",
    status: "active",
  },
];

/**
 * Monthly expenses for the last 6 months (USD) — used for the spending chart.
 * Intentionally growing to show a positive trend.
 */
export const monthlyExpenses = [
  { month: "Apr", amount: 84.5 },
  { month: "May", amount: 92.0 },
  { month: "Jun", amount: 98.75 },
  { month: "Jul", amount: 104.2 },
  { month: "Aug", amount: 112.4 },
  { month: "Sep", amount: 119.8 },
];

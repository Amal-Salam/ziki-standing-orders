import type { Area, IssueType, Offer, Order, Severity } from "./types";

export const PROJECT = "Zedu";
export const ME = { name: "Amal Salam", points: 412, unread: 3 };
export const AGENTS = ["Kestrel", "Atlas"];

export const TYPES: IssueType[] = ["Fix", "Feat", "Design", "Marketing"];
export const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];
export const AREAS: Area[] = ["auth", "payments", "database", "emails", "marketing site", "desktop", "mobile", "UI copy", "UI"];

/** How long Ziki holds an offer for the owner when no order covers it. Today every offer lapses after 60 seconds. */
export const DEFAULT_HOLD_MINUTES = 10;

/** The orders a new owner starts with in the demo. Ziki checks them from the top; the first that covers an offer decides. */
export const DEFAULT_ORDERS: Order[] = [
  {
    id: "o-payments",
    name: "Never touch payments",
    on: true,
    action: "never",
    types: [],
    areas: ["payments"],
    source: "manual",
    createdAt: "2026-10-22",
  },
  {
    id: "o-auth",
    name: "Always ask me about sign-in",
    on: true,
    action: "ask",
    types: [],
    areas: ["auth"],
    source: "manual",
    createdAt: "2026-10-22",
  },
  {
    id: "o-small",
    name: "Small fixes: go ahead",
    on: true,
    action: "go",
    types: ["Fix", "Marketing"],
    maxSeverity: "Medium",
    maxMinutes: 30,
    areas: [],
    source: "manual",
    createdAt: "2026-10-22",
  },
];

const deliver = (s: Severity) => (s === "High" || s === "Critical" ? 60 : 15);

const offer = (o: Omit<Offer, "id" | "deliverMinutes">): Offer => ({ ...o, id: `offer-${o.issue}`, deliverMinutes: deliver(o.severity) });

/** Offers that already came in "earlier today" when the demo first opens. */
export const SEED: Offer[] = [
  offer({
    issue: 231,
    title: "Typo in the workspace invite email (“recieve”)",
    type: "Fix",
    severity: "Low",
    minutes: 10,
    areas: ["emails"],
    agent: "Kestrel",
    plan: ["Fix the spelling in the invite email template", "Check the other auth emails for the same typo", "Send a test invite to a sandbox inbox"],
  }),
  offer({
    issue: 228,
    title: "Paystack webhook retry charges a workspace twice",
    type: "Fix",
    severity: "Critical",
    minutes: 90,
    areas: ["payments"],
    agent: "Atlas",
    plan: ["Make the webhook handler idempotent on the event reference", "Add a unique index on payment references", "Replay the duplicate event in a test"],
  }),
  offer({
    issue: 235,
    title: "Pricing page plan names don’t match checkout",
    type: "Marketing",
    severity: "Low",
    minutes: 20,
    areas: ["marketing site"],
    agent: "Kestrel",
    plan: ["Use the checkout plan names on the pricing cards and comparison table", "Screenshot both pages for the PR"],
  }),
  offer({
    issue: 240,
    title: "Magic link fails for emails with capital letters",
    type: "Fix",
    severity: "High",
    minutes: 45,
    areas: ["auth"],
    agent: "Atlas",
    plan: ["Lower-case emails on login, password reset and magic link", "Backfill: find accounts that differ only by case", "Add tests for mixed-case sign-in"],
  }),
];

/** The offers "Simulate an offer" sends next, in order. They are checked against the orders as they are when each one arrives. */
export const QUEUE: Offer[] = [
  offer({
    issue: 244,
    title: "Channel history is blank on Zedu Desktop",
    type: "Fix",
    severity: "Medium",
    minutes: 50,
    areas: ["desktop"],
    agent: "Kestrel",
    plan: ["Load the last 50 messages when a channel opens", "Keep the scroll position on new messages", "Test on macOS and Windows builds"],
  }),
  offer({
    issue: 246,
    title: "Onboarding checklist copy is out of date",
    type: "Marketing",
    severity: "Low",
    minutes: 15,
    areas: ["UI copy"],
    agent: "Kestrel",
    plan: ["Rewrite the five checklist items to match today’s features", "Ask design to check the length on mobile"],
  }),
  offer({
    issue: 249,
    title: "Add an index for class attendance lookups",
    type: "Fix",
    severity: "Medium",
    minutes: 25,
    areas: ["database"],
    agent: "Atlas",
    plan: ["Write a migration adding an index on (class_id, joined_at)", "Run it against a copy of staging data", "Compare the attendance query before and after"],
  }),
  offer({
    issue: 252,
    title: "Refund emails show the wrong currency",
    type: "Fix",
    severity: "Medium",
    minutes: 20,
    areas: ["payments", "emails"],
    agent: "Kestrel",
    plan: ["Read the currency from the original payment", "Format it with the workspace locale"],
  }),
  offer({
    issue: 255,
    title: "Dark mode for the settings pages",
    type: "Feat",
    severity: "Medium",
    minutes: 120,
    areas: ["UI"],
    agent: "Atlas",
    plan: ["Swap hard-coded colours on settings for theme tokens", "Check every settings tab in both themes", "Record a before/after video"],
  }),
  offer({
    issue: 258,
    title: "Password reset link expires after 2 minutes",
    type: "Fix",
    severity: "Medium",
    minutes: 15,
    areas: ["auth"],
    agent: "Kestrel",
    plan: ["Set the reset token lifetime to 30 minutes", "Show the expiry time in the email"],
  }),
  offer({
    issue: 261,
    title: "Mobile: Send button hidden behind the keyboard",
    type: "Fix",
    severity: "High",
    minutes: 30,
    areas: ["mobile"],
    agent: "Atlas",
    plan: ["Pad the composer by the keyboard inset", "Test on a small Android screen and iPhone SE"],
  }),
];

export const ALL_OFFERS = [...SEED, ...QUEUE];
export const offerById = (id: string) => ALL_OFFERS.find((o) => o.id === id);

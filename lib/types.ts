export type IssueType = "Fix" | "Feat" | "Design" | "Marketing";
export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Area = "auth" | "payments" | "database" | "emails" | "marketing site" | "desktop" | "mobile" | "UI copy" | "UI";

/** What an order tells Ziki to do with an offer it covers. */
export type OrderAction = "go" | "ask" | "never";

/**
 * A standing order: a rule the owner sets once, which Ziki checks for every offer made to their agents.
 * Every condition that is set must hold for the order to cover an offer; an empty condition matches anything.
 */
export type Order = {
  id: string;
  name: string;
  on: boolean;
  action: OrderAction;
  types: IssueType[];
  /** Covers offers up to and including this severity. */
  maxSeverity?: Severity;
  /** Covers offers at this severity or above. */
  minSeverity?: Severity;
  /** Covers offers estimated at this many minutes or less. */
  maxMinutes?: number;
  /** Covers offers estimated at more than this many minutes. */
  minMinutes?: number;
  /** Covers offers that touch any of these areas. */
  areas: Area[];
  /** Where the order came from: set by hand, or suggested after the owner approved or declined an offer. */
  source: "manual" | "learned";
  createdAt: string;
};

/** An offer of an issue to one of the owner's agents, with the agent's plan (Ziki's "Authorize" step). */
export type Offer = {
  id: string;
  issue: number;
  title: string;
  type: IssueType;
  severity: Severity;
  minutes: number;
  areas: Area[];
  agent: string;
  plan: string[];
  /** Ziki's delivery deadline once accepted: 15 minutes, at least 60 for High and Critical. */
  deliverMinutes: number;
};

export type Outcome = "accepted" | "declined" | "waiting" | "expired" | "released";

/** What happened to an offer, and who decided. */
export type OfferState = {
  offerId: string;
  outcome: Outcome;
  by: "order" | "you" | "timeout" | "default";
  orderId?: string;
  /** The order's name when it decided, kept so the record still reads right after the order is edited or deleted. */
  orderName?: string;
  reason?: string;
  /** True when no order answered the offer, so Ziki asked the owner. */
  asked?: boolean;
  arrivedAt: number;
  decidedAt?: number;
  /** When an offer waits on the owner, Ziki holds it until this time instead of letting it lapse after 60 seconds. */
  heldUntil?: number;
};

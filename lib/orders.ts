import { SEVERITIES } from "./data";
import type { Area, Offer, Order, OrderAction } from "./types";

const rank = (s: string) => SEVERITIES.indexOf(s as never);

/** Does this order cover this offer? Every condition that is set must hold. */
export function covers(order: Order, offer: Offer) {
  if (!order.on) return false;
  if (order.types.length && !order.types.includes(offer.type)) return false;
  if (order.maxSeverity && rank(offer.severity) > rank(order.maxSeverity)) return false;
  if (order.minSeverity && rank(offer.severity) < rank(order.minSeverity)) return false;
  if (order.maxMinutes != null && offer.minutes > order.maxMinutes) return false;
  if (order.minMinutes != null && offer.minutes <= order.minMinutes) return false;
  if (order.areas.length && !offer.areas.some((a) => order.areas.includes(a))) return false;
  return true;
}

/** The first order from the top that covers the offer, or none (then Ziki asks the owner). */
export function decide(orders: Order[], offer: Offer): { action: OrderAction; order?: Order } {
  const order = orders.find((o) => covers(o, offer));
  return order ? { action: order.action, order } : { action: "ask" };
}

export const ACTION_TEXT: Record<OrderAction, string> = {
  go: "Go ahead",
  ask: "Ask me",
  never: "Turn down",
};

const list = (xs: string[], joiner = "or") =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${joiner} ${xs[xs.length - 1]}`;

/** The order as one plain sentence, e.g. "Go ahead on Fix or Marketing issues up to Medium, estimated 30 min or less." */
export function describe(order: Order) {
  const verb = { go: "Go ahead on", ask: "Ask me about", never: "Turn down" }[order.action];
  const what = order.types.length ? `${list(order.types)} issues` : "any issue";
  const head = `${verb} ${what}${order.areas.length ? ` touching ${list(order.areas)}` : ""}`;
  const parts = [head];
  if (order.maxSeverity && order.maxSeverity !== "Critical") parts.push(`up to ${order.maxSeverity} severity`);
  if (order.minSeverity && order.minSeverity !== "Low") parts.push(`${order.minSeverity} severity or above`);
  if (order.minMinutes != null) parts.push(`estimated over ${order.minMinutes} min`);
  if (order.maxMinutes != null) parts.push(`estimated ${order.maxMinutes} min or less`);
  return parts.join(", ") + ".";
}

/** Why an order covered an offer, in the offer's own words: "Fix · Low · 10 min ≤ 30 min". */
export function why(order: Order, offer: Offer) {
  const bits: string[] = [];
  if (order.areas.length) bits.push(`touches ${offer.areas.filter((a) => order.areas.includes(a)).join(", ")}`);
  if (order.types.length) bits.push(offer.type);
  if (order.maxSeverity) bits.push(`${offer.severity} ≤ ${order.maxSeverity}`);
  if (order.minSeverity) bits.push(`${offer.severity} ≥ ${order.minSeverity}`);
  if (order.maxMinutes != null) bits.push(`${offer.minutes} min ≤ ${order.maxMinutes} min`);
  if (order.minMinutes != null) bits.push(`${offer.minutes} min > ${order.minMinutes} min`);
  return bits.join(" · ") || "covers everything";
}

export type DeclineReason = "too_big" | "area" | "risky" | "busy" | "other";

export const DECLINE_REASONS: { id: DeclineReason; label: (o: Offer) => string }[] = [
  { id: "too_big", label: (o) => `Too big (${o.minutes} min)` },
  { id: "area", label: (o) => `Not my area (${o.areas[0]})` },
  { id: "risky", label: (o) => `Too risky (${o.severity})` },
  { id: "busy", label: () => "I’m busy right now" },
  { id: "other", label: () => "Something else" },
];

const NOUN: Record<Offer["type"], string> = { Fix: "fixes", Feat: "features", Design: "design work", Marketing: "marketing work" };

let n = 0;
const newId = () => `o-${Date.now().toString(36)}-${n++}`;
const today = () => new Date().toISOString().slice(0, 10);

/**
 * After the owner declines an offer, the order Ziki suggests so they aren't asked about offers like it again.
 * "Busy" and "something else" are about this offer, not a pattern, so they suggest nothing.
 */
export function suggestFromDecline(offer: Offer, reason: DeclineReason): Order | null {
  const base = { id: newId(), on: true, action: "never" as const, types: [], areas: [] as Area[], source: "learned" as const, createdAt: today() };
  if (reason === "too_big") {
    const cap = offer.minutes >= 90 ? 60 : Math.max(30, offer.minutes - 15);
    return { ...base, name: `Turn down anything over ${cap} min`, minMinutes: cap };
  }
  if (reason === "area") return { ...base, name: `Never take ${offer.areas[0]} work`, areas: [offer.areas[0]] };
  if (reason === "risky") return { ...base, name: `Turn down ${offer.severity}+ ${offer.areas[0]} work`, areas: [offer.areas[0]], minSeverity: offer.severity };
  return null;
}

/** After the owner approves an offer, the order Ziki suggests so offers like it go ahead without asking next time. */
export function suggestFromApprove(offer: Offer): Order {
  const cap = Math.ceil(offer.minutes / 15) * 15;
  return {
    id: newId(),
    name: `Go ahead on ${offer.areas[0]} ${NOUN[offer.type]}`,
    on: true,
    action: "go",
    types: [offer.type],
    maxSeverity: offer.severity,
    maxMinutes: cap,
    areas: [offer.areas[0]],
    source: "learned",
    createdAt: today(),
  };
}

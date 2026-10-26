"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_HOLD_MINUTES, DEFAULT_ORDERS, QUEUE, SEED, offerById } from "./data";
import { decide } from "./orders";
import type { Offer, OfferState, Order } from "./types";

/** Everything the demo remembers, kept in this browser only. */
export type State = {
  orders: Order[];
  /** Newest first. */
  offers: OfferState[];
  /** The next offer in QUEUE that "Simulate an offer" sends. */
  next: number;
  holdMinutes: number;
};

const KEY = "ziki-standing-orders:v1";
const MIN = 60_000;

let state: State | null = null;
const listeners = new Set<() => void>();

/** Run an offer through the orders as they are right now. */
function arrive(s: State, offer: Offer, at: number): OfferState {
  const { action, order } = decide(s.orders, offer);
  const base = { offerId: offer.id, arrivedAt: at, orderId: order?.id, orderName: order?.name };
  if (action === "go") return { ...base, outcome: "accepted", by: "order", decidedAt: at };
  if (action === "never") return { ...base, outcome: "declined", by: "order", decidedAt: at };
  return { ...base, outcome: "waiting", by: order ? "order" : "default", asked: true, heldUntil: at + s.holdMinutes * MIN };
}

function seed(): State {
  const now = Date.now();
  const s: State = { orders: DEFAULT_ORDERS, offers: [], next: 0, holdMinutes: DEFAULT_HOLD_MINUTES };
  const ago = [190, 140, 70, 2];
  s.offers = SEED.map((o, i) => arrive(s, o, now - ago[i] * MIN)).reverse();
  return s;
}

function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as State) : seed();
  } catch {
    state = seed();
  }
  return state;
}

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private windows can refuse storage; the demo still works for this visit.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The demo state, or null while rendering on the server (the page shows a placeholder until the browser takes over). */
export function useStore(): State | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

const patchOffer = (id: string, change: Partial<OfferState>) => {
  const s = load();
  set({ ...s, offers: s.offers.map((o) => (o.offerId === id ? { ...o, ...change } : o)) });
};

export const actions = {
  /** Send the next sample offer to one of the owner's agents. Returns it, or null when the queue is used up. */
  simulate(): OfferState | null {
    const s = load();
    const offer = QUEUE[s.next];
    if (!offer) return null;
    const result = arrive(s, offer, Date.now());
    set({ ...s, offers: [result, ...s.offers], next: s.next + 1 });
    return result;
  },
  approve: (id: string) => patchOffer(id, { outcome: "accepted", by: "you", decidedAt: Date.now(), heldUntil: undefined }),
  decline: (id: string, reason: string) => patchOffer(id, { outcome: "declined", by: "you", reason, decidedAt: Date.now(), heldUntil: undefined }),
  expire: (id: string) => patchOffer(id, { outcome: "expired", by: "timeout", decidedAt: Date.now(), heldUntil: undefined }),
  release: (id: string) => patchOffer(id, { outcome: "released", by: "you", decidedAt: Date.now() }),

  addOrder(order: Order, where: "top" | "bottom" = "top") {
    const s = load();
    set({ ...s, orders: where === "top" ? [order, ...s.orders] : [...s.orders, order] });
  },
  updateOrder(id: string, change: Partial<Order>) {
    const s = load();
    set({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, ...change } : o)) });
  },
  removeOrder(id: string) {
    const s = load();
    set({ ...s, orders: s.orders.filter((o) => o.id !== id) });
  },
  moveOrder(id: string, by: -1 | 1) {
    const s = load();
    const i = s.orders.findIndex((o) => o.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= s.orders.length) return;
    const orders = [...s.orders];
    [orders[i], orders[j]] = [orders[j], orders[i]];
    set({ ...s, orders });
  },
  setHold: (holdMinutes: number) => set({ ...load(), holdMinutes }),
  reset: () => set(seed()),
};

export { offerById };

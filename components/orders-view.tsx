"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, CircleHelp, Hourglass, Plus, Sparkles, X } from "lucide-react";
import { ALL_OFFERS } from "@/lib/data";
import { ACTION_TEXT, chips, decide } from "@/lib/orders";
import { actions, useStore } from "@/lib/store";
import type { Order, OrderAction } from "@/lib/types";
import { ACTION_TONE, Chip, NewTag, Placeholder } from "./bits";
import OrderForm from "./order-form";

/** Each box says what happens to an offer it covers, in plain words, so the three read without a legend. */
const BOXES: { action: OrderAction; hint: string; empty: string; icon: React.ElementType; head: string; badge: string; tile: string }[] = [
  {
    action: "go",
    hint: "Your agents take these on their own.",
    empty: "Add work your agents can just get on with.",
    icon: Check,
    head: "bg-zk-ok-bg text-zk-ok-fg",
    badge: "bg-zk-ok-fg text-zk-surface",
    tile: "border-zk-ok-fg/30",
  },
  {
    action: "ask",
    hint: "Your agents check with you first.",
    empty: "Add work you want to approve yourself.",
    icon: CircleHelp,
    head: "bg-zk-warn-bg text-zk-warn-fg",
    badge: "bg-zk-warn-fg text-zk-surface",
    tile: "border-zk-warn-bd",
  },
  {
    action: "never",
    hint: "Your agents turn these down for you.",
    empty: "Add work your agents should never touch.",
    icon: X,
    head: "bg-zk-bad-bg text-zk-bad-fg",
    badge: "bg-zk-bad-fg text-zk-surface",
    tile: "border-zk-bad-bd",
  },
];

type Editing = { id: string } | { add: OrderAction } | null;

/** The Standing orders page: three boxes (go, ask, never), each holding its orders as short chips, readable at a glance. */
export default function OrdersView() {
  const s = useStore();
  const [editing, setEditing] = useState<Editing>(null);
  if (!s) return <Placeholder />;

  const current = editing && "id" in editing ? s.orders.find((o) => o.id === editing.id) : undefined;
  const save = (o: Order) => {
    if (current) actions.updateOrder(o.id, o);
    else actions.addOrder(o);
    setEditing(null);
  };
  const waiting = s.offers.filter((o) => o.outcome === "waiting").length;

  return (
    <div className="mx-auto max-w-[1080px] space-y-4">
      <header>
        <p className="flex items-center gap-2 text-xs text-zk-text2">
          Zedu <span className="text-zk-muted">›</span> Standing orders <NewTag />
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-zk-text">Standing orders</h1>
        <p className="text-sm text-zk-text2">What your agents may do without you.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {BOXES.map(({ action, hint, empty, icon: Icon, head, badge, tile }, i) => {
          const orders = s.orders.filter((o) => o.action === action);
          return (
            <section
              key={action}
              aria-label={ACTION_TEXT[action]}
              style={{ animationDelay: `${i * 70}ms` }}
              data-tone={action}
              className="zk-box animate-pop flex min-h-80 flex-col overflow-hidden rounded-2xl border border-zk-border bg-zk-surface lg:aspect-square"
            >
              <header className={`zk-box-head flex items-center gap-3 px-4 py-3.5 ${head}`}>
                <span className={`zk-box-icon flex size-9 shrink-0 items-center justify-center rounded-full ${badge}`}>
                  <Icon className="size-5" strokeWidth={3} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg leading-tight font-extrabold">{ACTION_TEXT[action]}</h2>
                  <p className="text-xs font-medium opacity-80">{hint}</p>
                </div>
                {orders.length > 0 && (
                  <span key={orders.length} className="animate-boop ml-auto rounded-full bg-zk-surface/70 px-2 text-xs font-bold">
                    {orders.length}
                  </span>
                )}
              </header>
              <div className="flex flex-1 flex-col gap-2.5 p-3">
                {orders.map((o) => {
                  const on = editing && "id" in editing && editing.id === o.id;
                  const cs = chips(o);
                  return (
                    <button
                      key={`${o.id}:${o.action}:${cs.join()}:${o.on}:${o.note ?? ""}`}
                      type="button"
                      title={o.note ? `${o.name}\n\n${o.note}` : o.name}
                      onClick={() => setEditing(on ? null : { id: o.id })}
                      className={`zk-tile animate-pop flex flex-wrap gap-1.5 rounded-xl border bg-zk-seg p-3 text-left ${tile} ${on ? "ring-2 ring-zk-accent" : ""} ${o.on ? "" : "opacity-45"}`}
                    >
                      {o.source === "learned" && <Sparkles className="animate-twinkle size-3.5 text-zk-info-fg" aria-label="From your answer" />}
                      {(cs.length ? cs : ["anything"]).map((c) => (
                        <span key={c} className="rounded-md bg-zk-surface px-2 py-0.5 text-sm font-semibold text-zk-text">
                          {c}
                        </span>
                      ))}
                      {o.note && <p className="line-clamp-4 w-full text-sm leading-snug whitespace-pre-line text-zk-text2">{o.note}</p>}
                      <span className="sr-only">Edit {o.name}</span>
                    </button>
                  );
                })}
                {orders.length === 0 && <p className="px-1 pt-1 text-sm text-zk-muted">{empty}</p>}
                <button
                  type="button"
                  aria-label={`Add a “${ACTION_TEXT[action]}” order`}
                  onClick={() => setEditing({ add: action })}
                  className="zk-add mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zk-border py-2.5 text-sm font-semibold text-zk-muted"
                >
                  <Plus className="size-4" /> Add
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <div key={"id" in editing ? editing.id : `add-${editing.add}`} className="animate-arrive">
          <OrderForm
            initial={current}
            action={"add" in editing ? editing.add : undefined}
            onSave={save}
            onCancel={() => setEditing(null)}
            onDelete={
              current &&
              (() => {
                actions.removeOrder(current.id);
                setEditing(null);
              })
            }
          />
        </div>
      )}

      {/* Smaller tiles staggered under the boxes (3, then 2 sitting in the gaps, then 1): the rest, the test, anything waiting. */}
      <div className="grid items-start gap-4 md:grid-cols-6">
        <div className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-zk-border bg-zk-surface px-3 py-2 text-sm text-zk-text2 md:col-span-3 xl:col-span-2 xl:col-start-2">
          <span className="flex items-center gap-1.5" title="Offers no order covers wait this long for your answer">
            <Hourglass className="size-4 text-zk-accent" /> <b className="text-zk-text">Hold the rest</b>
          </span>
          <div role="radiogroup" aria-label="How long to hold offers no order covers" className="ml-auto flex items-center rounded-full bg-zk-seg p-0.5">
            {[5, 10, 15, 30].map((m) => {
              const on = s.holdMinutes === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => actions.setHold(m)}
                  className={`zk-pick rounded-full px-2.5 py-1 text-xs font-bold tabular-nums transition-colors ${on ? "bg-zk-accent text-zk-surface shadow-sm" : "text-zk-muted hover:text-zk-text"}`}
                >
                  {m}
                </button>
              );
            })}
            <span className="px-1.5 text-xs text-zk-muted">min</span>
          </div>
        </div>

        <Preview orders={s.orders} />

        {waiting > 0 && (
          <Link href="/offers" className="flex min-h-12 items-center md:col-span-4 md:col-start-2 xl:col-span-2 xl:col-start-3 justify-between rounded-2xl border border-zk-warn-bd bg-zk-warn-bg px-3 py-2 text-sm font-semibold text-zk-warn-fg">
            {waiting} offer{waiting > 1 ? "s" : ""} waiting on you <span aria-hidden className="animate-nudge">→</span>
          </Link>
        )}
      </div>

      <p className="text-center text-[11px] text-zk-muted">If two orders match, Never wins, then the newest.</p>
    </div>
  );
}

/**
 * Last week's offers replayed through the orders as they are now, so the owner sees what a change would have done.
 * (In the mock-up "last week" is the sample offers.) Three labelled counts, with the list a tap away.
 */
function Preview({ orders }: { orders: Order[] }) {
  const rows = ALL_OFFERS.map((offer) => ({ offer, ...decide(orders, offer) }));
  const n = (a: OrderAction) => rows.filter((r) => r.action === a).length;
  return (
    <details className="group rounded-2xl border border-zk-border bg-zk-surface md:col-span-3 xl:col-span-2 xl:col-start-4 open:md:col-span-6 open:md:col-start-1">
      <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-1.5 px-3 py-2 text-sm">
        <b className="whitespace-nowrap text-zk-text" title={`Last week's ${rows.length} offers, run through your orders as they are now`}>
          Last week
        </b>
        <span className="ml-auto flex gap-1">
          <Count key={`go${n("go")}`} tone="ok" n={n("go")} label="taken" />
          <Count key={`ask${n("ask")}`} tone="warn" n={n("ask")} label="asked" />
          <Count key={`never${n("never")}`} tone="bad" n={n("never")} label="declined" />
        </span>
        <ChevronDown className="size-4 shrink-0 text-zk-muted transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-zk-divider">
        <p className="bg-zk-seg px-3 py-2 text-xs text-zk-text2">
          Your agents got {rows.length} offers last week. Here’s what your orders, as they are now, would have done with each.
        </p>
        {rows.map(({ offer, action }) => (
          <div key={offer.id} className="flex items-center gap-3 border-b border-zk-divider px-3 py-2 text-xs last:border-0">
            <p className="min-w-0 flex-1 truncate text-zk-text">{offer.title}</p>
            <Chip tone={ACTION_TONE[action]}>{ACTION_TEXT[action]}</Chip>
          </div>
        ))}
      </div>
    </details>
  );
}

/** A count that boops whenever its number changes (the key remounts it). */
function Count({ tone, n, label }: { tone: "ok" | "warn" | "bad"; n: number; label: string }) {
  return (
    <span className="animate-boop inline-flex whitespace-nowrap">
      <Chip tone={tone}>
        {n} {label}
      </Chip>
    </span>
  );
}

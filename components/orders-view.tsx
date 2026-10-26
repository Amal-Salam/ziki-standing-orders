"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, CircleHelp, Pencil, Plus, Sparkles, X } from "lucide-react";
import { ALL_OFFERS } from "@/lib/data";
import { ACTION_TEXT, decide, describe } from "@/lib/orders";
import { actions, useStore } from "@/lib/store";
import type { Order, OrderAction } from "@/lib/types";
import { ACTION_TONE, Chip, NewTag, Placeholder } from "./bits";
import OrderForm from "./order-form";

const GROUPS: { action: OrderAction; title: string; icon: React.ElementType; tone: string }[] = [
  { action: "go", title: "Go ahead without asking", icon: Check, tone: "text-zk-ok-fg" },
  { action: "ask", title: "Ask me first", icon: CircleHelp, tone: "text-zk-warn-fg" },
  { action: "never", title: "Never take", icon: X, tone: "text-zk-bad-fg" },
];

/** The Standing orders page: the owner's orders grouped by what they do, so it reads at a glance. */
export default function OrdersView() {
  const s = useStore();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  if (!s) return <Placeholder />;

  const save = (o: Order) => {
    if (editing === "new") actions.addOrder(o);
    else actions.updateOrder(o.id, o);
    setEditing(null);
  };
  const form = (initial?: Order) => (
    <OrderForm
      initial={initial}
      onSave={save}
      onCancel={() => setEditing(null)}
      onDelete={
        initial &&
        (() => {
          actions.removeOrder(initial.id);
          setEditing(null);
        })
      }
    />
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm text-zk-text2">
            Zedu <span className="text-zk-muted">›</span> <span className="font-semibold text-zk-text">Standing orders</span> <NewTag />
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-zk-text sm:text-3xl">Standing orders</h1>
          <p className="mt-1 text-sm text-zk-text2">What your agents may take without asking you.</p>
        </div>
        {editing !== "new" && (
          <button type="button" onClick={() => setEditing("new")} className="flex items-center gap-1.5 rounded-[10px] bg-zk-blue px-3 py-2 text-sm font-semibold text-white">
            <Plus className="size-4" /> New order
          </button>
        )}
      </header>

      {editing === "new" && form()}

      {GROUPS.map(({ action, title, icon: Icon, tone }) => {
        const orders = s.orders.filter((o) => o.action === action);
        return (
          <section key={action} className="space-y-2">
            <h2 className={`flex items-center gap-2 text-sm font-bold ${tone}`}>
              <Icon className="size-4" /> {title}
            </h2>
            <ul className="overflow-hidden rounded-xl border border-zk-border bg-zk-surface">
              {orders.map((o) =>
                editing === o.id ? (
                  <li key={o.id} className="border-b border-zk-divider p-2 last:border-0">
                    {form(o)}
                  </li>
                ) : (
                  <li key={o.id} className={`flex items-center gap-3 border-b border-zk-divider px-4 py-3 last:border-0 ${o.on ? "" : "opacity-50"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-zk-text">
                        {o.name}
                        {o.source === "learned" && (
                          <Chip tone="info">
                            <Sparkles className="size-3" /> from your answer
                          </Chip>
                        )}
                      </p>
                      <p className="text-sm text-zk-text2">{describe(o)}</p>
                    </div>
                    <Toggle order={o} />
                    <button
                      type="button"
                      aria-label={`Edit ${o.name}`}
                      onClick={() => setEditing(o.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-zk-text2 hover:bg-zk-chip hover:text-zk-text"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </li>
                ),
              )}
              {action === "ask" && (
                <li className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-sm text-zk-text2">
                  <b className="text-zk-text">Anything else</b> is held for you for
                  <select
                    value={s.holdMinutes}
                    onChange={(e) => actions.setHold(Number(e.target.value))}
                    aria-label="How long to hold offers"
                    className="rounded-lg border border-zk-border bg-zk-seg px-2 py-1 text-zk-text"
                  >
                    {[5, 10, 15, 30].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </li>
              )}
              {orders.length === 0 && action !== "ask" && <li className="px-4 py-3 text-sm text-zk-muted">None yet.</li>}
            </ul>
          </section>
        );
      })}

      <p className="text-xs text-zk-muted">If two orders match one offer, “Never take” wins, then the newest order.</p>

      <Preview orders={s.orders} />

      <Link href="/offers" className="inline-block text-sm font-semibold text-zk-accent">
        See your agents work within these on Offers →
      </Link>
    </div>
  );
}

function Toggle({ order: o }: { order: Order }) {
  return (
    <label className="flex cursor-pointer items-center" title={o.on ? "On" : "Off"}>
      <input type="checkbox" checked={o.on} onChange={() => actions.updateOrder(o.id, { on: !o.on })} className="peer sr-only" />
      <span className="relative h-5 w-9 rounded-full bg-zk-chip transition peer-checked:bg-zk-blue after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
      <span className="sr-only">
        {o.on ? "Turn off" : "Turn on"} {o.name}
      </span>
    </label>
  );
}

/** How the sample offers would go under the orders as they are now. Collapsed: the totals are usually enough. */
function Preview({ orders }: { orders: Order[] }) {
  const rows = ALL_OFFERS.map((offer) => ({ offer, ...decide(orders, offer) }));
  const n = (a: OrderAction) => rows.filter((r) => r.action === a).length;
  return (
    <details className="group rounded-xl border border-zk-border bg-zk-surface">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-sm text-zk-text2">
        <ChevronDown className="size-4 -rotate-90 transition group-open:rotate-0" />
        <span className="font-semibold text-zk-text">Try them on {rows.length} sample offers:</span>
        <span>
          <b className="text-zk-ok-fg">{n("go")} go ahead</b> · <b className="text-zk-warn-fg">{n("ask")} ask you</b> ·{" "}
          <b className="text-zk-bad-fg">{n("never")} never</b>
        </span>
      </summary>
      <div className="border-t border-zk-divider">
        {rows.map(({ offer, action, order }) => (
          <div key={offer.id} className="flex items-center gap-3 border-b border-zk-divider px-4 py-2.5 text-sm last:border-0">
            <p className="min-w-0 flex-1 truncate text-zk-text">{offer.title}</p>
            <p className="hidden shrink-0 text-xs text-zk-muted sm:block">{order ? order.name : "no order covers it"}</p>
            <Chip tone={ACTION_TONE[action]}>{ACTION_TEXT[action]}</Chip>
          </div>
        ))}
      </div>
    </details>
  );
}

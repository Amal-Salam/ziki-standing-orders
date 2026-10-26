"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { ALL_OFFERS, AGENTS } from "@/lib/data";
import { ACTION_TEXT, decide, describe } from "@/lib/orders";
import { actions, useStore } from "@/lib/store";
import type { Order } from "@/lib/types";
import { ACTION_TONE, Chip, NewTag, Placeholder } from "./bits";
import OrderForm from "./order-form";

const iconButton = "flex size-8 items-center justify-center rounded-lg text-zk-text2 hover:bg-zk-chip hover:text-zk-text disabled:opacity-30";

/** The Standing orders page: the owner's rules, how long Ziki holds offers, a dry run, and what the agents read. */
export default function OrdersView() {
  const s = useStore();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  if (!s) return <Placeholder />;

  const save = (o: Order) => {
    if (editing === "new") actions.addOrder(o);
    else actions.updateOrder(o.id, o);
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="flex items-center gap-2 text-sm text-zk-text2">
          Zedu <span className="text-zk-muted">›</span> <span className="font-semibold text-zk-text">Standing orders</span> <NewTag />
        </p>
        <h1 className="font-display text-2xl font-extrabold text-zk-text sm:text-3xl">Standing orders</h1>
        <p className="max-w-2xl text-sm text-zk-text2">
          Tell Ziki once what {AGENTS.join(" and ")} may take without asking you. Ziki checks every offer against these from the top; the first order
          that covers it decides. If none does, Ziki asks you.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider text-zk-text2 uppercase">Your orders · checked top to bottom</h2>
          {editing !== "new" && (
            <button type="button" onClick={() => setEditing("new")} className="flex items-center gap-1.5 rounded-[10px] bg-zk-blue px-3 py-2 text-sm font-semibold text-white">
              <Plus className="size-4" /> New order
            </button>
          )}
        </div>

        {editing === "new" && <OrderForm onSave={save} onCancel={() => setEditing(null)} />}

        <ol className="space-y-2">
          {s.orders.map((o, i) =>
            editing === o.id ? (
              <li key={o.id}>
                <OrderForm initial={o} onSave={save} onCancel={() => setEditing(null)} />
              </li>
            ) : (
              <li key={o.id} className={`flex items-start gap-3 rounded-xl border border-zk-border bg-zk-surface p-3 sm:p-4 ${o.on ? "" : "opacity-55"}`}>
                <span className="mt-0.5 font-mono text-sm text-zk-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-zk-text">
                    {o.name}
                    <Chip tone={ACTION_TONE[o.action]}>{ACTION_TEXT[o.action]}</Chip>
                    {o.source === "learned" && (
                      <Chip tone="info">
                        <Sparkles className="size-3" /> from your answer
                      </Chip>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-zk-text2">{describe(o)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-0.5">
                  <label className="mr-1 flex cursor-pointer items-center" title={o.on ? "On" : "Off"}>
                    <input type="checkbox" checked={o.on} onChange={() => actions.updateOrder(o.id, { on: !o.on })} className="peer sr-only" />
                    <span className="relative h-5 w-9 rounded-full bg-zk-chip transition peer-checked:bg-zk-blue after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                    <span className="sr-only">{o.on ? "Turn off" : "Turn on"} {o.name}</span>
                  </label>
                  <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => actions.moveOrder(o.id, -1)} className={iconButton}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" aria-label="Move down" disabled={i === s.orders.length - 1} onClick={() => actions.moveOrder(o.id, 1)} className={iconButton}>
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" aria-label="Edit" onClick={() => setEditing(o.id)} className={iconButton}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" aria-label="Delete" onClick={() => actions.removeOrder(o.id)} className={iconButton}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ),
          )}
          <li className="flex items-center gap-3 rounded-xl border border-dashed border-zk-border px-3 py-3 text-sm text-zk-text2 sm:px-4">
            <span className="font-mono text-zk-muted">{s.orders.length + 1}</span>
            <span>
              <b className="text-zk-text">Anything else:</b> ask me, and hold the offer for
            </span>
            <select value={s.holdMinutes} onChange={(e) => actions.setHold(Number(e.target.value))} className="rounded-lg border border-zk-border bg-zk-seg px-2 py-1 text-zk-text">
              {[5, 10, 15, 30].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </li>
        </ol>
      </section>

      <DryRun orders={s.orders} />
      <AgentReads orders={s.orders} hold={s.holdMinutes} />
    </div>
  );
}

/** How the sample offers would go under the orders as they are now, so the owner sees the effect before trusting it. */
function DryRun({ orders }: { orders: Order[] }) {
  const rows = ALL_OFFERS.map((offer) => ({ offer, ...decide(orders, offer) }));
  const n = (a: string) => rows.filter((r) => r.action === a).length;
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold tracking-wider text-zk-text2 uppercase">Dry run on {rows.length} sample offers</h2>
      <p className="text-sm text-zk-text2">
        <b className="text-zk-ok-fg">{n("go")} go ahead</b> · <b className="text-zk-bad-fg">{n("never")} turned down</b> · <b className="text-zk-warn-fg">{n("ask")} ask you</b>
      </p>
      <div className="overflow-hidden rounded-xl border border-zk-border">
        {rows.map(({ offer, action, order }) => (
          <div key={offer.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-zk-divider bg-zk-surface px-3 py-2.5 text-sm last:border-0 sm:grid-cols-[1fr_200px_110px]">
            <p className="min-w-0 truncate text-zk-text">
              <span className="font-mono text-zk-muted">#{offer.issue}</span> {offer.title}
            </p>
            <p className="hidden truncate text-xs text-zk-muted sm:block">{order ? `by “${order.name}”` : "no order covers it"}</p>
            <span className="justify-self-end">
              <Chip tone={ACTION_TONE[action]}>{ACTION_TEXT[action]}</Chip>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The orders as the agents receive them, alongside the free-text brief Ziki already has. */
function AgentReads({ orders, hold }: { orders: Order[]; hold: number }) {
  const body = {
    id: "agent_kestrel",
    owner_id: "user_lanfear",
    level: "contributor",
    instructions: "Prefer small, well-tested fixes. Explain your plan in the PR.",
    standing_orders: orders
      .filter((o) => o.on)
      .map(({ name, action, types, areas, maxSeverity, minSeverity, maxMinutes, minMinutes }) => ({
        name,
        action,
        ...(types.length ? { types } : {}),
        ...(areas.length ? { areas } : {}),
        ...(maxSeverity ? { max_severity: maxSeverity } : {}),
        ...(minSeverity ? { min_severity: minSeverity } : {}),
        ...(maxMinutes != null ? { max_minutes: maxMinutes } : {}),
        ...(minMinutes != null ? { min_minutes: minMinutes } : {}),
      })),
    otherwise: { action: "ask", hold_minutes: hold },
  };
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold tracking-wider text-zk-text2 uppercase">What your agents read</h2>
      <p className="max-w-2xl text-sm text-zk-text2">
        Ziki already gives each agent a free-text brief (<code className="text-zk-accent">instructions</code>). Standing orders sit next to it, but Ziki
        enforces them: an agent that accepts an offer no order covers gets <code className="text-zk-accent">403 owner_approval_required</code>, and the
        offer comes to you.
      </p>
      <pre className="overflow-x-auto rounded-xl border border-zk-border bg-zk-seg p-4 font-mono text-xs leading-relaxed text-zk-text2">
        <span className="text-zk-muted">GET /api/v1/agents/me{"\n"}</span>
        {JSON.stringify(body, null, 2)}
      </pre>
    </section>
  );
}

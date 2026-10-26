"use client";

import { useState } from "react";
import { ALL_OFFERS, AREAS, SEVERITIES, TYPES } from "@/lib/data";
import { ACTION_TEXT, covers, describe } from "@/lib/orders";
import type { Area, IssueType, Order, OrderAction, Severity } from "@/lib/types";

const blank = (): Order => ({
  id: `o-${Date.now().toString(36)}`,
  name: "",
  on: true,
  action: "go",
  types: [],
  areas: [],
  source: "manual",
  createdAt: new Date().toISOString().slice(0, 10),
});

const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

const pill = (on: boolean) =>
  `rounded-full border px-3 py-1 text-sm ${on ? "border-zk-accent bg-zk-tint text-zk-accent" : "border-zk-border text-zk-text2 hover:text-zk-text"}`;

const field = "rounded-[10px] border border-zk-border bg-zk-seg px-3 py-2 text-sm text-zk-text";

/** Build or edit one standing order, with a live sentence and the sample offers it would cover. */
export default function OrderForm({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: Order;
  onSave: (o: Order) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [o, setO] = useState<Order>(initial ?? blank());
  const set = (change: Partial<Order>) => setO((x) => ({ ...x, ...change }));
  const num = (v: string) => (v === "" ? undefined : Math.max(0, Number(v)));
  const matches = ALL_OFFERS.filter((offer) => covers({ ...o, on: true }, offer));

  return (
    <form
      className="space-y-4 rounded-xl border border-zk-accent/40 bg-zk-surface p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...o, name: o.name.trim() || describe(o).replace(/\.$/, "") });
      }}
    >
      <label className="block space-y-1">
        <span className="text-xs font-bold tracking-wider text-zk-text2 uppercase">Name</span>
        <input value={o.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Copy fixes: go ahead" className={`${field} w-full`} />
      </label>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-bold tracking-wider text-zk-text2 uppercase">When an offer matches</legend>
        <div className="flex flex-wrap gap-2">
          {(["go", "ask", "never"] as OrderAction[]).map((a) => (
            <button key={a} type="button" onClick={() => set({ action: a })} className={pill(o.action === a)} aria-pressed={o.action === a}>
              {ACTION_TEXT[a]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-bold tracking-wider text-zk-text2 uppercase">Issue type (none picked = any)</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => set({ types: toggle<IssueType>(o.types, t) })} className={pill(o.types.includes(t))} aria-pressed={o.types.includes(t)}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-bold tracking-wider text-zk-text2 uppercase">Touches (none picked = anywhere)</legend>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button key={a} type="button" onClick={() => set({ areas: toggle<Area>(o.areas, a) })} className={pill(o.areas.includes(a))} aria-pressed={o.areas.includes(a)}>
              {a}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="space-y-1">
          <span className="block text-xs font-bold tracking-wider text-zk-text2 uppercase">Severity up to</span>
          <select value={o.maxSeverity ?? ""} onChange={(e) => set({ maxSeverity: (e.target.value || undefined) as Severity | undefined })} className={`${field} w-full`}>
            <option value="">Any</option>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-bold tracking-wider text-zk-text2 uppercase">Severity at least</span>
          <select value={o.minSeverity ?? ""} onChange={(e) => set({ minSeverity: (e.target.value || undefined) as Severity | undefined })} className={`${field} w-full`}>
            <option value="">Any</option>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-bold tracking-wider text-zk-text2 uppercase">Estimate ≤ (min)</span>
          <input type="number" min={0} value={o.maxMinutes ?? ""} onChange={(e) => set({ maxMinutes: num(e.target.value) })} className={`${field} w-full`} />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-bold tracking-wider text-zk-text2 uppercase">Estimate &gt; (min)</span>
          <input type="number" min={0} value={o.minMinutes ?? ""} onChange={(e) => set({ minMinutes: num(e.target.value) })} className={`${field} w-full`} />
        </label>
      </div>

      <div className="rounded-lg bg-zk-seg p-3 text-sm">
        <p className="text-zk-text">{describe(o)}</p>
        <p className="mt-1 text-xs text-zk-muted">
          Covers {matches.length} of {ALL_OFFERS.length} sample offers{matches.length ? `: ${matches.map((m) => `#${m.issue}`).join(", ")}` : ""}.
        </p>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="rounded-[10px] bg-zk-blue px-4 py-2 text-sm font-semibold text-white">
          {initial ? "Save order" : "Add order"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-[10px] px-4 py-2 text-sm text-zk-text2">
          Cancel
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} className="ml-auto rounded-[10px] px-4 py-2 text-sm font-semibold text-zk-bad-fg">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

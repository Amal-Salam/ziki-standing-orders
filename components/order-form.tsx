"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ALL_OFFERS, AREAS, SEVERITIES, TYPES } from "@/lib/data";
import { ACTION_TEXT, covers, describe, severityRange } from "@/lib/orders";
import { useStore } from "@/lib/store";
import type { Area, IssueType, Order, OrderAction } from "@/lib/types";

const blank = (action: OrderAction): Order => ({
  id: `o-${Date.now().toString(36)}`,
  name: "",
  on: true,
  action,
  types: [],
  areas: [],
  source: "manual",
  createdAt: new Date().toISOString().slice(0, 10),
});

const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

const pill = (on: boolean) =>
  `zk-pick rounded-full border px-2.5 py-1 text-xs font-semibold ${on ? "border-zk-accent bg-zk-tint text-zk-accent" : "border-zk-border text-zk-text2 hover:text-zk-text"}`;

const ACTION_PILL: Record<OrderAction, string> = {
  go: "border-zk-ok-fg bg-zk-ok-bg text-zk-ok-fg",
  ask: "border-zk-warn-bd bg-zk-warn-bg text-zk-warn-fg",
  never: "border-zk-bad-bd bg-zk-bad-bg text-zk-bad-fg",
};


/** Estimate as one row of choices: each sets an upper or lower bound (or neither). */
type Est = { maxMinutes?: number; minMinutes?: number };
const ESTIMATE: Est[] = [{}, { maxMinutes: 15 }, { maxMinutes: 30 }, { maxMinutes: 60 }, { minMinutes: 60 }, { minMinutes: 120 }];

const estLabel = (e: Est) => [e.maxMinutes != null && `≤ ${e.maxMinutes}m`, e.minMinutes != null && `> ${e.minMinutes}m`].filter(Boolean).join(" ") || "Any";

/** Keep an order's own value on screen even when it isn't one of the preset choices. */
const withCurrent = <T,>(choices: T[], current: T, label: (x: T) => string) =>
  choices.some((c) => label(c) === label(current)) ? choices : [...choices, current];

/** Build or edit one standing order by tapping chips. No pick in a row means "any". */
export default function OrderForm({
  initial,
  action = "go",
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: Order;
  action?: OrderAction;
  onSave: (o: Order) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [o, setO] = useState<Order>(initial ?? blank(action));
  const set = (change: Partial<Order>) => setO((x) => ({ ...x, ...change }));
  const matches = ALL_OFFERS.filter((offer) => covers({ ...o, on: true }, offer));

  // The built-ins, then any the owner has added to an order (this one included), so a new one stays on offer.
  const orders = useStore()?.orders ?? [];
  const types = known<IssueType>(TYPES, [...orders.flatMap((x) => x.types), ...o.types]);
  const areas = known<Area>(AREAS, [...orders.flatMap((x) => x.areas), ...o.areas]);

  const sev = severityRange(o);
  // Severity is picked as one unbroken range: tapping outside it stretches it, tapping an end trims it,
  // tapping inside it narrows to that level, and covering all four is the same as "Any".
  const pickSeverity = (i: number) => {
    let [lo, hi] = sev ?? [i, i];
    if (sev) {
      if (i < lo) lo = i;
      else if (i > hi) hi = i;
      else if (lo === hi) return setSeverity(null);
      else if (i === lo) lo++;
      else if (i === hi) hi--;
      else lo = hi = i;
    }
    setSeverity(lo === 0 && hi === SEVERITIES.length - 1 ? null : [lo, hi]);
  };
  const setSeverity = (r: [number, number] | null) =>
    set({ minSeverity: r && r[0] > 0 ? SEVERITIES[r[0]] : undefined, maxSeverity: r && r[1] < SEVERITIES.length - 1 ? SEVERITIES[r[1]] : undefined });
  const est: Est = { maxMinutes: o.maxMinutes, minMinutes: o.minMinutes };

  return (
    <form
      className="space-y-3 rounded-2xl border border-zk-accent/40 bg-zk-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        // A name the owner didn't type follows the conditions, so it never describes an older version of the order.
        const typed = initial && initial.name !== describe(initial).replace(/\.$/, "") ? o.name.trim() : "";
        onSave({ ...o, note: o.note?.trim() || undefined, name: typed || describe(o).replace(/\.$/, "") });
      }}
    >
      <div className="grid grid-cols-3 gap-1.5">
        {(["go", "ask", "never"] as OrderAction[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => set({ action: a })}
            aria-pressed={o.action === a}
            className={`zk-pick rounded-xl border py-2 text-xs font-bold transition-colors ${o.action === a ? ACTION_PILL[a] : "border-zk-border text-zk-text2"}`}
          >
            {ACTION_TEXT[a]}
          </button>
        ))}
      </div>

      <Row label="Type">
        {types.map((t) => (
          <button key={t} type="button" onClick={() => set({ types: toggle<IssueType>(o.types, t) })} className={pill(o.types.includes(t))} aria-pressed={o.types.includes(t)}>
            {t}
          </button>
        ))}
        <AddChip what="type" known={types} onAdd={(t) => set({ types: o.types.includes(t) ? o.types : [...o.types, t] })} />
      </Row>

      <Row label="Touches">
        {areas.map((a) => (
          <button key={a} type="button" onClick={() => set({ areas: toggle<Area>(o.areas, a) })} className={pill(o.areas.includes(a))} aria-pressed={o.areas.includes(a)}>
            {a}
          </button>
        ))}
        <AddChip what="area" known={areas} onAdd={(a) => set({ areas: o.areas.includes(a) ? o.areas : [...o.areas, a] })} />
      </Row>

      <Row label="Severity">
        <button type="button" onClick={() => setSeverity(null)} className={pill(!sev)} aria-pressed={!sev}>
          Any
        </button>
        {SEVERITIES.map((level, i) => {
          const on = !!sev && i >= sev[0] && i <= sev[1];
          return (
            <button key={level} type="button" onClick={() => pickSeverity(i)} className={pill(on)} aria-pressed={on}>
              {level}
            </button>
          );
        })}
      </Row>

      <Row label="Estimate">
        {withCurrent(ESTIMATE, est, estLabel).map((c) => (
          <button key={estLabel(c)} type="button" onClick={() => set({ maxMinutes: c.maxMinutes, minMinutes: c.minMinutes })} className={pill(estLabel(c) === estLabel(est))} aria-pressed={estLabel(c) === estLabel(est)}>
            {estLabel(c)}
          </button>
        ))}
      </Row>

      <label className="block space-y-1">
        <span className="text-[11px] font-bold tracking-wider text-zk-muted uppercase">Note for your agents (optional)</span>
        <textarea
          value={o.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          rows={3}
          placeholder="e.g. Run the full test suite before opening a PR, and keep the change to one file where you can."
          className="w-full resize-y rounded-xl border border-zk-border bg-zk-seg px-3 py-2 text-sm text-zk-text placeholder:text-zk-muted"
        />
      </label>

      <p className="rounded-xl bg-zk-seg px-3 py-2 text-xs text-zk-text2">
        {describe(o)} <span className="text-zk-muted">Would have covered {matches.length} of last week’s {ALL_OFFERS.length} offers.</span>
      </p>

      <div className="flex items-center gap-2">
        <button type="submit" className="rounded-[10px] bg-zk-blue px-4 py-2 text-sm font-semibold text-white">
          {initial ? "Save" : "Add"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-[10px] px-3 py-2 text-sm text-zk-text2">
          Cancel
        </button>
        {initial && (
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-zk-text2">
            <input type="checkbox" checked={o.on} onChange={() => set({ on: !o.on })} className="peer sr-only" />
            <span className="relative h-5 w-9 rounded-full bg-zk-chip transition peer-checked:bg-zk-blue after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
            {o.on ? "On" : "Off"}
          </label>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-semibold text-zk-bad-fg hover:bg-zk-bad-bg">
            <Trash2 className="size-4" /> Delete
          </button>
        )}
      </div>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-[11px] font-bold tracking-wider text-zk-muted uppercase">{label}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

const known = <T extends string>(builtIn: T[], used: T[]) => [...builtIn, ...used.filter((x, i) => !builtIn.includes(x) && used.indexOf(x) === i)];

/** A "+ Add" chip that turns into a small input. A name that already exists (ignoring case) picks that one instead. */
function AddChip({ what, known, onAdd }: { what: string; known: string[]; onAdd: (x: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const cancelled = useRef(false);
  const done = () => {
    if (cancelled.current) return;
    const x = text.trim().replace(/\s+/g, " ");
    if (x) onAdd(known.find((k) => k.toLowerCase() === x.toLowerCase()) ?? x);
    setText("");
    setOpen(false);
  };
  if (!open)
    return (
      <button
        type="button"
        onClick={() => {
          cancelled.current = false;
          setOpen(true);
        }}
        className="zk-pick flex items-center gap-1 rounded-full border border-dashed border-zk-border px-2.5 py-1 text-xs font-semibold text-zk-muted hover:border-zk-accent hover:text-zk-accent">
        <Plus className="size-3" /> Add
      </button>
    );
  return (
    <input
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={done}
      onKeyDown={(e) => {
        // Enter adds the chip rather than submitting the whole order.
        if (e.key === "Enter") {
          e.preventDefault();
          done();
        } else if (e.key === "Escape") {
          cancelled.current = true;
          setText("");
          setOpen(false);
        }
      }}
      maxLength={30}
      aria-label={`New ${what}`}
      placeholder={`New ${what}…`}
      className="animate-pop w-32 rounded-full border border-zk-accent bg-zk-seg px-2.5 py-1 text-xs text-zk-text outline-none"
    />
  );
}

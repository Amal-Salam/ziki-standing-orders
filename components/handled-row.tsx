"use client";

import { Check, ChevronDown, Hourglass, Undo2, X } from "lucide-react";
import { offerById } from "@/lib/data";
import { why } from "@/lib/orders";
import { actions, useStore } from "@/lib/store";
import { ago, clock } from "@/lib/time";
import type { OfferState } from "@/lib/types";
import { SEVERITY_TEXT } from "./offer-card";

/** One answered offer as a log line: what happened, who or which order decided, and an undo. The details open on click. */
export default function HandledRow({ state, now, onTake }: { state: OfferState; now: number; onTake: () => void }) {
  const offer = offerById(state.offerId)!;
  const s = useStore();
  const order = s?.orders.find((o) => o.id === state.orderId);
  const name = order?.name ?? state.orderName;
  const byOrder = state.by === "order";

  const verdict = {
    accepted: { icon: Check, tone: "text-zk-ok-fg", text: byOrder ? name : "You approved" },
    declined: { icon: X, tone: "text-zk-bad-fg", text: byOrder ? name : "You declined" },
    expired: { icon: Hourglass, tone: "text-zk-muted", text: "No answer in time" },
    released: { icon: Undo2, tone: "text-zk-muted", text: "You released it" },
    waiting: { icon: Hourglass, tone: "text-zk-warn-fg", text: "Waiting" },
  }[state.outcome];
  const Icon = verdict.icon;

  const undo =
    byOrder && state.outcome === "accepted"
      ? { label: "Release", run: () => actions.release(state.offerId) }
      : byOrder && state.outcome === "declined"
        ? { label: "Take it", run: onTake }
        : null;

  const when =
    state.outcome === "accepted" ? `${offer.agent} started at ${clock(state.decidedAt!)}` : `Offered to the next person · ${ago(state.decidedAt!, now)}`;

  return (
    <details className="group/row border-b border-zk-divider last:border-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-sm hover:bg-zk-seg">
        <Icon className={`size-4 shrink-0 ${verdict.tone}`} aria-label={state.outcome} />
        <span className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
          <span className="block truncate text-zk-text">{offer.title}</span>
          <span className="block truncate text-xs text-zk-muted sm:ml-auto sm:shrink-0">{verdict.text}</span>
        </span>
        {undo && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              undo.run();
            }}
            className="shrink-0 text-xs font-semibold text-zk-accent hover:underline"
          >
            {undo.label}
          </button>
        )}
        <ChevronDown className="size-4 shrink-0 text-zk-muted transition group-open/row:rotate-180" />
      </summary>
      <div className="space-y-1.5 pr-3 pb-3 pl-10 text-xs text-zk-text2">
        <p>
          <span className="font-mono">#{offer.issue}</span> · {offer.agent} · {offer.type} · <span className={SEVERITY_TEXT[offer.severity]}>{offer.severity}</span> · ~
          {offer.minutes} min · {offer.areas.join(", ")}
        </p>
        {byOrder && order && (
          <p>
            Matched “{order.name}”: {why(order, offer)}
          </p>
        )}
        {state.reason && <p>Your reason: {state.reason}</p>}
        <ol className="list-decimal pl-4">
          {offer.plan.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        <p className="text-zk-muted">{when}</p>
      </div>
    </details>
  );
}

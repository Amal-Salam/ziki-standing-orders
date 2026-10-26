"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Check, ChevronDown, Clock, Hourglass, ScrollText, Undo2, X } from "lucide-react";
import { offerById } from "@/lib/data";
import { DECLINE_REASONS, describe, suggestFromApprove, suggestFromDecline, why, type DeclineReason } from "@/lib/orders";
import { actions, useStore } from "@/lib/store";
import { ago, clock, mmss } from "@/lib/time";
import type { OfferState, Order } from "@/lib/types";
import { Chip, NewTag, SEVERITY_TONE } from "./bits";

/** One offer to one of the owner's agents: the issue, the agent's plan, and what happened to it and why. */
export type Suggestion = { order: Order; added: boolean };

/**
 * The suggestion lives with the parent: answering an offer moves its card from "Waiting on you" to "Earlier today",
 * which remounts it.
 */
export default function OfferCard({
  state,
  now,
  fresh,
  suggestion,
  onSuggest,
}: {
  state: OfferState;
  now: number;
  fresh?: boolean;
  suggestion?: Suggestion | null;
  onSuggest: (s: Suggestion | null) => void;
}) {
  const offer = offerById(state.offerId)!;
  const s = useStore();
  const order = s?.orders.find((o) => o.id === state.orderId);
  const [declining, setDeclining] = useState(false);

  const left = state.heldUntil ? state.heldUntil - now : 0;
  useEffect(() => {
    if (state.outcome === "waiting" && left <= 0) actions.expire(state.offerId);
  }, [state.outcome, state.offerId, left]);

  const approve = () => {
    actions.approve(state.offerId);
    if (state.outcome === "waiting") onSuggest({ order: suggestFromApprove(offer), added: false });
  };
  const decline = (reason: DeclineReason) => {
    const label = DECLINE_REASONS.find((r) => r.id === reason)!.label(offer);
    actions.decline(state.offerId, label);
    setDeclining(false);
    const order = suggestFromDecline(offer, reason);
    onSuggest(order && { order, added: false });
  };

  const waiting = state.outcome === "waiting";
  return (
    <article
      className={`overflow-hidden rounded-xl border bg-zk-surface ${waiting ? "border-zk-warn-bd" : "border-zk-border"} ${fresh ? "animate-arrive" : ""}`}
    >
      <Band state={state} order={order} now={now} left={left} />

      <div className="space-y-3 p-4">
        <div>
          <Link href={`/issues`} className="font-semibold text-zk-text hover:text-zk-accent">
            {offer.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zk-muted">
            <span className="font-mono">#{offer.issue}</span>
            <Chip>{offer.type}</Chip>
            <Chip tone={SEVERITY_TONE[offer.severity]}>{offer.severity}</Chip>
            <Chip>
              <Clock className="size-3" /> ~{offer.minutes} min
            </Chip>
            {offer.areas.map((a) => (
              <Chip key={a} tone="info">{a}</Chip>
            ))}
          </div>
        </div>

        <details open={waiting} className="group rounded-lg bg-zk-seg p-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-zk-text2 group-open:mb-1.5">
            <Bot className="size-3.5 text-zk-accent" /> {offer.agent}’s plan · offered {ago(state.arrivedAt, now)}
            <ChevronDown className="size-3.5 transition group-open:rotate-180" />
          </summary>
          <ol className="list-decimal space-y-0.5 pl-5 text-zk-text2">
            {offer.plan.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-zk-muted">Once accepted, Ziki expects a linked fix within {offer.deliverMinutes} min.</p>
        </details>

        {waiting && !declining && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={approve} className="flex items-center gap-1.5 rounded-[10px] bg-zk-blue px-4 py-2 text-sm font-semibold text-white">
              <Check className="size-4" /> Approve, {offer.agent} takes it
            </button>
            <button
              type="button"
              onClick={() => setDeclining(true)}
              className="flex items-center gap-1.5 rounded-[10px] border border-zk-border px-4 py-2 text-sm font-semibold text-zk-text"
            >
              <X className="size-4" /> Decline
            </button>
          </div>
        )}

        {waiting && declining && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-zk-text">Why not? Ziki uses this to suggest a standing order.</p>
            <div className="flex flex-wrap gap-2">
              {DECLINE_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => decline(r.id)}
                  className="rounded-full border border-zk-border px-3 py-1.5 text-sm text-zk-text2 hover:border-zk-accent hover:text-zk-text"
                >
                  {r.label(offer)}
                </button>
              ))}
              <button type="button" onClick={() => setDeclining(false)} className="px-2 text-sm text-zk-muted">
                Cancel
              </button>
            </div>
          </div>
        )}

        {state.outcome === "accepted" && state.by === "order" && (
          <button type="button" onClick={() => actions.release(state.offerId)} className="flex items-center gap-1.5 text-sm font-semibold text-zk-text2 hover:text-zk-text">
            <Undo2 className="size-4" /> Not this one: release it
          </button>
        )}
        {state.outcome === "declined" && state.by === "order" && (
          <button type="button" onClick={approve} className="flex items-center gap-1.5 text-sm font-semibold text-zk-text2 hover:text-zk-text">
            <Check className="size-4" /> Take it anyway
          </button>
        )}

        {suggestion && (
          <div className="rounded-lg border border-dashed border-zk-accent/50 bg-zk-tint p-3 text-sm">
            {suggestion.added ? (
              <p className="flex flex-wrap items-center gap-2 text-zk-text">
                <Check className="size-4 text-zk-ok-fg" /> Added “{suggestion.order.name}” to the top of your standing orders.
                <Link href="/orders" className="font-semibold text-zk-accent">Edit →</Link>
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2 font-semibold text-zk-text">
                  <ScrollText className="size-4 text-zk-accent" /> Next time, skip the question? <NewTag />
                </p>
                <p className="mt-1 text-zk-text2">{describe(suggestion.order)}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      actions.addOrder(suggestion.order);
                      onSuggest({ ...suggestion, added: true });
                    }}
                    className="rounded-[10px] bg-zk-blue px-3 py-1.5 font-semibold text-white"
                  >
                    Add as a standing order
                  </button>
                  <button type="button" onClick={() => onSuggest(null)} className="rounded-[10px] px-3 py-1.5 text-zk-text2">
                    Just this once
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** The strip across the top of a card: what happened, who decided, and the rule that did it. */
function Band({ state, order, now, left }: { state: OfferState; order?: Order; now: number; left: number }) {
  const offer = offerById(state.offerId)!;
  const name = order?.name ?? state.orderName;
  const base = "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm";

  if (state.outcome === "waiting") {
    return (
      <div className={`${base} justify-between bg-zk-warn-bg text-zk-warn-fg`}>
        <span className="flex items-center gap-2 font-semibold">
          <Hourglass className="size-4" />
          {state.by === "order" ? `Waiting on you: your order “${name}” says ask` : "Waiting on you: no standing order covers this"}
        </span>
        <span className="font-mono text-xs" aria-label="Time left">
          held for you · {mmss(left)} left
        </span>
      </div>
    );
  }
  if (state.outcome === "accepted") {
    return (
      <div className={`${base} bg-zk-ok-bg text-zk-ok-fg`}>
        <span className="flex items-center gap-2 font-semibold">
          <Check className="size-4" />
          {state.by === "order" ? `Taken by your order “${name}”` : "You approved it"}
        </span>
        <span className="text-xs opacity-80">
          {offer.agent} started at {clock(state.decidedAt!)}
          {state.by === "order" && order && ` · ${why(order, offer)}`}
        </span>
      </div>
    );
  }
  if (state.outcome === "declined") {
    return (
      <div className={`${base} bg-zk-bad-bg text-zk-bad-fg`}>
        <span className="flex items-center gap-2 font-semibold">
          <X className="size-4" />
          {state.by === "order" ? `Turned down by your order “${name}”` : `You turned it down: ${state.reason}`}
        </span>
        <span className="text-xs opacity-80">Ziki offered it to the next person · {ago(state.decidedAt!, now)}</span>
      </div>
    );
  }
  const text = state.outcome === "expired" ? "No answer in time: Ziki offered it to the next person" : "You released it: Ziki offered it to the next person";
  return (
    <div className={`${base} bg-zk-chip text-zk-text2`}>
      <span className="flex items-center gap-2 font-semibold">
        <Undo2 className="size-4" /> {text}
      </span>
      <span className="text-xs">{ago(state.decidedAt!, now)}</span>
    </div>
  );
}

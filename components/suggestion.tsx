"use client";

import { Check, X } from "lucide-react";
import { offerById } from "@/lib/data";
import { DECLINE_REASONS, describe, suggestFromApprove, suggestFromDecline } from "@/lib/orders";
import { actions } from "@/lib/store";
import type { Order } from "@/lib/types";

/** What the owner just answered, and the order they added from it, if any. */
export type Answered = { offerId: string; answer: "approved" | "declined"; added?: Order };

/**
 * The one optional step after an answer: turn it into a standing order with one tap, or ignore it.
 * Each choice is labelled with the order it creates, so there's nothing to work out.
 */
export default function LearnPrompt({ answered, onChange }: { answered: Answered; onChange: (a: Answered | null) => void }) {
  const offer = offerById(answered.offerId)!;
  const add = (order: Order) => {
    actions.addOrder(order);
    onChange({ ...answered, added: order });
  };
  const button = "rounded-full border border-zk-accent/50 px-3 py-1.5 text-sm font-semibold text-zk-accent hover:bg-zk-accent/10";

  if (answered.added) {
    return (
      <p className="animate-arrive flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-zk-border bg-zk-surface px-4 py-3 text-sm text-zk-text">
        <Check className="size-4 text-zk-ok-fg" /> New standing order: <b>{answered.added.name}</b>
        <span className="ml-auto flex gap-3">
          <button
            type="button"
            onClick={() => {
              actions.removeOrder(answered.added!.id);
              onChange(null);
            }}
            className="text-zk-text2 hover:text-zk-text"
          >
            Undo
          </button>
          <button type="button" onClick={() => onChange(null)} aria-label="Dismiss" className="text-zk-muted hover:text-zk-text">
            <X className="size-4" />
          </button>
        </span>
      </p>
    );
  }

  const options =
    answered.answer === "approved"
      ? [suggestFromApprove(offer)]
      : DECLINE_REASONS.map((r) => suggestFromDecline(offer, r.id)).filter((o): o is Order => !!o);

  return (
    <div className="animate-arrive space-y-2 rounded-xl border border-zk-border bg-zk-surface px-4 py-3 text-sm">
      <p className="text-zk-text">
        <b>{answered.answer === "approved" ? "Approved." : "Declined."}</b>{" "}
        <span className="text-zk-text2">Handle offers like this one automatically next time?</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.name} type="button" onClick={() => add(o)} className={button} title={describe(o)}>
            {o.name}
          </button>
        ))}
        <button type="button" onClick={() => onChange(null)} className="px-2 text-sm text-zk-muted hover:text-zk-text">
          No, keep asking
        </button>
      </div>
    </div>
  );
}

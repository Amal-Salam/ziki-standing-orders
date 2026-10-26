"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bot, Check, Hourglass, X } from "lucide-react";
import { offerById } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { mmss } from "@/lib/time";
import type { OfferState, Severity } from "@/lib/types";

export const SEVERITY_TEXT: Record<Severity, string> = { Low: "", Medium: "", High: "font-semibold text-zk-warn-fg", Critical: "font-semibold text-zk-bad-fg" };

/** An offer that needs the owner: why they're being asked, the agent's plan, and Approve / Decline. One tap decides. */
export default function OfferCard({
  state,
  now,
  fresh,
  onApprove,
  onDecline,
}: {
  state: OfferState;
  now: number;
  fresh?: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const offer = offerById(state.offerId)!;
  const s = useStore();
  const name = s?.orders.find((o) => o.id === state.orderId)?.name ?? state.orderName;

  const left = state.heldUntil ? state.heldUntil - now : 0;
  useEffect(() => {
    if (left <= 0) actions.expire(state.offerId);
  }, [state.offerId, left]);

  return (
    <article className={`space-y-3 rounded-xl border border-zk-warn-bd bg-zk-surface p-4 ${fresh ? "animate-arrive" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-semibold text-zk-text">
          <Link href="/issues" className="hover:text-zk-accent">
            {offer.title}
          </Link>{" "}
          <span className="font-mono text-xs font-normal text-zk-muted">#{offer.issue}</span>
        </h3>
        <span
          className="flex shrink-0 items-center gap-1 rounded-full bg-zk-warn-bg px-2 py-0.5 font-mono text-xs font-semibold text-zk-warn-fg"
          title={`Ziki holds this offer for you for ${s?.holdMinutes ?? 10} minutes, then offers it to the next person.`}
          aria-label="Time left"
        >
          <Hourglass className="size-3" /> {mmss(left)} left
        </span>
      </div>

      <p className="text-sm text-zk-warn-fg">
        Asked because: {state.by === "order" ? <b>“{name}”</b> : "no standing order covers this"}
      </p>

      <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-zk-text2">
        <Bot className="size-4 text-zk-accent" /> {offer.agent} · {offer.type} · <span className={SEVERITY_TEXT[offer.severity]}>{offer.severity}</span> · ~
        {offer.minutes} min
        {/* With no order to explain the ask, the areas are the useful context. */}
        {state.by !== "order" && <> · {offer.areas.join(", ")}</>}
      </p>

      <ol className="list-decimal space-y-0.5 rounded-lg bg-zk-seg py-2.5 pr-3 pl-8 text-sm text-zk-text2">
        {offer.plan.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-zk-blue px-5 py-2.5 text-sm font-semibold text-white sm:flex-none"
        >
          <Check className="size-4" /> Approve
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-zk-border px-5 py-2.5 text-sm font-semibold text-zk-text sm:flex-none"
        >
          <X className="size-4" /> Decline
        </button>
      </div>
    </article>
  );
}

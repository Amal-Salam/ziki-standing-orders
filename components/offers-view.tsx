"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ScrollText, Send, ShieldCheck, X } from "lucide-react";
import { QUEUE, offerById } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { useNow } from "@/lib/time";
import type { OfferState } from "@/lib/types";
import { NewTag, Placeholder } from "./bits";
import HandledRow from "./handled-row";
import OfferCard from "./offer-card";
import LearnPrompt, { type Answered } from "./suggestion";
import ZikiLogo from "./ziki-logo";

/**
 * The Offers page. When the agents are working within their orders it is close to empty: only offers that need the owner
 * are cards, and everything Ziki handled is a collapsed log underneath.
 */
export default function OffersView() {
  const s = useStore();
  const now = useNow();
  const [checking, setChecking] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [ping, setPing] = useState<string | null>(null);
  const [answered, setAnswered] = useState<Answered | null>(null);

  if (!s) return <Placeholder />;

  const approve = (o: OfferState) => {
    actions.approve(o.offerId);
    if (o.outcome === "waiting") setAnswered({ offerId: o.offerId, answer: "approved" });
  };
  const decline = (o: OfferState) => {
    actions.decline(o.offerId);
    setAnswered({ offerId: o.offerId, answer: "declined" });
  };

  const waiting = s.offers.filter((o) => o.outcome === "waiting");
  const done = s.offers.filter((o) => o.outcome !== "waiting");
  const handled = s.offers.filter((o) => o.by === "order" && o.outcome !== "waiting").length;
  const pinged = waiting.find((o) => o.offerId === ping);
  const next = QUEUE[s.next];

  const simulate = () => {
    if (!next || checking) return;
    setLast(null);
    setChecking(`${next.agent} was offered #${next.issue}: “${next.title}”`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(
      () => {
        const r = actions.simulate();
        setChecking(null);
        if (!r) return;
        setFresh(r.offerId);
        if (r.outcome === "waiting") setPing(r.offerId);
        else setLast(`#${next.issue} ${r.outcome === "accepted" ? "taken" : "turned down"} by “${r.orderName}”. Nobody was asked.`);
      },
      reduce ? 150 : 1300,
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <p className="flex items-center gap-2 text-sm text-zk-text2">
            Zedu <span className="text-zk-muted">›</span> <span className="font-semibold text-zk-text">Offers</span> <NewTag />
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-zk-text sm:text-3xl">Offers</h1>
        </div>
        <p className="text-sm text-zk-text2">
          <b className="text-zk-text">{handled}</b> handled today ·{" "}
          {waiting.length ? <b className="text-zk-warn-fg">{waiting.length} {waiting.length === 1 ? "needs" : "need"} you</b> : "nothing needs you"}
        </p>
      </header>

      {checking && (
        <div className="animate-scan rounded-xl border border-zk-border bg-zk-surface px-4 py-3 text-sm" role="status">
          <p className="font-semibold text-zk-text">{checking}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-zk-text2">
            <ScrollText className="size-4 text-zk-accent" /> Ziki is checking your {s.orders.filter((o) => o.on).length} standing orders…
          </p>
        </div>
      )}

      <section className="space-y-3" aria-label="Needs you">
        {waiting.map((o) => (
          <OfferCard
            key={o.offerId}
            state={o}
            now={now}
            fresh={o.offerId === fresh}
            onApprove={() => approve(o)}
            onDecline={() => decline(o)}
          />
        ))}
        {answered && <LearnPrompt key={answered.offerId} answered={answered} onChange={setAnswered} />}
        {waiting.length === 0 && (
          <div className="rounded-xl border border-dashed border-zk-border px-4 py-10 text-center">
            <ShieldCheck className="mx-auto size-8 text-zk-ok-fg" />
            <p className="mt-3 font-display text-lg font-bold text-zk-text">Nothing needs you.</p>
            <p className="mt-1 text-sm text-zk-text2">
              Your agents handled {handled} {handled === 1 ? "offer" : "offers"} today.
            </p>
          </div>
        )}
      </section>

      <details className="group rounded-xl border border-zk-border bg-zk-surface">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-3 text-sm font-semibold text-zk-text2">
          <ChevronDown className="size-4 -rotate-90 transition group-open:rotate-0" />
          Done today · {done.length}
          <Link href="/orders" className="ml-auto text-xs text-zk-accent" onClick={(e) => e.stopPropagation()}>
            Edit standing orders →
          </Link>
        </summary>
        <div className="border-t border-zk-divider">
          {done.map((o) => (
            <HandledRow key={o.offerId} state={o} now={now} onTake={() => approve(o)} />
          ))}
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-dashed border-zk-border px-4 py-3 text-xs text-zk-muted">
        <span className="font-bold tracking-wider uppercase">Demo</span>
        <span className={`min-w-0 flex-1 ${last ? "" : "hidden sm:inline"}`}>{last ?? "Send the next sample offer through your current standing orders."}</span>
        <button
          type="button"
          onClick={simulate}
          disabled={!next || !!checking}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-zk-border px-3 py-1.5 font-semibold text-zk-text2 hover:text-zk-text disabled:opacity-50"
        >
          <Send className="size-3.5" /> {next ? `Send a sample offer (${QUEUE.length - s.next} left)` : "No more sample offers"}
        </button>
      </div>

      {pinged && <Notification state={pinged} onApprove={() => approve(pinged)} onDecline={() => decline(pinged)} onClose={() => setPing(null)} />}
    </div>
  );
}

/** How a waiting offer reaches the owner wherever they are: a push notification they can answer without opening Ziki. */
function Notification({ state, onApprove, onDecline, onClose }: { state: OfferState; onApprove: () => void; onDecline: () => void; onClose: () => void }) {
  const offer = offerById(state.offerId)!;
  const s = useStore();
  const name = s?.orders.find((o) => o.id === state.orderId)?.name ?? state.orderName;
  return (
    <div
      role="alert"
      aria-label="Notification"
      className="animate-arrive fixed top-[72px] right-3 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-zk-border bg-zk-surface p-3 shadow-2xl"
    >
      <div className="flex items-center gap-1.5 text-xs text-zk-muted">
        <span className="flex scale-75 items-center gap-1 origin-left">
          <ZikiLogo />
        </span>
        <span>· now</span>
        <NewTag />
        <button type="button" onClick={onClose} aria-label="Dismiss" className="ml-auto p-1 hover:text-zk-text">
          <X className="size-3.5" />
        </button>
      </div>
      <p className="mt-1 text-sm font-semibold text-zk-text">
        {offer.agent} wants #{offer.issue}: {offer.title}
      </p>
      <p className="mt-0.5 text-xs text-zk-text2">
        {state.by === "order" ? `Asked because: “${name}”` : "No standing order covers this"} · ~{offer.minutes} min
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onApprove} className="rounded-lg bg-zk-blue py-1.5 text-sm font-semibold text-white">
          Approve
        </button>
        <button type="button" onClick={onDecline} className="rounded-lg border border-zk-border py-1.5 text-sm font-semibold text-zk-text">
          Decline
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Hourglass, Inbox, ScrollText, Send, ShieldCheck } from "lucide-react";
import { QUEUE } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { useNow } from "@/lib/time";
import type { OfferState } from "@/lib/types";
import { NewTag, Placeholder } from "./bits";
import OfferCard, { type Suggestion } from "./offer-card";

/** The Offers page: offers that need the owner first, then everything Ziki handled for them by their standing orders. */
export default function OffersView() {
  const s = useStore();
  const now = useNow();
  const [checking, setChecking] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion | null>>({});

  if (!s) return <Placeholder />;

  const card = (o: OfferState) => (
    <OfferCard
      key={o.offerId}
      state={o}
      now={now}
      fresh={o.offerId === fresh}
      suggestion={suggestions[o.offerId]}
      onSuggest={(x) => setSuggestions((m) => ({ ...m, [o.offerId]: x }))}
    />
  );

  const waiting = s.offers.filter((o) => o.outcome === "waiting");
  const done = s.offers.filter((o) => o.outcome !== "waiting");
  const count = (f: (o: OfferState) => boolean) => s.offers.filter(f).length;
  const byOrder = count((o) => !o.asked);
  const asked = count((o) => !!o.asked);
  const taken = count((o) => o.outcome === "accepted");
  const next = QUEUE[s.next];

  const simulate = () => {
    if (!next || checking) return;
    setChecking(`${next.agent} was offered #${next.issue}: “${next.title}”`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(
      () => {
        const r = actions.simulate();
        setChecking(null);
        if (r) setFresh(r.offerId);
      },
      reduce ? 150 : 1300,
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-zk-text2">
            Zedu <span className="text-zk-muted">›</span> <span className="font-semibold text-zk-text">Offers</span> <NewTag />
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-zk-text sm:text-3xl">Offers to your agents</h1>
          <p className="mt-1 max-w-2xl text-sm text-zk-text2">
            Your standing orders answer most offers the moment they arrive. The rest wait here for you, held for {s.holdMinutes} minutes instead of
            lapsing after 60 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={simulate}
          disabled={!next || !!checking}
          className="flex items-center gap-2 rounded-[10px] bg-zk-blue px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="size-4" /> {next ? "Simulate an offer" : "No more sample offers"}
        </button>
      </header>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={ShieldCheck} label="Handled by your orders" value={byOrder} />
        <Stat icon={Hourglass} label="Waiting on you" value={waiting.length} warn={waiting.length > 0} />
        <Stat icon={Inbox} label="Times you were asked" value={`${asked} of ${s.offers.length}`} />
        <Stat icon={Bot} label="Taken today" value={taken} />
      </dl>

      {checking && (
        <div className="animate-scan rounded-xl border border-zk-border bg-zk-surface px-4 py-3 text-sm" role="status">
          <p className="font-semibold text-zk-text">{checking}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-zk-text2">
            <ScrollText className="size-4 text-zk-accent" /> Ziki is checking your {s.orders.filter((o) => o.on).length} standing orders…
          </p>
        </div>
      )}

      <section className="space-y-3" aria-labelledby="waiting">
        <h2 id="waiting" className="text-xs font-bold tracking-wider text-zk-text2 uppercase">
          Waiting on you · {waiting.length}
        </h2>
        {waiting.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zk-border px-4 py-6 text-center text-sm text-zk-muted">
            Nothing needs you. Your agents are working within your standing orders.
          </p>
        ) : (
          waiting.map(card)
        )}
      </section>

      <section className="space-y-3" aria-labelledby="handled">
        <div className="flex items-center justify-between">
          <h2 id="handled" className="text-xs font-bold tracking-wider text-zk-text2 uppercase">
            Earlier today · {done.length}
          </h2>
          <Link href="/orders" className="text-sm font-semibold text-zk-accent">
            Edit standing orders →
          </Link>
        </div>
        {done.map(card)}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, warn }: { icon: React.ElementType; label: string; value: React.ReactNode; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${warn ? "border-zk-warn-bd bg-zk-warn-bg" : "border-zk-border bg-zk-surface"}`}>
      <dt className={`flex items-center gap-1.5 text-xs ${warn ? "text-zk-warn-fg" : "text-zk-text2"}`}>
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className={`mt-1 font-display text-xl font-extrabold ${warn ? "text-zk-warn-fg" : "text-zk-text"}`}>{value}</dd>
    </div>
  );
}

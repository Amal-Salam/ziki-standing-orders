import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import AgentReads from "@/components/agent-reads";
import ResetDemo from "@/components/reset-demo";
import { DEFAULT_HOLD_MINUTES } from "@/lib/data";
import { MY_PROBLEM } from "@/lib/my-problem";

export const metadata: Metadata = { title: "Standing orders · About this proposal" };

const TODAY = [
  "Ziki offers an issue to your agent. The offer lasts 60 seconds.",
  "Ziki’s rules say the agent must ask you first, in its own chat window, outside Ziki.",
  "You’re in a meeting, so the offer lapses. Or you’re there and say “yes” without reading, because the clock is running.",
  "Nothing in Ziki records that you approved it, or why.",
];

const WITH = [
  "You set standing orders once: “Small fixes: go ahead”, “Never touch payments”, “Always ask me about sign-in”.",
  "Ziki checks each offer against them the moment it arrives. Most offers are answered without you.",
  `The rest come to an Offers page in Ziki, held for ${DEFAULT_HOLD_MINUTES} minutes with the agent’s plan, and you approve or decline in one tap.`,
  "Each answer can become a new order, so you’re asked less over time. Every decision names the order or person behind it.",
  "A waiting offer reaches you as a notification with Approve and Decline on it, so most days you never open the page.",
];

const CHANGES = [
  {
    title: "Standing orders",
    text: "A short list grouped by what each order does: go ahead without asking, ask me first, never take. Orders match on issue type, area, severity and estimate. If two match, “never” wins, then the newest. A collapsed preview shows how the sample offers would go.",
    href: "/orders",
    cta: "Open Standing orders",
  },
  {
    title: "An Offers page",
    text: "Only offers that need you are cards: why you’re asked, the agent’s plan, and Approve or Decline, one tap each. Everything Ziki handled is a collapsed log line naming the order that decided it, with an undo. When nothing needs you, the page says so.",
    href: "/offers",
    cta: "Open Offers",
  },
  {
    title: "Offers wait for a person",
    text: `When no order covers an offer, Ziki holds it for the owner (${DEFAULT_HOLD_MINUTES} minutes by default) instead of letting it lapse after 60 seconds. Offers that a rule answers still take under a second.`,
    href: "/offers",
    cta: "Send a sample offer",
  },
  {
    title: "Your answers become orders",
    text: "After you answer, Ziki offers the order that would answer offers like it next time, as a button named after the order. One tap adds it, or ignore it and nothing changes.",
    href: "/offers",
    cta: "Try it on the waiting offer",
  },
];

export default function ProposalPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 pb-8 text-[15px] leading-relaxed text-zk-text2">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-zk-accent">
        <ArrowLeft className="size-4" /> Back to the mock-up
      </Link>

      <header className="space-y-3">
        <p className="text-xs font-bold tracking-wider text-zk-accent uppercase">Ziki proposal · human-agent interaction · step 3, Authorize</p>
        <h1 className="font-display text-3xl font-extrabold text-zk-text sm:text-4xl">Standing orders</h1>
        <p className="text-lg">Tell your agents once what they may take. Ziki answers the routine offers and only asks you about the rest.</p>
      </header>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-zk-text">The problem</h2>
        <p>Ziki promises owner-first autonomy: “Agents ask before they act. People make the call.” Ziki’s agent guide makes two rules that pull against each other:</p>
        <blockquote className="border-l-2 border-zk-accent/60 pl-4 italic">
          Agents must <b>never</b> unilaterally claim or bid on issues without consulting their owner first.
        </blockquote>
        <blockquote className="border-l-2 border-zk-accent/60 pl-4 italic">
          [An offer] expires after 60 seconds. … Accept it immediately.
        </blockquote>
        <p>
          The asking happens in the agent’s own chat, not in Ziki. So an owner who steps away misses work. An owner who stays has to answer every offer within a
          minute, and ends up approving without reading. Either way Ziki has no record of what the owner allowed.
        </p>
      </section>

      {MY_PROBLEM.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-xl font-bold text-zk-text">What I found</h2>
          {MY_PROBLEM.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zk-border bg-zk-surface p-4">
          <h2 className="mb-2 font-display font-bold text-zk-text">Today</h2>
          <ul className="space-y-2 text-sm">
            {TODAY.map((t) => (
              <li key={t} className="flex gap-2">
                <X className="mt-0.5 size-4 shrink-0 text-zk-bad-fg" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-zk-accent/40 bg-zk-tint p-4">
          <h2 className="mb-2 font-display font-bold text-zk-text">With standing orders</h2>
          <ul className="space-y-2 text-sm">
            {WITH.map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-zk-ok-fg" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-zk-text">What changed</h2>
        <p>
          Same Ziki, same look. Four changes, each marked{" "}
          <span className="rounded-full border border-dashed border-zk-accent/60 px-1.5 text-[10px] font-bold text-zk-accent">NEW</span> in the mock-up:
        </p>
        <ol className="space-y-3">
          {CHANGES.map((c, i) => (
            <li key={c.title} className="rounded-xl border border-zk-border bg-zk-surface p-4">
              <p className="font-semibold text-zk-text">
                {i + 1}. {c.title}
              </p>
              <p className="mt-1 text-sm">{c.text}</p>
              <Link href={c.href} className="mt-2 inline-block text-sm font-semibold text-zk-accent">
                {c.cta} →
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-zk-text">What it needs from Ziki’s API</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code className="text-zk-accent">GET /api/v1/agents/me</code> returns <code className="text-zk-accent">standing_orders</code> next to the existing{" "}
            <code className="text-zk-accent">instructions</code> brief, so agents can explain what they’re allowed to do.
          </li>
          <li>
            Ziki checks the orders on the server when an offer is made. An offer a “go ahead” order covers can be accepted at once. One a “turn down” order covers
            goes to the next person.
          </li>
          <li>
            Anything else becomes a <code className="text-zk-accent">work_authorization</code> escalation (a type Ziki already has) and the offer is held.{" "}
            <code className="text-zk-accent">POST /offers/:id/accept</code> answers <code className="text-zk-accent">403 owner_approval_required</code> until the
            owner approves.
          </li>
          <li>Each claim records what authorized it: the order’s name, or the person who approved it.</li>
        </ul>
        <AgentReads />
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-zk-text">Why people and agents are both better off</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b className="text-zk-text">Owners decide once, not every minute.</b> Routine work flows. Owners only see what’s new or risky.
          </li>
          <li>
            <b className="text-zk-text">When they are asked, they have time to read.</b> The plan, estimate and areas are on one card, with minutes instead of
            seconds.
          </li>
          <li>
            <b className="text-zk-text">Agents stop guessing.</b> “Prefer small fixes” in a free-text brief becomes a rule Ziki checks, so an agent can’t drift
            past what its owner allowed.
          </li>
          <li>
            <b className="text-zk-text">Every claim is explainable.</b> “Taken by your order ‘Small fixes: go ahead’” or “You approved it”, never “the agent
            decided”.
          </li>
          <li>
            <b className="text-zk-text">Fewer missed offers.</b> Work isn’t re-offered just because a person needed 61 seconds.
          </li>
        </ul>
      </section>

      <footer className="space-y-2 border-t border-zk-divider pt-5 text-sm">
        <p>This is a front-end mock-up with made-up data. Your orders and answers are kept in this browser only.</p>
        <ResetDemo />
      </footer>
    </article>
  );
}

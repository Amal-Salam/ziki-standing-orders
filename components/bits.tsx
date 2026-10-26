import Link from "next/link";
import { FileText } from "lucide-react";
import type { OrderAction, Severity } from "@/lib/types";

/** Marks a part of the screen this proposal adds. */
export function NewTag() {
  return <span className="rounded-full border border-dashed border-zk-accent/60 px-1.5 py-px text-[10px] font-bold tracking-wide text-zk-accent">NEW</span>;
}

export function Chip({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "ok" | "bad" | "warn" | "info" }) {
  const tones = {
    plain: "border-zk-border bg-zk-chip text-zk-text2",
    ok: "border-transparent bg-zk-ok-bg text-zk-ok-fg",
    bad: "border-zk-bad-bd bg-zk-bad-bg text-zk-bad-fg",
    warn: "border-zk-warn-bd bg-zk-warn-bg text-zk-warn-fg",
    info: "border-transparent bg-zk-info-bg text-zk-info-fg",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export const SEVERITY_TONE: Record<Severity, "plain" | "warn" | "bad"> = { Low: "plain", Medium: "plain", High: "warn", Critical: "bad" };

export const ACTION_TONE: Record<OrderAction, "ok" | "warn" | "bad"> = { go: "ok", ask: "warn", never: "bad" };

/** The floating link to the write-up, on every page but the write-up itself. */
export function ProposalLink() {
  return (
    <Link
      href="/proposal"
      className="fixed right-3 bottom-24 z-30 flex items-center gap-2 rounded-full border border-zk-accent/40 bg-zk-tint px-4 py-2 text-sm font-semibold text-zk-accent shadow-lg lg:bottom-5"
    >
      <FileText className="size-4" /> About this proposal
    </Link>
  );
}

export function Placeholder() {
  return <div className="h-64 animate-pulse rounded-xl bg-zk-surface" aria-label="Loading" />;
}

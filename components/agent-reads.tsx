"use client";

import { useStore } from "@/lib/store";

/** The orders as the agents receive them, alongside the free-text brief Ziki already has. */
export default function AgentReads() {
  const s = useStore();
  if (!s) return null;
  const body = {
    id: "agent_kestrel",
    owner_id: "user_lanfear",
    level: "contributor",
    instructions: "Prefer small, well-tested fixes. Explain your plan in the PR.",
    standing_orders: s.orders
      .filter((o) => o.on)
      .map(({ name, action, types, areas, maxSeverity, minSeverity, maxMinutes, minMinutes }) => ({
        name,
        action,
        ...(types.length ? { types } : {}),
        ...(areas.length ? { areas } : {}),
        ...(maxSeverity ? { max_severity: maxSeverity } : {}),
        ...(minSeverity ? { min_severity: minSeverity } : {}),
        ...(maxMinutes != null ? { max_minutes: maxMinutes } : {}),
        ...(minMinutes != null ? { min_minutes: minMinutes } : {}),
      })),
    otherwise: { action: "ask", hold_minutes: s.holdMinutes },
  };
  return (
    <details className="rounded-xl border border-zk-border bg-zk-surface">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-zk-text">What an agent reads from GET /api/v1/agents/me</summary>
      <pre className="overflow-x-auto border-t border-zk-divider bg-zk-seg p-4 font-mono text-xs leading-relaxed text-zk-text2">{JSON.stringify(body, null, 2)}</pre>
    </details>
  );
}

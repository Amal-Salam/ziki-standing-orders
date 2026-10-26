"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bot, ChevronDown, Trophy } from "lucide-react";
import { ME, PROJECT } from "@/lib/data";
import { useStore } from "@/lib/store";
import Avatar from "./avatar";
import ZikiLogo from "./ziki-logo";
import { SECTIONS } from "./sections";

/** Ziki's header. The Offers link carries a count of offers waiting on the owner. */
export default function AppHeader() {
  const path = usePathname();
  const s = useStore();
  const waiting = s?.offers.filter((o) => o.outcome === "waiting").length ?? 0;
  return (
    <header className="relative z-40 border-b border-zk-border bg-zk-surface lg:sticky lg:top-0">
      <div className="mx-auto flex h-[60px] max-w-[1400px] items-center gap-3 px-3 sm:px-6">
        <Link href="/offers" aria-label="Ziki" className="flex items-center gap-1.5">
          <ZikiLogo />
        </Link>
        <span className="h-5 w-px bg-zk-border" />
        <span className="flex items-center gap-1 text-sm font-semibold text-zk-text">
          {PROJECT} <ChevronDown className="size-4 text-zk-muted" />
        </span>
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Sections">
          {SECTIONS.map(({ href, label, icon: Icon, match }) => {
            const on = match(path);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${on ? "bg-zk-tint text-zk-accent" : "text-zk-text2 hover:text-zk-text"}`}
              >
                <Icon className="size-4" /> {label}
                {href === "/offers" && waiting > 0 && (
                  <span className="rounded-full bg-zk-warn-fg px-1.5 text-[11px] font-bold leading-[18px] text-zk-bg">{waiting}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-zk-border px-4 py-2 text-sm font-semibold xl:flex">
            <Bot className="size-4 text-zk-accent" /> Agents <ChevronDown className="size-4 text-zk-muted" />
          </span>
          <span className="flex items-center gap-2 rounded-full border border-zk-border py-1 pr-1 pl-1 text-sm font-semibold sm:pr-3">
            <Avatar name={ME.name} size={30} />
            <span className="hidden sm:inline">{ME.name}</span>
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-zk-warn-bd bg-zk-warn-bg px-3 py-1.5 text-sm font-bold text-zk-warn-fg sm:flex">
            <Trophy className="size-4" /> {ME.points} pts
          </span>
          <span aria-label={`Notifications, ${ME.unread} unread`} className="relative p-1.5">
            <Bell className="size-5" />
            <span className="absolute -top-1 -right-1.5 rounded-full bg-zk-blue px-1.5 text-[11px] font-bold leading-[18px] text-white">{ME.unread}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

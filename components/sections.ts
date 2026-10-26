import { HandCoins, LayoutDashboard, ListChecks, ScrollText } from "lucide-react";

/** The app's sections, shared by the header (wide screens) and the bottom bar (narrow screens). */
export const SECTIONS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p.startsWith("/dashboard"), isNew: false },
  { href: "/issues", label: "Issues", icon: ListChecks, match: (p: string) => p.startsWith("/issues"), isNew: false },
  { href: "/orders", label: "Standing orders", icon: ScrollText, match: (p: string) => p.startsWith("/orders"), isNew: true },
  { href: "/offers", label: "Offers", icon: HandCoins, match: (p: string) => p.startsWith("/offers"), isNew: true },
];

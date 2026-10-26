import type { Metadata } from "next";
import { ProposalLink } from "@/components/bits";
import OffersView from "@/components/offers-view";

export const metadata: Metadata = { title: "Offers · Ziki" };

export default function OffersPage() {
  return (
    <>
      <OffersView />
      <ProposalLink />
    </>
  );
}

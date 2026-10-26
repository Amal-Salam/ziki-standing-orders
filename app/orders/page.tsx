import type { Metadata } from "next";
import { ProposalLink } from "@/components/bits";
import OrdersView from "@/components/orders-view";

export const metadata: Metadata = { title: "Standing orders · Ziki" };

export default function OrdersPage() {
  return (
    <>
      <OrdersView />
      <ProposalLink />
    </>
  );
}

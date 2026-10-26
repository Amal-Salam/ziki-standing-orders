import Link from "next/link";

/** Sections of Ziki this mock-up doesn't change. */
export default function NotInMockup({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-md space-y-3 rounded-xl border border-zk-border bg-zk-surface p-6 text-center">
      <h1 className="font-display text-xl font-bold text-zk-text">{name} works as it does in Ziki today</h1>
      <p className="text-sm text-zk-text2">This mock-up only changes how offers are authorized.</p>
      <div className="flex justify-center gap-3 text-sm font-semibold">
        <Link href="/offers" className="text-zk-accent">Offers →</Link>
        <Link href="/orders" className="text-zk-accent">Standing orders →</Link>
      </div>
    </div>
  );
}

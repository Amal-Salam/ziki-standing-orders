"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { actions } from "@/lib/store";

/** Puts the default orders and sample offers back. */
export default function ResetDemo() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        actions.reset();
        setDone(true);
      }}
      className="flex items-center gap-1.5 font-semibold text-zk-accent"
    >
      <RotateCcw className="size-4" /> {done ? "Demo reset" : "Reset the demo"}
    </button>
  );
}

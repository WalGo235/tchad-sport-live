"use client";

import { useState } from "react";

export default function PossessionInputs({ defaultHome }: { defaultHome: number | "" }) {
  const [home, setHome] = useState<number>(typeof defaultHome === "number" ? defaultHome : 50);
  const away = 100 - home;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 bg-night border border-white/10 rounded-lg px-2 py-2">
        <button
          type="button"
          onClick={() => setHome((v) => Math.min(100, v + 1))}
          className="w-9 h-9 bg-gold/90 rounded-md flex items-center justify-center text-night hover:bg-gold transition-colors"
          aria-label="Augmenter la possession domicile"
        >
          ▲
        </button>
        <span className="flex-1 text-center font-mono text-sand">{home}</span>
      </div>
      <span className="text-xs text-muted text-center shrink-0 w-20">Possession (%)</span>
      <div className="flex-1 flex items-center gap-2 bg-night border border-white/10 rounded-lg px-2 py-2">
        <span className="flex-1 text-center font-mono text-sand">{away}</span>
        <button
          type="button"
          onClick={() => setHome((v) => Math.max(0, v - 1))}
          className="w-9 h-9 bg-gold/90 rounded-md flex items-center justify-center text-night hover:bg-gold transition-colors"
          aria-label="Diminuer la possession domicile"
        >
          ▼
        </button>
      </div>
      <input type="hidden" name="possessionHome" value={home} />
      <input type="hidden" name="possessionAway" value={away} />
    </div>
  );
}
"use client";

import { useState } from "react";

export default function PossessionInputs({
  defaultHome,
}: {
  defaultHome: number | "";
}) {
  const [home, setHome] = useState<number | "">(defaultHome);
  const away = home === "" ? "" : 100 - home;

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        name="possessionHome"
        min={0}
        max={100}
        value={home}
        onChange={(e) => {
          const val = e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value)));
          setHome(val);
        }}
        className="w-20 bg-night border border-white/10 rounded-lg px-2 py-2 text-sand text-center"
      />
      <span className="flex-1 text-sm text-muted text-center">Possession (%)</span>
      <input
        type="number"
        name="possessionAway"
        readOnly
        value={away}
        className="w-20 bg-night border border-white/10 rounded-lg px-2 py-2 text-sand text-center opacity-70"
      />
    </div>
  );
}
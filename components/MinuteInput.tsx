"use client";

import { useState } from "react";

const PRESETS = [25, 30, 35, 40, 45, 70, 75, 80, 85, 90];

export default function MinuteInput({ defaultValue }: { defaultValue: string }) {
  const match = defaultValue.match(/^(\d+)(?:\+(\d+))?/);
  const initialBase = match ? Number(match[1]) : null;
  const initialExtra = match?.[2] ? Number(match[2]) : 0;

  const [mode, setMode] = useState<"rapide" | "manuel">(
    initialBase !== null && PRESETS.includes(initialBase) ? "rapide" : "manuel"
  );
  const [base, setBase] = useState<number | null>(initialBase);
  const [extra, setExtra] = useState<number>(initialExtra);
  const [manualValue, setManualValue] = useState(defaultValue);

  const computedValue =
    mode === "rapide"
      ? base === null
        ? ""
        : extra > 0
          ? `${base}+${extra}'`
          : `${base}'`
      : manualValue;

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode("rapide")}
          className={`text-xs px-3 py-1 rounded-full ${mode === "rapide" ? "bg-gold text-night" : "bg-night border border-white/10 text-muted"}`}
        >
          Rapide
        </button>
        <button
          type="button"
          onClick={() => setMode("manuel")}
          className={`text-xs px-3 py-1 rounded-full ${mode === "manuel" ? "bg-gold text-night" : "bg-night border border-white/10 text-muted"}`}
        >
          Manuel
        </button>
      </div>

      {mode === "rapide" ? (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setBase(p)}
                className={`text-xs py-2 rounded-lg ${base === p ? "bg-gold text-night" : "bg-night border border-white/10 text-sand"}`}
              >
                {p}&apos;
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted shrink-0">+ Temps additionnel</span>
            <input
              type="number"
              min={0}
              max={10}
              value={extra}
              onChange={(e) => setExtra(Math.max(0, Math.min(10, Number(e.target.value))))}
              className="w-16 bg-night border border-white/10 rounded-lg px-2 py-1 text-sand text-center text-sm"
            />
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          placeholder="ex: 67' ou MT"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
      )}

      <input type="hidden" name="minute" value={computedValue} />
    </div>
  );
}
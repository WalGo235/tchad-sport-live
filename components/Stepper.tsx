"use client";

import { useState } from "react";

interface StepperProps {
  name: string;
  defaultValue: number | "";
  align: "left" | "right";
}

export default function Stepper({ name, defaultValue, align }: StepperProps) {
  const [value, setValue] = useState<number>(typeof defaultValue === "number" ? defaultValue : 0);

  const arrows = (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setValue((v) => v + 1)}
        className="w-7 h-5 bg-gold/90 rounded flex items-center justify-center text-night text-xs hover:bg-gold transition-colors"
        aria-label="Augmenter"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => setValue((v) => Math.max(0, v - 1))}
        className="w-7 h-5 bg-gold/90 rounded flex items-center justify-center text-night text-xs hover:bg-gold transition-colors"
        aria-label="Diminuer"
      >
        ▼
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex items-center gap-2 bg-night border border-white/10 rounded-lg px-2 py-1.5">
      {align === "left" && arrows}
      <span className="flex-1 text-center font-mono text-sand">{value}</span>
      {align === "right" && arrows}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
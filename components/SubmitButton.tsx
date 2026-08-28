"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  pendingMessage?: string;
}

export default function SubmitButton({
  label,
  pendingMessage = "Enregistrement...",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (pending) {
      const timer = setTimeout(() => setShowMessage(true), 700);
      return () => clearTimeout(timer);
    }
    setShowMessage(false);
  }, [pending]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full rounded-lg overflow-hidden bg-gold disabled:cursor-wait"
    >
      <span
        className="absolute inset-0 bg-green-500 transition-[width] ease-out"
        style={{ width: pending ? "100%" : "0%", transitionDuration: "700ms" }}
      />
      <span className="relative z-10 block px-4 py-3 font-semibold text-night">
        {pending ? (showMessage ? pendingMessage : "Enregistrement...") : label}
      </span>
    </button>
  );
}

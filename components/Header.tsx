"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/matchs", label: "Matchs" },
  { href: "/classements", label: "Classements" },
  { href: "/actualites", label: "Actualités" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-white/10 sticky top-0 z-40 bg-night/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-wide shrink-0">
          <span className="text-sand">TCHAD</span>
          <span className="text-gold">SPORT</span>
          <span className="text-live">LIVE</span>
        </Link>

        <nav className="hidden sm:flex gap-5 text-sm font-medium text-muted">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap hover:text-sand transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu"
          className="sm:hidden text-sand p-2 -mr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm"
        >
          <span className="block w-6 h-0.5 bg-sand mb-1.5" />
          <span className="block w-6 h-0.5 bg-sand mb-1.5" />
          <span className="block w-6 h-0.5 bg-sand" />
        </button>
      </div>

      {open && (
        <nav className="sm:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sand hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
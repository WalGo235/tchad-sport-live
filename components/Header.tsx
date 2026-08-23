"use client";

import { useState } from "react";
import Link from "next/link";

const LOGO_URL =
  "https://iqsrxyuazktyiyhpbzie.supabase.co/storage/v1/object/public/photos/1786046878776.png";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/matchs", label: "📅 Calendrier des Matchs" },
  { href: "/competitions", label: "Compétitions" },
  { href: "/clubs", label: "Clubs" },
  { href: "/joueurs", label: "Joueurs" },
  { href: "/actualites", label: "Actualités" },
  { href: "/communaute", label: "Communauté" },
];

const HISTOIRE_LINKS = [
  { href: "/histoire/chronologie", label: "Chronologie interactive du football" },
  { href: "/histoire/legendes", label: "Légendes du football tchadien" },
  { href: "/histoire/palmares", label: "Palmarès national" },
  { href: "/histoire/stades", label: "Stades historiques" },
];

const SAO_LINKS = [
  { href: "/equipe-nationale/apercu", label: "Aperçu" },
  { href: "/equipe-nationale/informations", label: "Informations" },
  { href: "/equipe-nationale/effectif", label: "Effectif actuel" },
  { href: "/equipe-nationale/staff", label: "Staff technique" },
  { href: "/equipe-nationale/matchs-recents", label: "Matchs récents" },
  { href: "/equipe-nationale/composition", label: "Composition type" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function closeAll() {
    setOpen(false);
    setExpanded(null);
  }

  return (
    <header className="border-b border-white/10 sticky top-0 z-40 bg-night/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeAll}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt="TchadSportLive" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-2xl tracking-wide hidden sm:inline">
            <span className="text-sand">TCHAD</span>
            <span className="text-gold">SPORT</span>
            <span className="text-live">LIVE</span>
          </span>
        </Link>

        <nav className="hidden lg:flex gap-4 text-sm font-medium text-muted items-center">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-sand transition-colors">
              {link.label}
            </Link>
          ))}
          <div className="relative group">
            <button className="hover:text-sand transition-colors">Histoire</button>
            <div className="absolute hidden group-hover:block top-full pt-2 right-0">
              <div className="bg-surface border border-white/10 rounded-lg py-2 w-64">
                {HISTOIRE_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="block px-4 py-2 text-sm hover:text-gold">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="relative group">
            <button className="hover:text-sand transition-colors">Les Sao</button>
            <div className="absolute hidden group-hover:block top-full pt-2 right-0">
              <div className="bg-surface border border-white/10 rounded-lg py-2 w-64">
                {SAO_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="block px-4 py-2 text-sm hover:text-gold">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/admin" className="text-gold hover:underline">
            Mon compte
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu"
          className="lg:hidden text-sand p-2 -mr-2"
        >
          <span className="block w-6 h-0.5 bg-sand mb-1.5" />
          <span className="block w-6 h-0.5 bg-sand mb-1.5" />
          <span className="block w-6 h-0.5 bg-sand" />
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between py-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_URL} alt="TchadSportLive" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-display text-lg tracking-wide">TCHADSPORTLIVE</p>
                <p className="text-xs text-muted">Le sport tchadien en direct</p>
              </div>
            </div>
            <Link href="/admin" onClick={closeAll} className="text-gold text-sm whitespace-nowrap">
              Mon compte
            </Link>
          </div>

          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeAll} className="py-2 text-sand hover:text-gold">
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setExpanded(expanded === "histoire" ? null : "histoire")}
            className="py-2 text-left text-sand flex items-center justify-between"
          >
            Historique du Football Tchadien
            <span>{expanded === "histoire" ? "−" : "+"}</span>
          </button>
          {expanded === "histoire" && (
            <div className="pl-4 flex flex-col gap-1 mb-1">
              {HISTOIRE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={closeAll} className="py-1.5 text-sm text-muted hover:text-gold">
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded(expanded === "sao" ? null : "sao")}
            className="py-2 text-left text-sand flex items-center justify-between"
          >
            Équipe Nationale - Les Sao
            <span>{expanded === "sao" ? "−" : "+"}</span>
          </button>
          {expanded === "sao" && (
            <div className="pl-4 flex flex-col gap-1 mb-1">
              {SAO_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={closeAll} className="py-1.5 text-sm text-muted hover:text-gold">
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/matchs", label: "Matchs" },
  { href: "/classements", label: "Classements" },
  { href: "/actualites", label: "Actualités" },
];

export default function Header() {
  return (
    <header className="border-b border-white/10 sticky top-0 z-40 bg-night/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-wide shrink-0">
          <span className="text-sand">TCHAD</span>
          <span className="text-gold">SPORT</span>
          <span className="text-live">LIVE</span>
        </Link>
        <nav className="flex gap-5 text-sm font-medium text-muted overflow-x-auto">
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
      </div>
    </header>
  );
}
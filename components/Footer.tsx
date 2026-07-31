import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted">
        <p>© {new Date().getFullYear()} TchadSportLive — N&apos;Djamena, Tchad</p>
        <nav className="flex gap-4">
          <Link href="/a-propos" className="hover:text-sand transition-colors">
            À propos
          </Link>
          <Link href="/contact" className="hover:text-sand transition-colors">
            Nous contacter
          </Link>
        </nav>
      </div>
    </footer>
  );
}
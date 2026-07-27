export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} TchadSportLive — N&apos;Djamena, Tchad</p>
        <p>Le sport tchadien, en direct.</p>
      </div>
    </footer>
  );
}
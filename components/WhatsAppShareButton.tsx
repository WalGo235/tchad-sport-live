export default function WhatsAppShareButton({ title, path }: { title: string; path: string }) {
  const url = `https://tchadsportlive.com${path}`;
  const text = encodeURIComponent(`${title} ${url}`);

  return (
    <a
      href={`https://wa.me/?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm px-4 py-2 rounded-lg border border-white/10 text-muted hover:border-gold/50 transition-colors inline-flex items-center gap-2"
    >
      📲 Partager sur WhatsApp
    </a>
  );
}
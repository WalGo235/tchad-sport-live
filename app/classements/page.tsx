import { getStandings } from "@/lib/queries";

export const revalidate = 300;

export default async function ClassementsPage() {
  const standings = await getStandings();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-2">CLASSEMENT</h1>
      <p className="text-muted mb-6">Ligue 1 Tchadienne — Saison 2025-2026</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-muted text-left border-b border-white/10">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Équipe</th>
              <th className="py-2 px-2 text-center">J</th>
              <th className="py-2 px-2 text-center">G</th>
              <th className="py-2 px-2 text-center">N</th>
              <th className="py-2 px-2 text-center">P</th>
              <th className="py-2 px-2 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.rank} className="border-b border-white/5">
                <td className="py-2 pr-2 text-muted">{row.rank}</td>
                <td className="py-2 pr-2 font-body">{row.team}</td>
                <td className="py-2 px-2 text-center">{row.played}</td>
                <td className="py-2 px-2 text-center">{row.wins}</td>
                <td className="py-2 px-2 text-center">{row.losses}</td>
                <td className="py-2 px-2 text-center text-gold font-bold">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
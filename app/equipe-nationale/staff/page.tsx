import type { Metadata } from "next";
import { getNationalTeamStaff } from "@/lib/queries-sao";

export const metadata: Metadata = {
  title: "Staff technique — Les Sao — TchadSportLive",
  description: "Le staff technique de l'équipe nationale du Tchad.",
};

export const revalidate = 300;

export default async function StaffPage() {
  const staff = await getNationalTeamStaff();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-10">STAFF TECHNIQUE</h1>

      {staff.length === 0 ? (
        <p className="text-muted">Staff à venir.</p>
      ) : (
        <div className="space-y-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-surface border border-white/10 rounded-lg p-4 flex items-baseline justify-between"
            >
              <p className="font-semibold">{member.name}</p>
              {member.role && <p className="text-sm text-gold">{member.role}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

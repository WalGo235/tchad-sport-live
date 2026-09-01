import { createClient } from "@/lib/supabase/server";
import { deletePlayer, upsertPlayer } from "./actions";
import PlayerForm from "./PlayerForm";

const NEW_PLAYER_EXAMPLE = {
  name: "Haroun Djerassem",
  dateOfBirth: "2001-07-22",
  birthPlace: "Moundou, Tchad",
  nationality: "Tchadienne",
  heightCm: 182,
  weightKg: 75,
  preferredFoot: "Droit",
  position: "Milieu",
  otherPositions: "Milieu offensif",
  jerseyNumber: 10,
  joinedYear: 2019,
  previousClubs: "Jeunesse Sportive de Koumra (2016–2018)\nCentre de Formation du Sud (2014–2016)",
  matchesPlayed: 28,
  goals: 9,
  assists: 6,
  yellowCards: 3,
  redCards: 0,
  nationalSelections: "Équipe nationale U-20 (2019–2020)\nÉquipe A (depuis 2023)",
  seasonGoal: "Jouer dans un club européen et participer à la CAN",
  inspiration: "Riyad Mahrez",
  email: "haroun.official@espoirmoundou.td",
};

export default async function AdminJoueursPage() {
  const supabase = await createClient();
  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase.from("players").select("*, teams(name)").order("name"),
    supabase.from("teams").select("id, name").order("name"),
  ]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">JOUEURS</h1>

      <div className="bg-surface border border-white/10 rounded-lg p-4 mb-10">
        <h2 className="font-semibold mb-4">Nouveau joueur</h2>
        <PlayerForm
          action={upsertPlayer.bind(null, null)}
          teams={teams ?? []}
          submitLabel="Ajouter"
          defaultValues={NEW_PLAYER_EXAMPLE}
          exampleOnly
        />
      </div>

      <h2 className="font-semibold mb-4">Joueurs existants</h2>
      <div className="space-y-4">
        {players?.map((player) => (
          <details key={player.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                {player.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                {player.jersey_number ? `#${player.jersey_number} ` : ""}
                {player.name}
              </span>
              <span className="text-xs text-muted font-normal">
                {(player.teams as unknown as { name: string } | null)?.name ?? ""}
              </span>
            </summary>
            <div className="mt-4">
              <PlayerForm
                action={upsertPlayer.bind(null, player.id)}
                teams={teams ?? []}
                submitLabel="Enregistrer"
                defaultValues={{
                  name: player.name,
                  teamId: player.team_id,
                  position: player.position,
                  jerseyNumber: player.jersey_number,
                  dateOfBirth: player.date_of_birth,
                  birthPlace: player.birth_place,
                  nationality: player.nationality,
                  heightCm: player.height_cm,
                  weightKg: player.weight_kg,
                  otherPositions: player.other_positions,
                  preferredFoot: player.preferred_foot,
                  address: player.address,
                  phone: player.phone,
                  email: player.email,
                  socialLinks: player.social_links,
                  joinedYear: player.joined_year,
                  previousClubs: player.previous_clubs,
                  level: player.level,
                  majorCompetitions: player.major_competitions,
                  nationalSelections: player.national_selections,
                  matchesPlayed: player.matches_played,
                  goals: player.goals,
                  assists: player.assists,
                  yellowCards: player.yellow_cards,
                  redCards: player.red_cards,
                  minutesPlayed: player.minutes_played,
                  ratingSpeed: player.rating_speed,
                  ratingStamina: player.rating_stamina,
                  ratingTechnique: player.rating_technique,
                  ratingVision: player.rating_vision,
                  ratingShooting: player.rating_shooting,
                  ratingDefense: player.rating_defense,
                  ratingDribbling: player.rating_dribbling,
                  ratingAerial: player.rating_aerial,
                  dream: player.dream,
                  inspiration: player.inspiration,
                  seasonGoal: player.season_goal,
                  highlightVideoUrl: player.highlight_video_url,
                }}
              />
            </div>
            <form action={deletePlayer.bind(null, player.id)} className="mt-3">
              <button type="submit" className="text-live text-sm hover:underline">
                Supprimer
              </button>
            </form>
          </details>
        ))}
      </div>
    </section>
  );
}

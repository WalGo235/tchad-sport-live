import { createClient } from "@/lib/supabase/server";
import { deleteClub, upsertClub } from "./actions";
import ClubForm from "./ClubForm";

const NEW_CLUB_EXAMPLE = {
  name: "Union Sportive de N'Djamena",
  abbreviation: "USN",
  foundedDate: "1984-08-12",
  city: "N'Djamena",
  region: "Chari-Baguirmi",
  country: "Tchad",
  colors: "Bleu, jaune et blanc",
  motto: '"Fierté, Force, Fraternité"',
  postalAddress: "Quartier Moursal, BP 1032, N'Djamena",
  phone: "+235 66 55 44 33",
  email: "contact@usn-td.org",
  website: "www.usn-td.org",
  socialLinks: "Facebook : fb.com/usn.tchad | Twitter : @usn_td | Instagram : @usn_tchad",
  president: "Mahamat Idriss Yaya",
  secretaryGeneral: "Amina Abakar",
  treasurer: "Saley Moussa",
  sportsDirector: "Issa Mahamat",
  headCoach: "Zakaria Bichara",
  assistantCoaches: "Oumar Sanda, Youssouf Daoud",
  medicalStaff: "Dr. Fatimé Mbaye",
  stadiumName: "Stade de la Concorde",
  stadiumCapacity: 12000,
  stadiumAddress: "Avenue Gaoui, N'Djamena",
  trainingCenter: "Centre USN, Quartier Diguel",
  currentDivision: "Première Division (D1 Tchad)",
  honors: "Champion du Tchad (2012, 2015)\nCoupe du Tchad (2014, 2016, 2021)",
  bestHistoricalRanking: "1er place – D1",
  internationalCompetitions: "Ligue des Champions CAF (2013, 2016)\nCoupe de la CAF (2022)",
  licensedMembers: 54,
  sportsSections: "Football masculin, Football U-17, Basketball",
  seasonGoal: "Remporter le championnat national et se qualifier en CAF",
  developmentStrategy: "Renforcer la formation locale et l'infrastructure sportive",
  communityEngagement: "Organisation de tournois scolaires et soutien aux jeunes défavorisés",
  sponsors: "Airtel Tchad\nBrasseries du Logone\nBanque de l'Habitat du Tchad",
};

export default async function AdminClubsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = "";
  let managedTeamId: string | null = null;
  if (user) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("role, managed_team_id")
      .eq("user_id", user.id)
      .single();
    role = adminRow?.role ?? "";
    if (role === "gestionnaire_clubs" && adminRow?.managed_team_id) {
      managedTeamId = adminRow.managed_team_id;
    }
  }

  // Vrai pour tout compte non-super_admin : sa proposition (création ou
  // modification) doit toujours passer par une validation, quel que soit le
  // mécanisme exact (statut "pending" ou table pending_edits).
  const requiresValidation = role !== "super_admin";

  const clubsQuery = supabase.from("teams").select("*").order("name");
  const { data: clubs } = managedTeamId ? await clubsQuery.eq("id", managedTeamId) : await clubsQuery;

  let hasPendingEdit = false;
  if (managedTeamId) {
    const { data: pending } = await supabase
      .from("pending_edits")
      .select("id")
      .eq("entity_type", "club")
      .eq("entity_id", managedTeamId)
      .maybeSingle();
    hasPendingEdit = !!pending;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">CLUBS</h1>

      {!managedTeamId && (
        <div className="bg-surface border border-white/10 rounded-lg p-4 mb-10">
          <h2 className="font-semibold mb-4">Nouveau club</h2>
          <ClubForm
            action={upsertClub.bind(null, null)}
            submitLabel="Ajouter"
            requiresValidation={requiresValidation}
            defaultValues={NEW_CLUB_EXAMPLE}
          />
        </div>
      )}

      <h2 className="font-semibold mb-4">{managedTeamId ? "Ton club" : "Clubs existants"}</h2>
      <div className="space-y-4">
        {clubs?.map((club) => (
          <details key={club.id} open={!!managedTeamId} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                {club.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.logo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                {club.name}
              </span>
              <span className="text-xs text-muted font-normal">{club.city}</span>
            </summary>

            {managedTeamId && hasPendingEdit && (
              <div className="mt-4 text-xs px-3 py-2 rounded-lg bg-gold/10 text-gold border border-gold/20">
                ⏳ Une modification est en attente de validation par un administrateur.
              </div>
            )}

            <div className="mt-4">
              <ClubForm
                action={upsertClub.bind(null, club.id)}
                submitLabel="Enregistrer"
                requiresValidation={requiresValidation}
                defaultValues={{
                  name: club.name,
                  abbreviation: club.abbreviation,
                  foundedDate: club.founded_date,
                  city: club.city,
                  region: club.region,
                  arrondissement: club.arrondissement,
                  country: club.country,
                  colors: club.colors,
                  motto: club.motto,
                  postalAddress: club.postal_address,
                  phone: club.phone,
                  email: club.email,
                  website: club.website,
                  socialLinks: club.social_links,
                  president: club.president,
                  secretaryGeneral: club.secretary_general,
                  treasurer: club.treasurer,
                  sportsDirector: club.sports_director,
                  headCoach: club.head_coach,
                  assistantCoaches: club.assistant_coaches,
                  medicalStaff: club.medical_staff,
                  stadiumName: club.stadium_name,
                  stadiumCapacity: club.stadium_capacity,
                  stadiumAddress: club.stadium_address,
                  trainingCenter: club.training_center,
                  currentDivision: club.current_division,
                  honors: club.honors,
                  bestHistoricalRanking: club.best_historical_ranking,
                  internationalCompetitions: club.international_competitions,
                  licensedMembers: club.licensed_members,
                  sportsSections: club.sports_sections,
                  seasonGoal: club.season_goal,
                  developmentStrategy: club.development_strategy,
                  communityEngagement: club.community_engagement,
                  sponsors: club.sponsors,
                }}
              />
            </div>
            <form action={deleteClub.bind(null, club.id)} className="mt-3">
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

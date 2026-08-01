const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
const FEET = ["Droit", "Gauche", "Les deux"];
const LEVELS = ["Amateur", "Semi-pro", "Professionnel"];
const RATING_FIELDS = [
  { name: "ratingSpeed", label: "Vitesse" },
  { name: "ratingStamina", label: "Endurance" },
  { name: "ratingTechnique", label: "Technique" },
  { name: "ratingVision", label: "Vision de jeu" },
  { name: "ratingShooting", label: "Tirs" },
  { name: "ratingDefense", label: "Défense" },
  { name: "ratingDribbling", label: "Dribbles" },
  { name: "ratingAerial", label: "Jeu aérien" },
];

interface PlayerFormProps {
  action: (formData: FormData) => Promise<void>;
  teams: { id: string; name: string }[];
  submitLabel: string;
  defaultValues?: Record<string, string | number | null | undefined>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted";

export default function PlayerForm({ action, teams, defaultValues: d, submitLabel }: PlayerFormProps) {
  const v = (key: string) => (d?.[key] ?? "") as string | number;

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations générales</h3>
        <Field label="Nom complet">
          <input type="text" name="name" required defaultValue={v("name")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date de naissance">
            <input type="date" name="dateOfBirth" defaultValue={v("dateOfBirth")} className={inputClass} />
          </Field>
          <Field label="Lieu de naissance">
            <input type="text" name="birthPlace" defaultValue={v("birthPlace")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nationalité">
            <input type="text" name="nationality" defaultValue={v("nationality")} className={inputClass} />
          </Field>
          <Field label="Pied fort">
            <select name="preferredFoot" defaultValue={v("preferredFoot")} className={inputClass}>
              <option value="">—</option>
              {FEET.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Taille (cm)">
            <input type="number" name="heightCm" defaultValue={v("heightCm")} className={inputClass} />
          </Field>
          <Field label="Poids (kg)">
            <input type="number" step="0.1" name="weightKg" defaultValue={v("weightKg")} className={inputClass} />
          </Field>
        </div>
        <Field label="Poste préféré">
          <select name="position" defaultValue={v("position")} className={inputClass}>
            <option value="">—</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Autres postes possibles">
          <input
            type="text"
            name="otherPositions"
            placeholder="ex: Ailier, Milieu défensif"
            defaultValue={v("otherPositions")}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Coordonnées</h3>
        <Field label="Adresse">
          <input type="text" name="address" defaultValue={v("address")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone">
            <input type="text" name="phone" defaultValue={v("phone")} className={inputClass} />
          </Field>
          <Field label="E-mail">
            <input type="email" name="email" defaultValue={v("email")} className={inputClass} />
          </Field>
        </div>
        <Field label="Réseaux sociaux">
          <input type="text" name="socialLinks" defaultValue={v("socialLinks")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Carrière sportive</h3>
        <Field label="Club actuel">
          <select name="teamId" defaultValue={v("teamId")} className={inputClass}>
            <option value="">— Club —</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Numéro de maillot">
            <input type="number" name="jerseyNumber" defaultValue={v("jerseyNumber")} className={inputClass} />
          </Field>
          <Field label="Année de début au club">
            <input type="number" name="joinedYear" defaultValue={v("joinedYear")} className={inputClass} />
          </Field>
        </div>
        <Field label="Clubs précédents (avec années)">
          <textarea name="previousClubs" rows={2} defaultValue={v("previousClubs")} className={inputClass} />
        </Field>
        <Field label="Niveau actuel">
          <select name="level" defaultValue={v("level")} className={inputClass}>
            <option value="">—</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Compétitions majeures disputées">
          <textarea name="majorCompetitions" rows={2} defaultValue={v("majorCompetitions")} className={inputClass} />
        </Field>
        <Field label="Sélections nationales">
          <textarea name="nationalSelections" rows={2} defaultValue={v("nationalSelections")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Statistiques (saison en cours)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Matchs joués">
            <input type="number" name="matchesPlayed" defaultValue={v("matchesPlayed")} className={inputClass} />
          </Field>
          <Field label="Minutes jouées">
            <input type="number" name="minutesPlayed" defaultValue={v("minutesPlayed")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Buts marqués">
            <input type="number" name="goals" defaultValue={v("goals")} className={inputClass} />
          </Field>
          <Field label="Passes décisives">
            <input type="number" name="assists" defaultValue={v("assists")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cartons jaunes">
            <input type="number" name="yellowCards" defaultValue={v("yellowCards")} className={inputClass} />
          </Field>
          <Field label="Cartons rouges">
            <input type="number" name="redCards" defaultValue={v("redCards")} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Compétences techniques (1 à 10)</h3>
        <div className="grid grid-cols-2 gap-3">
          {RATING_FIELDS.map((r) => (
            <Field key={r.name} label={r.label}>
              <input type="number" min={1} max={10} name={r.name} defaultValue={v(r.name)} className={inputClass} />
            </Field>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Objectifs & Motivations</h3>
        <Field label="Rêve en tant que joueur">
          <textarea name="dream" rows={2} defaultValue={v("dream")} className={inputClass} />
        </Field>
        <Field label="Joueur qui inspire le plus">
          <input type="text" name="inspiration" defaultValue={v("inspiration")} className={inputClass} />
        </Field>
        <Field label="Objectif cette saison">
          <textarea name="seasonGoal" rows={2} defaultValue={v("seasonGoal")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Documents</h3>
        <Field label="Photo (portrait)">
          <input
            type="file"
            name="photoFile"
            accept="image/*"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
          />
        </Field>
        <Field label="Licence / carte d'identité sportive">
          <input
            type="file"
            name="licenseFile"
            accept="image/*,application/pdf"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
          />
        </Field>
        <Field label="Lien vidéo highlight (YouTube, etc.)">
          <input
            type="text"
            name="highlightVideoUrl"
            placeholder="https://..."
            defaultValue={v("highlightVideoUrl")}
            className={inputClass}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-3 hover:opacity-90 transition-opacity"
      >
        {submitLabel}
      </button>
    </form>
  );
}

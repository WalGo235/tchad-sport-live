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
  exampleOnly?: boolean;
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

export default function PlayerForm({ action, teams, defaultValues: d, submitLabel, exampleOnly }: PlayerFormProps) {
  const v = (key: string) => (d?.[key] ?? "") as string | number;

  // En mode exemple : texte grisé (placeholder), jamais envoyé tant que l'admin
  // ne tape rien lui-même. Sinon (édition d'une fiche réelle) : valeur
  // pré-remplie normale, modifiable. Les menus déroulants n'ont pas d'équivalent
  // "placeholder" natif : ils restent vides, avec l'exemple indiqué en dessous.
  const fp = (key: string) => (exampleOnly ? { placeholder: String(v(key) || "") } : { defaultValue: v(key) });
  const selectValue = (key: string) => (exampleOnly ? "" : v(key));
  const selectHint = (key: string) =>
    exampleOnly && v(key) ? <p className="text-xs text-muted mt-1">Exemple : {v(key)}</p> : null;

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations générales</h3>
        <Field label="Nom complet">
          <input type="text" name="name" required {...fp("name")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date de naissance">
            <input type="date" name="dateOfBirth" {...fp("dateOfBirth")} className={inputClass} />
            {exampleOnly && v("dateOfBirth") && (
              <p className="text-xs text-muted mt-1">Exemple : {v("dateOfBirth")}</p>
            )}
          </Field>
          <Field label="Lieu de naissance">
            <input type="text" name="birthPlace" {...fp("birthPlace")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nationalité">
            <input type="text" name="nationality" {...fp("nationality")} className={inputClass} />
          </Field>
          <Field label="Pied fort">
            <select name="preferredFoot" defaultValue={selectValue("preferredFoot")} className={inputClass}>
              <option value="">—</option>
              {FEET.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {selectHint("preferredFoot")}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Taille (cm)">
            <input type="number" name="heightCm" {...fp("heightCm")} className={inputClass} />
          </Field>
          <Field label="Poids (kg)">
            <input type="number" step="0.1" name="weightKg" {...fp("weightKg")} className={inputClass} />
          </Field>
        </div>
        <Field label="Poste préféré">
          <select name="position" defaultValue={selectValue("position")} className={inputClass}>
            <option value="">—</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {selectHint("position")}
        </Field>
        <Field label="Autres postes possibles">
          <input
            type="text"
            name="otherPositions"
            placeholder={exampleOnly ? String(v("otherPositions") || "") : "ex: Ailier, Milieu défensif"}
            {...(exampleOnly ? {} : { defaultValue: v("otherPositions") })}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Coordonnées</h3>
        <Field label="Adresse">
          <input type="text" name="address" {...fp("address")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone">
            <input type="text" name="phone" {...fp("phone")} className={inputClass} />
          </Field>
          <Field label="E-mail">
            <input type="email" name="email" {...fp("email")} className={inputClass} />
          </Field>
        </div>
        <Field label="Réseaux sociaux">
          <input type="text" name="socialLinks" {...fp("socialLinks")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Carrière sportive</h3>
        <Field label="Club actuel">
          <select name="teamId" defaultValue={selectValue("teamId")} className={inputClass}>
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
            <input type="number" name="jerseyNumber" {...fp("jerseyNumber")} className={inputClass} />
          </Field>
          <Field label="Année de début au club">
            <input type="number" name="joinedYear" {...fp("joinedYear")} className={inputClass} />
          </Field>
        </div>
        <Field label="Clubs précédents (avec années)">
          <textarea name="previousClubs" rows={2} {...fp("previousClubs")} className={inputClass} />
        </Field>
        <Field label="Niveau actuel">
          <select name="level" defaultValue={selectValue("level")} className={inputClass}>
            <option value="">—</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {selectHint("level")}
        </Field>
        <Field label="Compétitions majeures disputées">
          <textarea name="majorCompetitions" rows={2} {...fp("majorCompetitions")} className={inputClass} />
        </Field>
        <Field label="Sélections nationales">
          <textarea name="nationalSelections" rows={2} {...fp("nationalSelections")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Statistiques (saison en cours)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Matchs joués">
            <input type="number" name="matchesPlayed" {...fp("matchesPlayed")} className={inputClass} />
          </Field>
          <Field label="Minutes jouées">
            <input type="number" name="minutesPlayed" {...fp("minutesPlayed")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Buts marqués">
            <input type="number" name="goals" {...fp("goals")} className={inputClass} />
          </Field>
          <Field label="Passes décisives">
            <input type="number" name="assists" {...fp("assists")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cartons jaunes">
            <input type="number" name="yellowCards" {...fp("yellowCards")} className={inputClass} />
          </Field>
          <Field label="Cartons rouges">
            <input type="number" name="redCards" {...fp("redCards")} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Compétences techniques (1 à 10)</h3>
        <div className="grid grid-cols-2 gap-3">
          {RATING_FIELDS.map((r) => (
            <Field key={r.name} label={r.label}>
              <input type="number" min={1} max={10} name={r.name} {...fp(r.name)} className={inputClass} />
            </Field>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Objectifs & Motivations</h3>
        <Field label="Rêve en tant que joueur">
          <textarea name="dream" rows={2} {...fp("dream")} className={inputClass} />
        </Field>
        <Field label="Joueur qui inspire le plus">
          <input type="text" name="inspiration" {...fp("inspiration")} className={inputClass} />
        </Field>
        <Field label="Objectif cette saison">
          <textarea name="seasonGoal" rows={2} {...fp("seasonGoal")} className={inputClass} />
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
            placeholder={exampleOnly ? String(v("highlightVideoUrl") || "") : "https://..."}
            {...(exampleOnly ? {} : { defaultValue: v("highlightVideoUrl") })}
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

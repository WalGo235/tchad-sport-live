interface ClubFormProps {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  defaultValues?: Record<string, string | number | null | undefined>;
}

const PROVINCES_TCHAD = [
  "Batha",
  "Barh El Gazel",
  "Borkou",
  "Chari-Baguirmi",
  "Ennedi-Est",
  "Ennedi-Ouest",
  "Guéra",
  "Hadjer-Lamis",
  "Kanem",
  "Lac",
  "Logone Occidental",
  "Logone Oriental",
  "Mandoul",
  "Mayo-Kebbi Est",
  "Mayo-Kebbi Ouest",
  "Moyen-Chari",
  "N'Djamena",
  "Ouaddaï",
  "Salamat",
  "Sila",
  "Tandjilé",
  "Tibesti",
  "Wadi Fira",
];

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

export default function ClubForm({ action, defaultValues: d, submitLabel }: ClubFormProps) {
  const v = (key: string) => (d?.[key] ?? "") as string | number;

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations générales</h3>
        <Field label="Nom complet du club">
          <input type="text" name="name" required defaultValue={v("name")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sigle / abréviation">
            <input type="text" name="abbreviation" defaultValue={v("abbreviation")} className={inputClass} />
          </Field>
          <Field label="Date de création">
            <input type="date" name="foundedDate" defaultValue={v("foundedDate")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville / Commune">
            <input type="text" name="city" defaultValue={v("city")} className={inputClass} />
          </Field>
          <Field label="Région">
            <select name="region" defaultValue={v("region")} className={inputClass}>
              <option value="">Sélectionner...</option>
              {PROVINCES_TCHAD.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pays">
            <input type="text" name="country" defaultValue={v("country") || "Tchad"} className={inputClass} />
          </Field>
          <Field label="Couleurs officielles">
            <input type="text" name="colors" defaultValue={v("colors")} className={inputClass} />
          </Field>
        </div>
        <Field label="Devise ou slogan">
          <input type="text" name="motto" defaultValue={v("motto")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Coordonnées officielles</h3>
        <Field label="Adresse postale">
          <input type="text" name="postalAddress" defaultValue={v("postalAddress")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone">
            <input type="text" name="phone" defaultValue={v("phone")} className={inputClass} />
          </Field>
          <Field label="E-mail">
            <input type="email" name="email" defaultValue={v("email")} className={inputClass} />
          </Field>
        </div>
        <Field label="Site web">
          <input type="text" name="website" defaultValue={v("website")} className={inputClass} />
        </Field>
        <Field label="Réseaux sociaux">
          <input type="text" name="socialLinks" defaultValue={v("socialLinks")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations administratives</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Président">
            <input type="text" name="president" defaultValue={v("president")} className={inputClass} />
          </Field>
          <Field label="Secrétaire général">
            <input type="text" name="secretaryGeneral" defaultValue={v("secretaryGeneral")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trésorier">
            <input type="text" name="treasurer" defaultValue={v("treasurer")} className={inputClass} />
          </Field>
          <Field label="Directeur sportif">
            <input type="text" name="sportsDirector" defaultValue={v("sportsDirector")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Entraîneur principal">
            <input type="text" name="headCoach" defaultValue={v("headCoach")} className={inputClass} />
          </Field>
          <Field label="Entraîneur(s) adjoint(s)">
            <input type="text" name="assistantCoaches" defaultValue={v("assistantCoaches")} className={inputClass} />
          </Field>
        </div>
        <Field label="Médecin / Kinésithérapeute">
          <input type="text" name="medicalStaff" defaultValue={v("medicalStaff")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Infrastructure</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom du stade">
            <input type="text" name="stadiumName" defaultValue={v("stadiumName")} className={inputClass} />
          </Field>
          <Field label="Capacité du stade">
            <input type="number" name="stadiumCapacity" defaultValue={v("stadiumCapacity")} className={inputClass} />
          </Field>
        </div>
        <Field label="Adresse du stade">
          <input type="text" name="stadiumAddress" defaultValue={v("stadiumAddress")} className={inputClass} />
        </Field>
        <Field label="Centre d'entraînement (nom + adresse)">
          <input type="text" name="trainingCenter" defaultValue={v("trainingCenter")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations sportives</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Division actuelle">
            <input type="text" name="currentDivision" defaultValue={v("currentDivision")} className={inputClass} />
          </Field>
          <Field label="Nombre de licenciés">
            <input type="number" name="licensedMembers" defaultValue={v("licensedMembers")} className={inputClass} />
          </Field>
        </div>
        <Field label="Palmarès (championnats, coupes, tournois)">
          <textarea name="honors" rows={2} defaultValue={v("honors")} className={inputClass} />
        </Field>
        <Field label="Meilleur classement historique">
          <input type="text" name="bestHistoricalRanking" defaultValue={v("bestHistoricalRanking")} className={inputClass} />
        </Field>
        <Field label="Compétitions internationales disputées">
          <textarea name="internationalCompetitions" rows={2} defaultValue={v("internationalCompetitions")} className={inputClass} />
        </Field>
        <Field label="Sections sportives (football, basketball, etc.)">
          <input type="text" name="sportsSections" defaultValue={v("sportsSections")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Vision & Objectifs</h3>
        <Field label="Objectif de la saison">
          <textarea name="seasonGoal" rows={2} defaultValue={v("seasonGoal")} className={inputClass} />
        </Field>
        <Field label="Stratégie de développement">
          <textarea name="developmentStrategy" rows={2} defaultValue={v("developmentStrategy")} className={inputClass} />
        </Field>
        <Field label="Engagement communautaire">
          <textarea name="communityEngagement" rows={2} defaultValue={v("communityEngagement")} className={inputClass} />
        </Field>
        <Field label="Partenaires ou sponsors actuels">
          <textarea name="sponsors" rows={2} defaultValue={v("sponsors")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Documents</h3>
        <Field label="Logo officiel (PNG / SVG)">
          <input
            type="file"
            name="logoFile"
            accept="image/*"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
          />
        </Field>
        <Field label="Photo du stade">
          <input
            type="file"
            name="stadiumPhotoFile"
            accept="image/*"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
          />
        </Field>
        <Field label="Photo de l'équipe">
          <input
            type="file"
            name="teamPhotoFile"
            accept="image/*"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
          />
        </Field>
        <Field label="Enregistrement officiel (fédération, ligue...)">
          <input
            type="file"
            name="registrationFile"
            accept="image/*,application/pdf"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
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

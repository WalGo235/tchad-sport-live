import SubmitButton from "@/components/SubmitButton";
import CityRegionFields from "./CityRegionFields";

interface ClubFormProps {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  defaultValues?: Record<string, string | number | null | undefined>;
  requiresValidation?: boolean;
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

export default function ClubForm({
  action,
  defaultValues: d,
  submitLabel,
  requiresValidation,
  exampleOnly,
}: ClubFormProps) {
  const v = (key: string) => (d?.[key] ?? "") as string | number;

  // En mode exemple : le texte s'affiche en grisé (placeholder) et n'est jamais
  // envoyé tant que l'admin ne tape rien lui-même. Sinon (édition d'une fiche
  // réelle) : valeur pré-remplie normale, modifiable.
  const fp = (key: string) => (exampleOnly ? { placeholder: String(v(key) || "") } : { defaultValue: v(key) });

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations générales</h3>
        <Field label="Nom complet du club">
          <input type="text" name="name" required {...fp("name")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sigle / abréviation">
            <input type="text" name="abbreviation" {...fp("abbreviation")} className={inputClass} />
          </Field>
          <Field label="Date de création">
            <input type="date" name="foundedDate" {...fp("foundedDate")} className={inputClass} />
            {exampleOnly && v("foundedDate") && (
              <p className="text-xs text-muted mt-1">Exemple : {v("foundedDate")}</p>
            )}
          </Field>
        </div>
        <CityRegionFields
          cityDefault={v("city") as string}
          regionDefault={v("region") as string}
          arrondissementDefault={v("arrondissement") as string}
          exampleOnly={exampleOnly}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pays">
            <input type="text" name="country" {...fp("country")} className={inputClass} />
          </Field>
          <Field label="Couleurs officielles">
            <input type="text" name="colors" {...fp("colors")} className={inputClass} />
          </Field>
        </div>
        <Field label="Devise ou slogan">
          <input type="text" name="motto" {...fp("motto")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Coordonnées officielles</h3>
        <Field label="Adresse postale">
          <input type="text" name="postalAddress" {...fp("postalAddress")} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone">
            <input type="text" name="phone" {...fp("phone")} className={inputClass} />
          </Field>
          <Field label="E-mail">
            <input type="email" name="email" {...fp("email")} className={inputClass} />
          </Field>
        </div>
        <Field label="Site web">
          <input type="text" name="website" {...fp("website")} className={inputClass} />
        </Field>
        <Field label="Réseaux sociaux">
          <input type="text" name="socialLinks" {...fp("socialLinks")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations administratives</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Président">
            <input type="text" name="president" {...fp("president")} className={inputClass} />
          </Field>
          <Field label="Secrétaire général">
            <input type="text" name="secretaryGeneral" {...fp("secretaryGeneral")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trésorier">
            <input type="text" name="treasurer" {...fp("treasurer")} className={inputClass} />
          </Field>
          <Field label="Directeur sportif">
            <input type="text" name="sportsDirector" {...fp("sportsDirector")} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Entraîneur principal">
            <input type="text" name="headCoach" {...fp("headCoach")} className={inputClass} />
          </Field>
          <Field label="Entraîneur(s) adjoint(s)">
            <input type="text" name="assistantCoaches" {...fp("assistantCoaches")} className={inputClass} />
          </Field>
        </div>
        <Field label="Médecin / Kinésithérapeute">
          <input type="text" name="medicalStaff" {...fp("medicalStaff")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Infrastructure</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom du stade">
            <input type="text" name="stadiumName" {...fp("stadiumName")} className={inputClass} />
          </Field>
          <Field label="Capacité du stade">
            <input type="number" name="stadiumCapacity" {...fp("stadiumCapacity")} className={inputClass} />
          </Field>
        </div>
        <Field label="Adresse du stade">
          <input type="text" name="stadiumAddress" {...fp("stadiumAddress")} className={inputClass} />
        </Field>
        <Field label="Centre d'entraînement (nom + adresse)">
          <input type="text" name="trainingCenter" {...fp("trainingCenter")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Informations sportives</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Division actuelle">
            <input type="text" name="currentDivision" {...fp("currentDivision")} className={inputClass} />
          </Field>
          <Field label="Nombre de licenciés">
            <input type="number" name="licensedMembers" {...fp("licensedMembers")} className={inputClass} />
          </Field>
        </div>
        <Field label="Palmarès (championnats, coupes, tournois)">
          <textarea name="honors" rows={2} {...fp("honors")} className={inputClass} />
        </Field>
        <Field label="Meilleur classement historique">
          <input type="text" name="bestHistoricalRanking" {...fp("bestHistoricalRanking")} className={inputClass} />
        </Field>
        <Field label="Compétitions internationales disputées">
          <textarea name="internationalCompetitions" rows={2} {...fp("internationalCompetitions")} className={inputClass} />
        </Field>
        <Field label="Sections sportives (football, basketball, etc.)">
          <input type="text" name="sportsSections" {...fp("sportsSections")} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gold">Vision & Objectifs</h3>
        <Field label="Objectif de la saison">
          <textarea name="seasonGoal" rows={2} {...fp("seasonGoal")} className={inputClass} />
        </Field>
        <Field label="Stratégie de développement">
          <textarea name="developmentStrategy" rows={2} {...fp("developmentStrategy")} className={inputClass} />
        </Field>
        <Field label="Engagement communautaire">
          <textarea name="communityEngagement" rows={2} {...fp("communityEngagement")} className={inputClass} />
        </Field>
        <Field label="Partenaires ou sponsors actuels">
          <textarea name="sponsors" rows={2} {...fp("sponsors")} className={inputClass} />
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

      <SubmitButton
        label={submitLabel}
        pendingMessage={requiresValidation ? "En attente de validation par un administrateur..." : undefined}
      />
    </form>
  );
}

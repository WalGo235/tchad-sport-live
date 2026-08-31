"use client";

import { useState } from "react";

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

const ARRONDISSEMENTS_NDJAMENA = [
  "1er arrondissement",
  "2e arrondissement",
  "3e arrondissement",
  "4e arrondissement",
  "5e arrondissement",
  "6e arrondissement",
  "7e arrondissement",
  "8e arrondissement",
  "9e arrondissement",
  "10e arrondissement",
];

const inputClass =
  "w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      {children}
    </div>
  );
}

interface CityRegionFieldsProps {
  cityDefault?: string;
  regionDefault?: string;
  arrondissementDefault?: string;
}

export default function CityRegionFields({
  cityDefault,
  regionDefault,
  arrondissementDefault,
}: CityRegionFieldsProps) {
  const [region, setRegion] = useState(regionDefault ?? "");

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ville / Commune">
          <input type="text" name="city" defaultValue={cityDefault} className={inputClass} />
        </Field>
        <Field label="Région">
          <select
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={inputClass}
          >
            <option value="">Sélectionner...</option>
            {PROVINCES_TCHAD.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {region === "N'Djamena" && (
        <Field label="Arrondissement">
          <select name="arrondissement" defaultValue={arrondissementDefault ?? ""} className={inputClass}>
            <option value="">Sélectionner...</option>
            {ARRONDISSEMENTS_NDJAMENA.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
      )}
    </>
  );
}

import { createClient } from "./supabase/server";

export interface HistoryEvent {
  id: string;
  year: string;
  title: string;
  description: string | null;
}

export async function getHistoryEvents(): Promise<HistoryEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("history_events")
    .select("id, year, title, description")
    .order("display_order");
  if (error || !data) return [];
  return data;
}

export interface Legend {
  id: string;
  name: string;
  era: string | null;
  position: string | null;
  bio: string | null;
  photoUrl: string | null;
}

export async function getLegends(): Promise<Legend[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legends")
    .select("id, name, era, position, bio, photo_url")
    .order("name");
  if (error || !data) return [];
  return data.map((l) => ({
    id: l.id,
    name: l.name,
    era: l.era,
    position: l.position,
    bio: l.bio,
    photoUrl: l.photo_url,
  }));
}

export interface NationalHonor {
  id: string;
  title: string;
  year: string | null;
  description: string | null;
}

export async function getNationalHonors(): Promise<NationalHonor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("national_honors")
    .select("id, title, year, description")
    .order("display_order");
  if (error || !data) return [];
  return data;
}

export interface HistoricStadium {
  id: string;
  name: string;
  city: string | null;
  yearBuilt: string | null;
  capacity: number | null;
  description: string | null;
  photoUrl: string | null;
}

export async function getHistoricStadiums(): Promise<HistoricStadium[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("historic_stadiums")
    .select("id, name, city, year_built, capacity, description, photo_url")
    .order("name");
  if (error || !data) return [];
  return data.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    yearBuilt: s.year_built,
    capacity: s.capacity,
    description: s.description,
    photoUrl: s.photo_url,
  }));
}

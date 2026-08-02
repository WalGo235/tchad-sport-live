import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://tchadsportlive.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: matches }, { data: competitions }, { data: articles }, { data: clubs }, { data: players }] =
    await Promise.all([
      supabase.from("matches").select("id"),
      supabase.from("competitions").select("id"),
      supabase.from("articles").select("slug"),
      supabase.from("teams").select("id"),
      supabase.from("players").select("id"),
    ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE_URL}/matchs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/competitions`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/actualites`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/a-propos`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const matchPages: MetadataRoute.Sitemap = (matches ?? []).map((m) => ({
    url: `${BASE_URL}/matchs/${m.id}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const competitionPages: MetadataRoute.Sitemap = (competitions ?? []).map((c) => ({
    url: `${BASE_URL}/competitions/${c.id}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/actualites/${a.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const clubPages: MetadataRoute.Sitemap = (clubs ?? []).map((c) => ({
    url: `${BASE_URL}/clubs/${c.id}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const playerPages: MetadataRoute.Sitemap = (players ?? []).map((p) => ({
    url: `${BASE_URL}/joueurs/${p.id}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticPages, ...matchPages, ...competitionPages, ...articlePages, ...clubPages, ...playerPages];
}

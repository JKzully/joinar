import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://getpicked.co";

export default async function sitemap() {
  const staticRoutes = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/signup`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];

  let playerRoutes = [];
  try {
    const supabase = await createClient();
    const { data: players } = await supabase
      .from("player_ads")
      .select("profile_id, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(5000);

    playerRoutes = (players || []).map((player) => ({
      url: `${BASE_URL}/players/${player.profile_id}`,
      lastModified: player.updated_at,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // Sitemap should still render static routes if the DB is unreachable
  }

  return [...staticRoutes, ...playerRoutes];
}

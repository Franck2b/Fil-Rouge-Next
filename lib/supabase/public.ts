import { createClient } from "@supabase/supabase-js";

/**
 * Client anonyme, sans cookie. Réservé aux données publiques du catalogue :
 * comme il ne dépend d'aucune requête entrante, il peut être appelé depuis une
 * fonction `"use cache"`, ce qui serait impossible avec le client à cookies.
 */
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase pour les Server Components, Server Actions et Route Handlers.
 * La session vit dans les cookies : chaque requête au Postgres part donc avec le
 * JWT du visiteur, et les politiques RLS s'appliquent réellement côté serveur.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Un Server Component ne peut pas écrire de cookie : le rafraîchissement
            // de session est assuré par proxy.ts, on peut ignorer sans risque.
          }
        },
      },
    },
  );
}

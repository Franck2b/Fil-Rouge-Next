import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * proxy.ts (ex-middleware) — deux responsabilités, et deux seulement :
 *
 * 1. rafraîchir le cookie de session Supabase avant que la requête n'atteigne
 *    un Server Component, qui lui ne peut pas écrire de cookie ;
 * 2. rediriger tôt les visiteurs anonymes pour éviter un aller-retour inutile.
 *
 * Ce n'est PAS la barrière de sécurité : l'autorisation réelle est refaite dans
 * chaque layout protégé (lib/auth.ts) et, en dernier ressort, par les politiques
 * RLS de Postgres.
 */
const PROTECTED_PREFIXES = ["/tableau-de-bord", "/reservations", "/habilitations", "/parametres", "/reserver", "/onboarding", "/admin"];

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user && isProtected) {
    const login = request.nextUrl.clone();
    login.pathname = "/connexion";
    login.search = `?suite=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(login);
  }

  if (user && (pathname === "/connexion" || pathname === "/inscription")) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/tableau-de-bord";
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|img/|favicon.ico|robots.txt|sitemap.xml|.*\\.png$).*)"],
};

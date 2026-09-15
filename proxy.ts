import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  DEFAULT_LOCALE,
  hasLocale,
  LOCALE_COOKIE,
  localizePath,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * proxy.ts (ex-middleware) — trois responsabilités :
 *
 * 1. garantir que chaque URL porte une langue (/fr ou /en) ;
 * 2. rafraîchir le cookie de session Supabase avant que la requête n'atteigne
 *    un Server Component, qui lui ne peut pas écrire de cookie ;
 * 3. rediriger tôt les visiteurs anonymes pour éviter un aller-retour inutile.
 *
 * Ce n'est PAS la barrière de sécurité : l'autorisation réelle est refaite dans
 * chaque layout protégé (lib/auth.ts) et, en dernier ressort, par les politiques
 * RLS de Postgres.
 */
const PROTECTED_PREFIXES = ["/tableau-de-bord", "/reservations", "/habilitations", "/parametres", "/reserver", "/onboarding", "/admin"];
const GUEST_ONLY_PATHS = ["/connexion", "/inscription"];

/** Langue d'un visiteur arrivant sans préfixe : choix mémorisé, sinon navigateur, sinon français. */
function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(saved)) return saved;

  const browser = request.headers
    .get("accept-language")
    ?.split(",")[0]
    ?.trim()
    .slice(0, 2)
    .toLowerCase();

  return hasLocale(browser) ? browser : DEFAULT_LOCALE;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (!hasLocale(segment)) {
    const localized = request.nextUrl.clone();
    localized.pathname = localizePath(preferredLocale(request), pathname);
    return NextResponse.redirect(localized);
  }

  const locale = segment;
  const path = stripLocale(pathname);

  // Les Server Actions et les gardes d'accès ne peuvent pas lire le segment
  // [lang] : on leur expose la langue par cookie, dès cette requête.
  request.cookies.set(LOCALE_COOKIE, locale);
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

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (!user && isProtected) {
    const login = request.nextUrl.clone();
    login.pathname = localizePath(locale, "/connexion");
    login.search = `?suite=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }

  if (user && GUEST_ONLY_PATHS.includes(path)) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = localizePath(locale, "/tableau-de-bord");
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|img/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};

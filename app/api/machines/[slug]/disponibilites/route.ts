import { NextResponse, type NextRequest } from "next/server";
import { getMachineBySlug } from "@/lib/data/catalog";
import { getMachineBusySlots } from "@/lib/data/account";
import { computeSlots, MAX_DURATION } from "@/lib/booking";

/**
 * Route Handler — pourquoi ici et pas un Server Component ?
 *
 * Les disponibilités d'une machine sont la seule donnée que des consommateurs
 * extérieurs à Next.js devront lire : la future application React Native
 * affichera les créneaux libres autour de l'utilisateur avant même qu'il ne se
 * connecte. Il faut donc un contrat JSON stable, versionnable et cacheable —
 * ce qu'un Server Component, qui ne rend que du HTML, ne fournit pas.
 *
 * La réponse ne contient que des bornes horaires et un état : aucune donnée
 * personnelle ne transite, l'identité de l'occupant n'est jamais exposée.
 *
 * GET /api/machines/:slug/disponibilites?jour=YYYY-MM-DD&duree=1
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const machine = await getMachineBySlug(slug);

  if (!machine || machine.status === "retired") {
    return NextResponse.json({ error: "Machine introuvable" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const day = searchParams.get("jour") ?? new Date().toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json({ error: "Paramètre `jour` invalide (YYYY-MM-DD)" }, { status: 400 });
  }

  const duration = Math.min(Math.max(Number(searchParams.get("duree")) || 1, 1), MAX_DURATION);

  if (machine.status !== "available") {
    return NextResponse.json({
      machine: { slug: machine.slug, name: machine.name, status: machine.status },
      day,
      duration,
      slots: [],
    });
  }

  const busy = await getMachineBusySlots(machine.id, day);
  const slots = computeSlots(day, busy, duration);

  return NextResponse.json(
    {
      machine: {
        slug: machine.slug,
        name: machine.name,
        status: machine.status,
        hourlyCredits: machine.hourly_credits,
        workshop: machine.workshop
          ? {
              slug: machine.workshop.slug,
              name: machine.workshop.name,
              city: machine.workshop.city,
            }
          : null,
      },
      day,
      duration,
      cost: duration * machine.hourly_credits,
      slots,
    },
    {
      // Court : les disponibilités changent à chaque réservation.
      headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" },
    },
  );
}

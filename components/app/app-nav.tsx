"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Client Component : seul usePathname permet de marquer la route courante. */
const LINKS = [
  { href: "/tableau-de-bord", label: "Tableau de bord" },
  { href: "/reservations", label: "Mes réservations" },
  { href: "/habilitations", label: "Mes habilitations" },
  { href: "/parametres", label: "Paramètres" },
];

export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation de l'espace membre">
      <ul className="space-y-px">
        {LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block border-l-2 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-rust bg-paper font-medium text-ink"
                    : "border-transparent text-ink-soft hover:border-line hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {isAdmin ? (
        <div className="mt-8 border-t border-line pt-6">
          <p className="label-tech px-4 text-kraft">Back-office</p>
          <Link
            href="/admin"
            className={`mt-2 block border-l-2 px-4 py-2.5 text-sm transition-colors ${
              pathname.startsWith("/admin")
                ? "border-rust bg-paper font-medium text-ink"
                : "border-transparent text-ink-soft hover:border-line hover:text-ink"
            }`}
          >
            Administration
          </Link>
        </div>
      ) : null}
    </nav>
  );
}

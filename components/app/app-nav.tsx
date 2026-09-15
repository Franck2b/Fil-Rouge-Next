"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/ui/link";
import { stripLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Client Component : seul usePathname permet de marquer la route courante. */
export function AppNav({ isAdmin, t }: { isAdmin: boolean; t: Dictionary["app"]["nav"] }) {
  const pathname = stripLocale(usePathname());

  const links = [
    { href: "/tableau-de-bord", label: t.dashboard },
    { href: "/reservations", label: t.bookings },
    { href: "/habilitations", label: t.certifications },
    { href: "/parametres", label: t.settings },
  ];

  return (
    <nav aria-label={t.label}>
      <ul className="space-y-px">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

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
          <p className="label-tech px-4 text-kraft">{t.backOffice}</p>
          <Link
            href="/admin"
            className={`mt-2 block border-l-2 px-4 py-2.5 text-sm transition-colors ${
              pathname.startsWith("/admin")
                ? "border-rust bg-paper font-medium text-ink"
                : "border-transparent text-ink-soft hover:border-line hover:text-ink"
            }`}
          >
            {t.admin}
          </Link>
        </div>
      ) : null}
    </nav>
  );
}

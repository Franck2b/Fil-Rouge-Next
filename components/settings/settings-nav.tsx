"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/parametres", label: "Profil" },
  { href: "/parametres/preferences", label: "Préférences" },
  { href: "/parametres/securite", label: "Sécurité" },
  { href: "/parametres/credits", label: "Crédits" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections des paramètres" className="border-b border-line">
      <ul className="-mb-px flex flex-wrap gap-6">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-2 pb-3 text-sm transition-colors ${
                  active
                    ? "border-rust text-ink"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/ui/link";
import { stripLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SettingsNav({ t }: { t: Dictionary["app"]["settings"] }) {
  const pathname = stripLocale(usePathname());

  const tabs = [
    { href: "/parametres", label: t.tabProfile },
    { href: "/parametres/preferences", label: t.tabPreferences },
    { href: "/parametres/securite", label: t.tabSecurity },
    { href: "/parametres/credits", label: t.tabCredits },
  ];

  return (
    <nav aria-label={t.tabsLabel} className="border-b border-line">
      <ul className="-mb-px flex flex-wrap gap-6">
        {tabs.map((tab) => {
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

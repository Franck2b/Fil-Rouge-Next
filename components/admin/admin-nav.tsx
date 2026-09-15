"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/ui/link";
import { stripLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AdminNav({ t }: { t: Dictionary["admin"]["nav"] }) {
  const pathname = stripLocale(usePathname());

  const links = [
    { href: "/admin", label: t.overview },
    { href: "/admin/habilitations", label: t.certifications },
    { href: "/admin/reservations", label: t.bookings },
    { href: "/admin/machines", label: t.machines },
    { href: "/admin/membres", label: t.members },
  ];

  return (
    <nav aria-label={t.label}>
      <ul className="flex gap-px overflow-x-auto border border-bone/15 bg-bone/15 lg:flex-col lg:overflow-visible">
        {links.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap px-4 py-3 text-sm transition-colors ${
                  active ? "bg-rust text-paper" : "bg-ink text-bone/60 hover:text-bone"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

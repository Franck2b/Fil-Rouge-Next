"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/habilitations", label: "Habilitations" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/machines", label: "Parc machines" },
  { href: "/admin/membres", label: "Membres" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation du back-office">
      <ul className="flex gap-px overflow-x-auto border border-bone/15 bg-bone/15 lg:flex-col lg:overflow-visible">
        {LINKS.map((link) => {
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

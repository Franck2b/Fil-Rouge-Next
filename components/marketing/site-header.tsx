"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";

/**
 * Client Component assumé : il gère l'ouverture du menu mobile et met en avant
 * la route courante via usePathname(). Le reste de la vitrine reste serveur.
 */
const LINKS = [
  { href: "/ateliers", label: "Ateliers" },
  { href: "/equipements", label: "Équipements" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bone/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition-colors ${
                  active ? "text-rust" : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/connexion" className="text-sm text-ink-soft hover:text-ink">
            Connexion
          </Link>
          <Link href="/inscription" className={buttonClasses("primary", "sm")}>
            Créer un compte
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="border border-line px-3 py-2 md:hidden"
        >
          <span className="label-tech">{open ? "Fermer" : "Menu"}</span>
        </button>
      </div>

      {open ? (
        <div id="menu-mobile" className="border-t border-line bg-paper md:hidden">
          <nav aria-label="Navigation mobile" className="mx-auto max-w-6xl px-5 py-4">
            <ul className="space-y-1">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line/60 py-3 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/connexion"
                onClick={() => setOpen(false)}
                className={buttonClasses("secondary", "md")}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                onClick={() => setOpen(false)}
                className={buttonClasses("primary", "md")}
              >
                Créer un compte
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { Link } from "@/components/ui/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { stripLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Client Component assumé : il gère l'ouverture du menu mobile et met en avant
 * la route courante via usePathname(). Ses textes arrivent en props depuis le
 * layout serveur, seul à pouvoir lire le dictionnaire.
 */
export function SiteHeader({
  t,
  account,
  accountMobile,
}: {
  t: Dictionary["nav"];
  account: ReactNode;
  accountMobile: ReactNode;
}) {
  const pathname = stripLocale(usePathname());
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/ateliers", label: t.workshops },
    { href: "/equipements", label: t.machines },
    { href: "/tarifs", label: t.pricing },
    { href: "/faq", label: t.faq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bone/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />

        <nav aria-label={t.main} className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
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
          <LocaleSwitcher />
          {account}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="border border-line px-3 py-2"
          >
            <span className="label-tech">{open ? t.close : t.menu}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-mobile" className="border-t border-line bg-paper md:hidden">
          <nav aria-label={t.mobile} className="mx-auto max-w-6xl px-5 py-4">
            <ul className="space-y-1">
              {links.map((link) => (
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
            <div className="mt-4 flex flex-col gap-2">{accountMobile}</div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

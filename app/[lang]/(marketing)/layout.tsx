import { Suspense } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  HeaderAccount,
  HeaderAccountFallback,
} from "@/components/marketing/header-account";
import { getI18n } from "@/lib/i18n/server";

/**
 * Layout de la vitrine : public et indexable, donc pré-rendu.
 * Seule la zone « compte » de l'en-tête dépend de la session : elle est isolée
 * dans un <Suspense> pour que tout le reste de la page reste statique.
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-sm"
      >
        {t.common.skipToContent}
      </a>
      <SiteHeader
        t={t.nav}
        account={
          <Suspense fallback={<HeaderAccountFallback variant="desktop" />}>
            <HeaderAccount variant="desktop" />
          </Suspense>
        }
        accountMobile={
          <Suspense fallback={<HeaderAccountFallback variant="mobile" />}>
            <HeaderAccount variant="mobile" />
          </Suspense>
        }
      />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

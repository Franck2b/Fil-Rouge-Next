import { updateTag } from "next/cache";
import { CATALOG_TAGS } from "@/lib/data/catalog";

/**
 * Appelé par les Server Actions du back-office après une écriture sur le parc.
 * `updateTag` plutôt que `revalidateTag` : il expire l'entrée immédiatement et
 * garantit que l'admin relit sa propre écriture dès la réponse de l'action.
 * Sans cela, une machine passée en maintenance resterait affichée
 * « disponible » sur la vitrine jusqu'à l'expiration du cache.
 */
export function revalidateCatalog() {
  updateTag(CATALOG_TAGS.machines);
  updateTag(CATALOG_TAGS.workshops);
}

# Guide du code — Gabarit

Document de travail personnel, pensé pour le **live coding** : savoir en dix
secondes quel fichier ouvrir pour une modification donnée.

---

## 1. La carte mentale en 30 secondes

Le trajet d'une requête, du navigateur jusqu'à Postgres :

```
navigateur
   ↓
proxy.ts                  ajoute la langue (/fr, /en), rafraîchit la session, redirige les anonymes
   ↓
app/(groupe)/layout.tsx   garde serveur : requireViewer / requireAdmin
   ↓
app/…/page.tsx            Server Component : compose la page
   ↓
lib/data/*.ts             lit les données (Supabase)
   ↓
Postgres + RLS            dernière barrière : chaque ligne est filtrée par le JWT
```

Et pour une **écriture** (formulaire) :

```
components/**/…-form.tsx   Client Component, useActionState
   ↓
lib/actions/*.ts           "use server" : valide avec zod, écrit, revalide
   ↓
Postgres (fonction SQL ou table) + RLS
```

**La règle qui explique 90 % du projet :** tout est Server Component par défaut.
Un fichier ne devient `"use client"` que s'il a besoin de `useState`,
`usePathname`, `useActionState` ou `useFormStatus`.

---

## 2. Arborescence commentée

### Racine

| Fichier | Rôle | Si j'y touche… |
| --- | --- | --- |
| `proxy.ts` | Ex-`middleware.ts`. Rafraîchit la session, redirige les anonymes. | Ajouter une route protégée : compléter `PROTECTED_PREFIXES`. Ce n'est **pas** la sécurité, juste du confort. |
| `next.config.ts` | `cacheComponents: true`, formats d'images. | Désactiver `cacheComponents` casserait `"use cache"`. Ne pas y toucher en live. |
| `.env.local` | Clés Supabase. **Non versionné.** | Toute modification impose de redémarrer `npm run dev`. |
| `.env.example` | Modèle versionné des variables. | À tenir à jour si j'ajoute une variable. |

### `app/` — les routes

Toutes les routes vivent sous **`app/[lang]/`** : la langue est le premier segment de chaque URL (`/fr/equipements`, `/en/equipements`). Les URL ci-dessous sont données sans ce préfixe.

Chaque dossier entre parenthèses est un **route group** : il n'apparaît pas dans
l'URL, il sert à donner un layout et une garde communs.

| Dossier | URL | Garde | Rendu |
| --- | --- | --- | --- |
| `(marketing)` | `/`, `/ateliers`, `/equipements`, `/tarifs`, `/faq` | aucune | statique / PPR |
| `(auth)` | `/connexion`, `/inscription` | aucune | statique |
| `(onboarding)` | `/onboarding`, `/onboarding/habilitation` | `requireViewer` | dynamique |
| `(app)` | `/tableau-de-bord`, `/reservations`, `/reserver`, `/habilitations`, `/parametres` | `requireOnboardedViewer` | dynamique |
| `(admin)` | `/admin/…` | `requireAdmin` | dynamique |
| `api/` | `/api/machines/[slug]/disponibilites` | aucune | Route Handler JSON |

**Fichiers transverses :**

| Fichier | Rôle |
| --- | --- |
| `app/[lang]/layout.tsx` | Layout racine : polices, `metadata` traduites, `<html lang>` selon la langue, `generateStaticParams` des deux langues. |
| `app/globals.css` | **Toute la direction artistique.** Tokens de couleur, polices, `.label-tech`, `.grid-plan`. |
| `app/[lang]/not-found.tsx` | Page 404, déclenchée par `notFound()`. |
| `app/[lang]/error.tsx` | Frontière d'erreur globale. Obligatoirement `"use client"`. |
| `app/sitemap.ts` / `app/robots.ts` | SEO. Le sitemap lit le catalogue, donc se met à jour tout seul. |

### `components/` — l'interface

| Dossier | Contenu | Client ? |
| --- | --- | --- |
| `ui/` | Briques de base : `button`, `badge`, `alert`, `field`, `empty-state`, `submit-button`, plus `link` (lien qui ajoute la langue) et `locale-switcher` (bouton FR/EN). | serveur, sauf `submit-button`, `link` et `locale-switcher` |
| `marketing/` | `site-header` (menu mobile), `site-footer`, `header-account` (zone connexion). | header = client, les autres = serveur |
| `app/` | `app-nav`, `page-header`, `booking-card`, `credit-badge`. | `app-nav` seul est client |
| `admin/` | `admin-nav`, `admin-panel`, et les formulaires d'action du back-office. | formulaires = client |
| `auth/`, `booking/`, `certifications/`, `onboarding/`, `settings/` | Formulaires métier, un par parcours. | tous client (`useActionState`) |
| `logo.tsx` | La marque (SVG + mot). | serveur |

### `lib/` — la logique

| Fichier | Rôle | Quand je l'ouvre |
| --- | --- | --- |
| `i18n/dictionaries/fr.ts` | **Tous les textes français.** Sa forme définit le type `Dictionary`. | Je change ou j'ajoute un texte. |
| `i18n/dictionaries/en.ts` | Tous les textes anglais, typés sur le français. | J'ajoute la traduction — le build échoue si une clé manque. |
| `i18n/server.ts` | `getI18n()` : langue et dictionnaire dans un **Server Component**. | J'affiche un texte côté serveur. |
| `i18n/request.ts` | `getRequestI18n()` pour les **Server Actions** et les gardes, `redirectTo()`, `revalidateLocalized()`. | Je redirige, ou je renvoie un message. |
| `i18n/config.ts` | Langues disponibles, `localizePath()`, `stripLocale()`. | J'ajoute une langue. |
| `i18n/text.ts` | `fill()` pour les `{variables}`, `plural()` pour les accords. | Un texte contient une valeur ou un nombre. |
| `i18n/content.ts` | Traduction anglaise du catalogue stocké en base (machines, ateliers, motifs de crédits). | Je traduis une description de machine. |
| `types.ts` | Types du domaine et listes de valeurs (`MACHINE_CATEGORY_VALUES`, `BOOKING_STATUS_VALUES`). Les libellés affichés sont dans les dictionnaires. | J'ajoute un champ ou un statut. |
| `auth.ts` | `getViewer`, `requireViewer`, `requireOnboardedViewer`, `requireAdmin`. | Je protège une route. |
| `validation.ts` | Tous les schémas zod. | J'ajoute un champ de formulaire. |
| `format.ts` | Dates, heures, crédits, durées — toujours à l'heure de Paris, dans la langue passée en premier argument. | J'affiche une date. |
| `booking.ts` | Horaires d'ouverture, calcul des créneaux, conditions d'annulation. | Je touche au planning. |
| `data/catalog.ts` | Catalogue public, **mis en cache** (`"use cache"` + tags). | J'ajoute une lecture publique. |
| `data/account.ts` | Données du membre connecté. Jamais cachées. | J'ajoute une lecture côté membre. |
| `data/admin.ts` | Données du back-office. Jamais cachées. | J'ajoute une lecture côté admin. |
| `data/tags.ts` | `revalidateCatalog()` — invalide le cache public. | Après une écriture qui change le catalogue. |
| `supabase/server.ts` | Client Supabase **avec cookies** → applique la RLS du visiteur. | Presque toujours celui-là. |
| `supabase/public.ts` | Client anonyme **sans cookie** → seul utilisable dans `"use cache"`. | Uniquement pour le catalogue public. |
| `actions/*.ts` | Toutes les écritures, une par domaine. | Je crée ou modifie une mutation. |
| `actions/types.ts` | `ActionState`, `IDLE`, `failure()`, `success()`. | Contrat commun à tous les formulaires. |

### `supabase/` — la base

| Fichier | Rôle |
| --- | --- |
| `migrations/0001_init.sql` | Types, tables, contraintes, et les fonctions métier `book_machine()`, `cancel_booking()`, `machine_busy_slots()`. |
| `migrations/0002_policies.sql` | Toutes les politiques RLS. |
| `seed.sql` | Les 3 ateliers et 14 machines. |

> Ces fichiers ne s'exécutent pas tout seuls : modifier le SQL local ne change
> rien tant que je ne l'ai pas collé dans le SQL Editor de Supabase.

---

## 3. « Je dois faire X » → j'ouvre Y

**Front** — le cas quasi certain en live coding :

| Demande | Fichier(s) |
| --- | --- |
| Changer une **couleur**, une police, un espacement global | `app/globals.css` |
| Modifier un **bouton / badge / alerte** partout | `components/ui/…` |
| Ajouter une **variante de bouton** | `components/ui/button.tsx` : type `Variant` + objet `VARIANTS` |
| Changer un **texte** (n'importe où) | `lib/i18n/dictionaries/fr.ts` **et** `en.ts` |
| **Ajouter un texte traduit** | une clé dans `fr.ts`, la même dans `en.ts`, puis `{t.ma.cle}` — voir section 6 |
| Ajouter une **section** à une page | la `page.tsx` : copier le gabarit d'une section voisine |
| Modifier le **menu** public | `components/marketing/site-header.tsx` |
| Modifier le **menu** de l'espace membre | `components/app/app-nav.tsx` |
| **Ajouter une page publique** | créer `app/[lang]/(marketing)/ma-page/page.tsx` |
| **Ajouter une page membre** | créer `app/[lang]/(app)/ma-page/page.tsx` — la garde est déjà dans le layout |
| **Ajouter un filtre / un tri** | la `page.tsx` : lire `searchParams`, filtrer, construire les liens |
| **Rendre un bloc interactif** | extraire un petit composant `"use client"`, garder la page serveur |
| **Ajouter un état de chargement** | un `loading.tsx` dans le dossier de la route, ou un `<Suspense>` |
| **Ajouter un état vide** | `<EmptyState title description action />` |
| **Gérer une ressource inexistante** | `notFound()` dans la page |
| **Corriger un débordement mobile** | la `page.tsx` : préfixes `sm:` / `md:` / `lg:`, `overflow-x-auto` |
| **Ajouter un champ** à un formulaire | `lib/validation.ts` → le `…-form.tsx` → l'action |

**Données** — moins probable sur ce module, mais à savoir situer :

| Demande | Fichier(s) |
| --- | --- |
| **Protéger une route** | `requireOnboardedViewer()` dans la page + préfixe dans `proxy.ts` |
| **Créer une mutation** | `lib/actions/` + un formulaire client avec `useActionState` |
| **Invalider un cache** | `revalidateCatalog()` (public) ou `revalidatePath()` (privé) |
| **Ajouter un rôle / une règle d'accès** | `lib/auth.ts` **et** `0002_policies.sql` |
| **Persister un nouveau champ** | colonne SQL + `lib/types.ts` |
| **Ajouter une machine / un atelier** | `supabase/seed.sql` puis exécution dans le SQL Editor |

---

## 4. Les six fichiers à connaître par cœur

Les deux premiers et les deux derniers sont les plus utiles en live coding. Les
numéros 3 et 4 servent surtout à l'**explication orale** : le module note
Next.js, mais le jury demandera comment les accès sont sécurisés.

1. **`lib/auth.ts`** — trois fonctions, quinze lignes chacune. `getUser()` et non
   `getSession()` : la première revalide le JWT auprès de Supabase, la seconde
   fait confiance à un cookie qui pourrait être forgé.

2. **`app/[lang]/(app)/reserver/[slug]/page.tsx`** — le parcours métier. Trois étapes
   lisibles dans l'URL : aucun paramètre → choix du jour ; `?jour=` → choix du
   créneau ; `?jour=&debut=&duree=` → récapitulatif. Aucun état client à
   synchroniser, le bouton « retour » du navigateur fonctionne.

3. **`0001_init.sql`, fonction `book_machine()`** — le cœur. Une seule
   transaction vérifie l'habilitation, le solde, l'horaire et le chevauchement,
   puis débite. Les membres n'ont **aucune politique `insert` sur `bookings`** :
   impossible de contourner ces règles.

4. **`0002_policies.sql`** — la RLS. Le point le plus fin : `is_admin()` est
   `security definer` pour éviter une **récursion** (lire `profiles` déclencherait
   la politique sur `profiles`, qui relit `profiles`…).

5. **`lib/data/catalog.ts`** — le cache. `"use cache"` + `cacheTag`, et un client
   Supabase **sans cookie** : une fonction cachée ne peut dépendre d'aucune
   donnée de requête, donc pas de cookies.

6. **`components/marketing/header-account.tsx`** — l'arbitrage server/client.
   `SiteHeader` est client, il n'a pas accès à la session. Plutôt que de rendre
   toute la vitrine dynamique, seule cette zone lit la session, dans un
   `<Suspense>`.

---

## 5. Recettes — modifications front

Le module note **Next.js**, pas le backend. La demande du live coding portera
donc presque certainement sur l'interface : un composant, un état, un affichage,
une interaction. Les recettes sont classées de la plus probable à la moins
probable.

### A. Modifier l'apparence (couleur, typo, espacement)

Tout part de `app/globals.css`. Les couleurs sont des **tokens** déclarés dans
`@theme`, utilisables ensuite comme n'importe quelle classe Tailwind
(`bg-rust`, `text-ink-soft`, `border-line`).

| Token | Usage |
| --- | --- |
| `ink`, `ink-soft` | textes |
| `bone`, `paper` | fonds clairs |
| `line` | bordures |
| `kraft` | texte secondaire, étiquettes |
| `rust`, `rust-dark`, `rust-wash` | accent unique |
| `moss`, `amber`, `brick` (+ `-wash`) | statuts : validé, en attente, refusé |

Deux classes maison : `.label-tech` (petites capitales espacées en mono) et
`.grid-plan` / `.grid-plan-light` (la trame millimétrée des fonds).

> Changer une couleur dans `@theme` la change **partout**. Pour un changement
> local, utiliser directement la classe sur l'élément.

### B. Ajouter ou modifier un composant d'interface

Les briques vivent dans `components/ui/`. Chacune est volontairement minuscule.

Ajouter une **variante de bouton** — `components/ui/button.tsx` :

1. Ajouter le nom au type `Variant`.
2. Ajouter la ligne correspondante dans l'objet `VARIANTS`.

C'est tout : `Button` et `ButtonLink` la prennent automatiquement.

> **Piège à éviter absolument en direct :** ne jamais surcharger une couleur de
> variante par `className`. Deux utilitaires Tailwind de même propriété
> (`border-ink` et `border-bone`) sont départagés par l'ordre de la **feuille de
> style**, pas par l'ordre des classes — le bouton devient invisible. C'est ce
> qui est arrivé sur ce projet, d'où les variantes `inverse`, `onRust` et
> `ghostInverse`.

Les autres briques suivent le même schéma : `Badge` a des `tone`
(`neutral`, `rust`, `moss`, `amber`, `brick`), `Alert` a des `tone`
(`info`, `success`, `warning`, `error`).

### C. Ajouter une section à une page existante

Ouvrir la `page.tsx` concernée et copier le gabarit d'une section voisine. Le
modèle de la vitrine est constant :

```tsx
<section className="border-b border-line">
  <div className="mx-auto max-w-6xl px-5 py-20">
    <p className="label-tech text-kraft">Sur-titre</p>
    <h2 className="mt-3 text-3xl uppercase sm:text-4xl">Titre</h2>
    {/* contenu */}
  </div>
</section>
```

`max-w-6xl px-5` est la largeur de contenu commune à tout le site : la respecter
suffit à rester aligné avec le reste.

### D. Ajouter une page

Créer `app/[lang]/(groupe)/ma-page/page.tsx`. Le **groupe choisi décide de tout** :

- `(marketing)` → publique, indexable, pré-rendue, avec header et footer
- `(app)` → protégée par `requireOnboardedViewer`, avec la navigation membre
- `(admin)` → réservée au rôle admin, châssis sombre

Aucune garde à écrire : elle est déjà dans le `layout.tsx` du groupe. Ajouter un
`export const metadata` pour le titre de l'onglet.

### E. Rendre un composant interactif

Un Server Component ne peut pas utiliser `useState`. Deux options :

1. Ajouter `"use client"` en tête du fichier — acceptable si le composant est
   **une feuille** de l'arbre, sans accès aux données.
2. Mieux : extraire uniquement la partie interactive dans un petit composant
   client, et garder la page en Server Component.

C'est l'arbitrage que le jury veut entendre. Le projet a un exemple des deux :
`site-header.tsx` est entièrement client (menu mobile + route active), tandis
que `header-account.tsx` reste serveur pour lire la session et n'est monté que
dans un `<Suspense>`.

### F. Ajouter un état loading, empty ou error

| État | Comment |
| --- | --- |
| **loading** | créer un `loading.tsx` dans le dossier de la route — Next l'utilise automatiquement comme `<Suspense>`. Modèle : `app/[lang]/(app)/tableau-de-bord/loading.tsx` |
| **empty** | le composant `<EmptyState title description action />` |
| **error** | `app/[lang]/error.tsx` couvre déjà tout ; pour une erreur locale, `<Alert tone="error">` |
| **404** | `notFound()` dans la page → `app/[lang]/not-found.tsx` |

### G. Ajouter un filtre ou un tri

Modèle à copier depuis `app/[lang]/(app)/reservations/page.tsx` ou
`app/[lang]/(marketing)/equipements/page.tsx`.

```tsx
const { statut = "" } = await searchParams;
```

Trois choses à dire à voix haute : le filtre vit **dans l'URL** (partageable,
fonctionne sans JavaScript) ; lire `searchParams` rend la page **dynamique**,
d'où le `<Suspense>` autour ; et on **valide** la valeur reçue au lieu de la
passer telle quelle à la requête.

### H. Corriger le responsive

Le site est en *mobile first* : les classes sans préfixe s'appliquent au
téléphone, `sm:` / `md:` / `lg:` élargissent ensuite.

Deux pièges déjà rencontrés :

- Un tableau large doit vivre dans un conteneur `overflow-x-auto`, jamais
  déborder la page (voir `/tarifs`).
- Une grille `gap-px` sur fond coloré laisse apparaître des **cellules
  fantômes** quand le nombre d'éléments ne remplit pas la ligne. Préférer
  `gap-4` avec des cartes bordées individuellement.

### I. Ajouter un champ à un formulaire

Dans l'ordre — TypeScript signale chaque étape oubliée :

1. `lib/validation.ts` — ajouter le champ au schéma zod
2. `components/**/…-form.tsx` — un `<Field>` + `<Input>` de plus
3. `lib/actions/…` — lire `formData.get(...)`, le passer au `safeParse`, puis à
   l'écriture
4. la page qui l'affiche

Si le champ doit être **stocké**, il faut en plus une colonne
(`alter table … add column …` dans le SQL Editor) et l'ajouter au type dans
`lib/types.ts`. Mais sur ce module, la demande s'arrêtera probablement à
l'affichage et à la validation.

---

### Si la demande touche quand même la donnée

Trois cas, traités en une ligne chacun :

- **Protéger une route** → `requireOnboardedViewer()` dans la page, puis le
  préfixe dans `PROTECTED_PREFIXES` (`proxy.ts`). Le proxy n'est qu'un
  raccourci : la vraie garde est la fonction serveur, et la RLS derrière.
- **Invalider un cache** → `revalidateCatalog()` (`lib/data/tags.ts`) pour le
  catalogue public, `revalidatePath("/ma-route")` pour une page privée.
- **Créer une mutation** → un fichier dans `lib/actions/` avec `"use server"`,
  puis un formulaire client branché par `useActionState`.

## 6. La traduction FR / EN

### Comment ça marche

1. La langue est un **segment d'URL** : `app/[lang]/`. Chaque page existe en `/fr/…` et en `/en/…`, et chacune est **pré-rendue** — la traduction ne coûte rien en performance.
2. `proxy.ts` redirige une URL sans langue (`/equipements`) vers la langue mémorisée, sinon celle du navigateur, sinon le français.
3. Les textes vivent dans **deux dictionnaires TypeScript**. `en.ts` est typé sur `fr.ts` : une clé oubliée **fait échouer le build**, et l'autocomplétion propose toutes les clés existantes.
4. Le bouton `LocaleSwitcher` garde la page et ses paramètres (`?jour=…`) : seul le préfixe change.

### Où lire la langue — trois cas, trois outils

| Je suis dans… | J'écris | Pourquoi |
| --- | --- | --- |
| un **Server Component** | `const { locale, t } = await getI18n();` | `next/root-params` lit `[lang]` sans passer de prop |
| un **Client Component** | je reçois `t` en prop depuis le parent serveur | `next/root-params` est interdit côté client |
| une **Server Action** ou une garde d'accès | `const { locale, t } = await getRequestI18n();` | `next/root-params` est interdit dans les actions : on lit le cookie que `proxy.ts` aligne sur l'URL |

C'est la question d'architecture la plus probable sur ce sujet : savoir expliquer **pourquoi** il y a deux fonctions.

### Recette : ajouter un texte traduit

1. `lib/i18n/dictionaries/fr.ts` : ajouter la clé, par exemple `badge: "Nouveau"` dans `home.hero`.
2. `lib/i18n/dictionaries/en.ts` : TypeScript souligne une erreur tant que la clé manque — ajouter `badge: "New"`.
3. Dans le composant : `{t.home.hero.badge}`.

Avec une valeur : `"Bonjour, {name}"`, puis `fill(t.nav.hello, { name })`.
Avec un nombre : `{ one: "{count} machine", other: "{count} machines" }`, puis `plural(locale, t.plural.machines, count)`.

### Les liens

Toujours `import { Link } from "@/components/ui/link"`, jamais `next/link` directement : ce composant ajoute la langue tout seul. On écrit `href="/equipements"`, le navigateur reçoit `/en/equipements`.

### Le contenu stocké en base

Les descriptions de machines et d'ateliers sont enregistrées en français. Leur version anglaise est dans `lib/i18n/content.ts`, indexée par `slug`. C'est défendable parce que le catalogue est fixe ; un catalogue éditable par l'admin demanderait des colonnes par langue en base.

---

## 7. Pièges déjà rencontrés sur ce projet

Ce sont de vrais bugs corrigés pendant le développement. Les connaître évite de
les réintroduire en direct, et ils font d'excellentes réponses en soutenance.

| Piège | Symptôme | Cause |
| --- | --- | --- |
| **Jointure ambiguë PostgREST** | Le compteur dit « 2 », la liste affiche 0. | `certifications` a deux clés étrangères vers `profiles`. Il faut nommer la contrainte : `profiles!certifications_user_id_fkey`. |
| **Erreur Supabase avalée** | Liste vide sans message. | `const { data } = await …` ignore `error`. Toujours déstructurer `error` et le remonter. |
| **Classes Tailwind qui se battent** | Bouton invisible. | `border-bone` en `className` ne bat pas `border-ink` de la variante : c'est l'ordre de la feuille de style qui tranche. Créer une **variante**, pas un override. |
| **Champ non contrôlé périmé** | Le select affiche l'ancienne valeur après enregistrement. | Ajouter une `key` sur le `<form>` pour forcer le remontage. |
| **Cellules fantômes** | Blocs beiges vides en fin de grille. | Une grille `gap-px` sur fond coloré laisse voir le fond. Utiliser des cartes bordées individuellement. |
| **`Date.now()` dans un composant** | Erreur ESLint, puis erreur de pré-rendu. | Lire l'heure est impur. Le faire dans une fonction de `lib/`, ou dans une fonction `"use cache"`. |
| **Heures décalées en production** | Tous les créneaux décalés de 2 h sur Vercel. | Le serveur tourne en UTC. Les heures sont construites et affichées explicitement en `Europe/Paris` (`lib/booking.ts`, `lib/format.ts`). |
| **Lien qui perd la langue** | Un clic renvoie en français depuis la version anglaise. | Un `next/link` importé directement n'ajoute pas le préfixe. Utiliser `@/components/ui/link`. |

---

## 8. Vocabulaire à maîtriser

- **Route group** — dossier `(nom)` : regroupe des routes sous un layout commun
  sans apparaître dans l'URL.
- **Server Component** — rendu sur le serveur, aucun JavaScript envoyé au client,
  accès direct à la base. Le défaut.
- **Client Component** — `"use client"`, nécessaire dès qu'il y a état ou
  interaction.
- **Server Action** — `"use server"`, fonction appelée par un `<form>` et exécutée
  sur le serveur.
- **RLS** — Row Level Security : filtrage ligne par ligne dans Postgres selon le
  JWT du visiteur.
- **`security definer`** — fonction SQL qui s'exécute avec les droits de son
  créateur, donc au-dessus de la RLS. Sert à faire ce que le client n'a pas le
  droit de faire directement.
- **Root params** — `next/root-params` : lit un segment placé avant le layout racine (ici `[lang]`) depuis n'importe quel Server Component, sans prop. Indisponible côté client et dans les Server Actions.
- **PPR** — Partial Prerendering : coque statique + trous dynamiques remplis en
  streaming via `<Suspense>`.

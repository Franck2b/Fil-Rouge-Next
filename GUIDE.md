# Guide du code — Gabarit

Document de travail personnel, pensé pour le **live coding** : savoir en dix
secondes quel fichier ouvrir pour une modification donnée.

---

## 1. La carte mentale en 30 secondes

Le trajet d'une requête, du navigateur jusqu'à Postgres :

```
navigateur
   ↓
proxy.ts                  rafraîchit le cookie de session, redirige les anonymes
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
| `app/layout.tsx` | Layout racine : polices (Archivo, Inter, Plex Mono), `metadata` par défaut, `<html lang="fr">`. |
| `app/globals.css` | **Toute la direction artistique.** Tokens de couleur, polices, `.label-tech`, `.grid-plan`. |
| `app/not-found.tsx` | Page 404, déclenchée par `notFound()`. |
| `app/error.tsx` | Frontière d'erreur globale. Obligatoirement `"use client"`. |
| `app/sitemap.ts` / `app/robots.ts` | SEO. Le sitemap lit le catalogue, donc se met à jour tout seul. |

### `components/` — l'interface

| Dossier | Contenu | Client ? |
| --- | --- | --- |
| `ui/` | Briques de base : `button`, `badge`, `alert`, `field`, `empty-state`, `submit-button`. | serveur, sauf `submit-button` |
| `marketing/` | `site-header` (menu mobile), `site-footer`, `header-account` (zone connexion). | header = client, les autres = serveur |
| `app/` | `app-nav`, `page-header`, `booking-card`, `credit-badge`. | `app-nav` seul est client |
| `admin/` | `admin-nav`, `admin-panel`, et les formulaires d'action du back-office. | formulaires = client |
| `auth/`, `booking/`, `certifications/`, `onboarding/`, `settings/` | Formulaires métier, un par parcours. | tous client (`useActionState`) |
| `logo.tsx` | La marque (SVG + mot). | serveur |

### `lib/` — la logique

| Fichier | Rôle | Quand je l'ouvre |
| --- | --- | --- |
| `types.ts` | Types du domaine + libellés français (`CATEGORY_LABELS`, `BOOKING_STATUS_LABELS`…). | J'ajoute un champ ou un statut. |
| `auth.ts` | `getViewer`, `requireViewer`, `requireOnboardedViewer`, `requireAdmin`. | Je protège une route. |
| `validation.ts` | Tous les schémas zod. | J'ajoute un champ de formulaire. |
| `format.ts` | Dates, heures, crédits, durées. | J'affiche une date. |
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

| Demande du jury | Fichier(s) |
| --- | --- |
| Changer une **couleur**, une police, un espacement global | `app/globals.css` |
| Modifier un **bouton / badge / alerte** partout | `components/ui/…` |
| Changer un **texte** de la vitrine | la `page.tsx` concernée dans `app/(marketing)/` |
| Modifier le **menu** public | `components/marketing/site-header.tsx` |
| Modifier le **menu** de l'espace membre | `components/app/app-nav.tsx` |
| **Ajouter une page publique** | créer `app/(marketing)/ma-page/page.tsx` |
| **Ajouter une page membre** | créer `app/(app)/ma-page/page.tsx` — la garde est déjà dans le layout |
| **Protéger une route** | `requireOnboardedViewer()` dans la page + préfixe dans `proxy.ts` |
| **Ajouter un rôle / une règle d'accès** | `lib/auth.ts` **et** `0002_policies.sql` |
| **Ajouter un filtre** dans une liste | la `page.tsx` : lire `searchParams`, filtrer, construire les liens |
| **Ajouter un champ** à un formulaire | `lib/validation.ts` → le `…-form.tsx` → l'action → la migration SQL |
| **Créer une mutation** | `lib/actions/` + un formulaire client avec `useActionState` |
| **Invalider un cache** | `revalidateCatalog()` (public) ou `revalidatePath()` (privé) |
| **Ajouter un état de chargement** | un `loading.tsx` dans le dossier de la route, ou un `<Suspense>` |
| **Gérer une ressource inexistante** | `notFound()` dans la page |
| **Ajouter une machine / un atelier** | `supabase/seed.sql` puis exécution dans le SQL Editor |

---

## 4. Les six fichiers à connaître par cœur

Si le jury ouvre le projet au hasard, il tombera probablement sur l'un de ceux-là.

1. **`lib/auth.ts`** — trois fonctions, quinze lignes chacune. `getUser()` et non
   `getSession()` : la première revalide le JWT auprès de Supabase, la seconde
   fait confiance à un cookie qui pourrait être forgé.

2. **`app/(app)/reserver/[slug]/page.tsx`** — le parcours métier. Trois étapes
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

## 5. Recettes pour les modifications types

### Ajouter un champ persistant (l'exemple le plus probable)

Ajouter « niveau d'expérience » sur une demande d'habilitation :

1. **SQL** — dans le SQL Editor Supabase :
   `alter table certifications add column experience_level text;`
   Reporter la ligne dans `supabase/migrations/0001_init.sql`.
2. **Type** — `lib/types.ts` : ajouter `experience_level: string | null;` au type
   `Certification`.
3. **Validation** — `lib/validation.ts` : ajouter le champ à `certificationSchema`.
4. **Formulaire** — `components/certifications/request-form.tsx` : un `<Field>` +
   `<Input>` de plus.
5. **Action** — `lib/actions/certifications.ts` : lire `formData.get(...)`, le
   passer au `safeParse`, puis à l'`upsert`.
6. **Affichage** — `app/(admin)/admin/habilitations/page.tsx`.

> L'ordre compte : type → validation → formulaire → action → affichage. C'est le
> sens de circulation de la donnée, et TypeScript signale chaque étape oubliée.

### Ajouter un filtre via `searchParams`

Modèle à copier depuis `app/(app)/reservations/page.tsx` :

```tsx
const { statut = "" } = await searchParams;
```

Trois points à dire à voix haute : le filtre vit **dans l'URL** (partageable,
fonctionne sans JavaScript) ; la lecture de `searchParams` rend la page
**dynamique**, d'où le `<Suspense>` ; et on **valide** la valeur reçue au lieu de
la passer telle quelle à la requête.

### Protéger une route supplémentaire

```tsx
const viewer = await requireOnboardedViewer("/ma-route");
```

Puis ajouter `"/ma-route"` à `PROTECTED_PREFIXES` dans `proxy.ts`. Préciser que
le `proxy` n'est qu'un raccourci : la vraie garde est la fonction serveur, et la
RLS derrière.

### Invalider correctement un cache

Après une écriture qui change le **catalogue public** : `revalidateCatalog()`
(`lib/data/tags.ts`). Après une écriture qui change une **page privée** :
`revalidatePath("/tableau-de-bord")`.

`updateTag()` plutôt que `revalidateTag()` dans une Server Action : il expire
l'entrée immédiatement, donc l'admin relit sa propre écriture.

### Ajouter un état loading

Créer `loading.tsx` dans le dossier de la route — Next l'utilise automatiquement
comme `<Suspense>`. Modèle dans `app/(app)/tableau-de-bord/loading.tsx`.

---

## 6. Pièges déjà rencontrés sur ce projet

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

---

## 7. Vocabulaire à maîtriser

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
- **PPR** — Partial Prerendering : coque statique + trous dynamiques remplis en
  streaming via `<Suspense>`.

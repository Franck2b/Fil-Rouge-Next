# Gabarit — réseau d'ateliers partagés

Projet fil rouge M2 EEMI · **Next.js 16.3 (App Router) + Supabase**.

Gabarit est un produit de réservation de machines dans un réseau d'ateliers partagés
(fablabs). Un membre passe une **habilitation** par famille de machines, achète des
**crédits**, puis réserve des **créneaux horaires** sur une machine précise d'un
atelier précis. Un administrateur arbitre les habilitations, gère le parc et
ajuste les crédits.

---

## 1. Lancer le projet de A à Z

### Prérequis

Node.js 20 ou plus (`node -v`), npm, et un compte [supabase.com](https://supabase.com)
(gratuit). Aucune installation de base de données en local : Postgres est hébergé
par Supabase.

### Étape 1 — Installer les dépendances

```bash
npm install
```

### Étape 2 — Créer le projet Supabase

Sur [supabase.com](https://supabase.com) : **New project**, choisir une région
européenne, générer un mot de passe de base de données et **le conserver**
(Supabase ne le réaffiche pas). La création prend une à deux minutes.

### Étape 3 — Créer le schéma et les données

Dans le **SQL Editor** du projet, coller puis exécuter les trois fichiers **dans
cet ordre** :

1. `supabase/migrations/0001_init.sql` — types, tables, contraintes, fonctions métier
2. `supabase/migrations/0002_policies.sql` — Row Level Security
3. `supabase/seed.sql` — catalogue (3 ateliers, 14 machines)

Le premier déclenche un avertissement « *This query creates tables without
enabling RLS* » : choisir **Run and enable RLS**. Les politiques arrivent au
fichier suivant.

Vérification :

```sql
select (select count(*) from workshops)  as ateliers,
       (select count(*) from machines)   as machines,
       (select count(*) from pg_policies where schemaname = 'public') as policies;
```

Résultat attendu : **3 ateliers, 14 machines, 14 politiques**.

### Étape 4 — Autoriser la connexion sans boîte mail

**Authentication → Sign In / Providers → Email** : désactiver **Confirm email**,
puis **Save changes**. Sans cela, aucun compte de démonstration ne peut se
connecter.

### Étape 5 — Renseigner les variables d'environnement

```bash
cp .env.example .env.local
```

Puis remplir `.env.local` avec les valeurs du projet :

| Variable | Où la trouver dans Supabase |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → Data API → *Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API Keys → *Publishable key* (`sb_publishable_…`) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` en local, l'URL Vercel en production |

Les trois variables sont publiques (préfixe `NEXT_PUBLIC_`). **Aucune clé de
service (`sb_secret_…` / `service_role`) n'est utilisée par l'application** :
toute la sécurité repose sur les politiques RLS de Postgres.

> `.env.local` n'est pas versionné. Après toute modification, redémarrer le
> serveur de développement.

### Étape 6 — Démarrer

```bash
npm run dev
```

L'application est sur **http://localhost:3000**. La vitrine doit afficher
« 3 ateliers · 14 machines » : si ces compteurs sont à zéro, les clés ou le seed
sont en cause.

### Étape 7 — Créer les comptes

1. Aller sur `/inscription`, créer `membre@gabarit.test`, **terminer les deux
   étapes d'onboarding** (profil + atelier, puis une première habilitation).
2. Se déconnecter, créer `admin@gabarit.test` de la même façon.
3. Promouvoir le second en administrateur, dans le SQL Editor :

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@gabarit.test');
```

4. Recharger `/tableau-de-bord` : le lien **Administration** apparaît dans la
   navigation latérale.

Pour ouvrir le planning, se connecter en admin, aller sur **Administration →
Habilitations** et valider la demande du membre.

### Scripts disponibles

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production — à lancer avant tout rendu |
| `npm run start` | Serveur de production (nécessite un `build` préalable) |
| `npm run lint` | ESLint (config `next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` |

### Déployer sur Vercel

Importer le dépôt, reporter les trois variables d'environnement dans
**Settings → Environment Variables** (avec `NEXT_PUBLIC_SITE_URL` sur l'URL de
production), puis déployer. Aucune configuration supplémentaire n'est requise.

### En cas de problème

| Symptôme | Cause probable |
| --- | --- |
| `fetch failed` au démarrage | `.env.local` absent, mal placé ou non rechargé |
| Vitrine à « 0 atelier · 0 machine » | `seed.sql` non exécuté |
| « Invalid login credentials » à la connexion | Compte inexistant, ou **Confirm email** encore activé |
| Le lien Administration n'apparaît pas | Requête de promotion non exécutée, ou page non rechargée |
| Liste vide côté back-office | Migration `0002_policies.sql` non exécutée |

> Un guide détaillé du code — rôle de chaque dossier et de chaque fichier,
> recettes de modification — est disponible dans [`GUIDE.md`](./GUIDE.md).

---

## 2. Comptes de démonstration

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Membre | `membre@etabli.test` | *(communiqué à l'oral)* |
| Administrateur | `admin@etabli.test` | *(communiqué à l'oral)* |

Ces deux comptes existent sur le projet Supabase rattaché au dépôt. Leur domaine
`@etabli.test` est antérieur au renommage du produit : ce sont des identifiants
de connexion, les changer reviendrait à recréer les comptes.

Sur une installation neuve, suivre l'étape 7 ci-dessus.

> `Confirm email` est désactivé côté Supabase (Authentication → Sign In /
> Providers → Email). Sans cela, aucun compte de démonstration ne peut se
> connecter sans boîte mail réelle.

---

## 3. Fonctionnalités

### Vitrine publique — `(marketing)`
- Accueil, `/ateliers`, `/ateliers/[slug]`, `/equipements`, `/equipements/[slug]`, `/tarifs`, `/faq`
- Catalogue filtrable par famille, atelier et recherche texte (filtres dans l'URL, sans JavaScript)
- Metadata par page, `sitemap.xml`, `robots.txt`, images via `next/image`

### Authentification — `(auth)`
- Inscription, connexion, déconnexion via Server Actions
- Session lue côté serveur (`supabase.auth.getUser()`), jamais depuis un cookie brut
- Redirection de retour (`?suite=`) validée pour éviter une redirection ouverte

### Onboarding — `(onboarding)`
- Deux étapes persistées : profil + atelier de rattachement, puis première demande d'habilitation
- Tant que `onboarding_completed` est faux, l'espace membre reste fermé

### Espace membre — `(app)`
- Tableau de bord : solde, créneaux à venir, habilitations, mouvements de crédits
- **Parcours de réservation en trois étapes** (`/reserver/[slug]`) : jour → créneau → confirmation
- Historique filtrable et paginé, détail d'une réservation, annulation avec remboursement conditionnel
- Habilitations : demande, suivi du statut, note du référent
- Paramètres (layout imbriqué) : profil, préférences, sécurité, crédits

### Back-office — `(admin)`
- Accès réservé au rôle `admin`, identité visuelle inversée pour ne pas confondre les espaces
- Indicateurs du réseau, file d'arbitrage des habilitations, réservations filtrables,
  édition du parc machines, recherche de membres et ajustement des crédits

---

## 4. Choix d'architecture

### Route groups

```
app/
├─ (marketing)/   public, indexable, pré-rendu
├─ (auth)/        entrée dans le produit
├─ (onboarding)/  compte créé mais pas encore membre
├─ (app)/         espace authentifié
├─ (admin)/       rôle distinct, accès protégé
└─ api/           contrat JSON pour la future app mobile
```

Chaque groupe porte son propre `layout.tsx`, donc sa propre garde et son propre
châssis visuel. `(app)/parametres/layout.tsx` est un layout imbriqué
supplémentaire (onglets des paramètres).

### Trois niveaux de protection, du plus faible au plus fort

1. **`proxy.ts`** (ex-middleware) — rafraîchit le cookie de session et redirige
   tôt les visiteurs anonymes. Confort, pas sécurité.
2. **Layouts serveur** — `requireViewer`, `requireOnboardedViewer`,
   `requireAdmin` (`lib/auth.ts`) relisent l'utilisateur et son rôle en base à
   chaque requête.
3. **Row Level Security** — dernière barrière, dans Postgres. Même une requête
   forgée avec le JWT d'un membre ne peut lire que ses propres lignes.

Le rôle n'est jamais lu depuis le client : masquer un bouton ne protège rien.

### Le métier sensible vit dans Postgres

`book_machine()` et `cancel_booking()` sont des fonctions `security definer`.
Une réservation vérifie en **une seule transaction** l'habilitation, le solde de
crédits, l'horaire et l'absence de chevauchement, puis débite le compte et écrit
la ligne de crédit. Les membres n'ont **aucune politique `insert` sur `bookings`** :
il est impossible de créer une réservation en contournant ces règles.

Le chevauchement est garanti par une contrainte d'exclusion GiST, pas par un
`select` préalable — deux requêtes simultanées ne peuvent pas passer toutes les deux.

### Server / Client

| Rendu | Où | Pourquoi |
| --- | --- | --- |
| **Server Components** | tout par défaut | données et secrets restent sur le serveur, aucun JS envoyé |
| **Client Components** | `site-header`, `*-form`, `app-nav`, `settings-nav`, `admin-nav` | `useState` (menu mobile), `usePathname` (route active), `useActionState` / `useFormStatus` (état des formulaires) |
| **Server Actions** | `lib/actions/*` | toutes les mutations, avec validation zod côté serveur |
| **Route Handler** | `app/api/machines/[slug]/disponibilites` | seul contrat JSON destiné à un consommateur externe : la future app React Native |

### Cache et invalidation

`cacheComponents` est activé (`next.config.ts`).

- Le **catalogue public** (`lib/data/catalog.ts`) est marqué `"use cache"` avec les
  tags `workshops` et `machines`, et un `cacheLife` de `days` / `hours`. Il est lu
  par un client Supabase anonyme **sans cookie** — condition nécessaire pour
  qu'une fonction cachée n'ait aucune dépendance à la requête.
- Quand un admin modifie une machine, `updateMachineAction` appelle
  `revalidateCatalog()` qui fait un `updateTag()` sur ces deux tags : la vitrine
  reflète immédiatement la mise en maintenance.
- Les **données de session** (`lib/data/account.ts`, `lib/data/admin.ts`) ne sont
  jamais cachées, et les zones qui lisent `searchParams` sont isolées dans des
  `<Suspense>` ou couvertes par un `loading.tsx`.
- Les trois layouts qui lisent la session — `(app)`, `(admin)`, `(onboarding)` —
  déclarent `export const instant = false`. Aucune de leurs pages ne peut être
  pré-rendue : autant l'assumer plutôt que d'envelopper chaque lecture de cookie
  dans un `<Suspense>` qui n'afficherait rien d'utile.

### États d'interface

Chargement (`loading.tsx`, `<Suspense>`), vide (`EmptyState`), erreur
(`app/error.tsx`, retours typés `ActionState`), introuvable (`notFound()` →
`app/not-found.tsx`), accès refusé (redirection avec message).

### Direction artistique

Référence : le **plan d'atelier**. Papier clair (`#F5F1E8`), encre charbon
(`#15130F`), un seul accent rouille (`#D4581B`), trames millimétrées. Aucun
dégradé ni ombre diffuse : les volumes naissent des bordures. Titres en Archivo,
texte en Inter, cotes et étiquettes techniques en IBM Plex Mono. Les visuels du
catalogue sont des schémas générés, pas des photos de banque d'images.

---

## 5. Schéma de données

```
workshops ──┬── machines ──── bookings ──── credit_transactions
            │                    │
profiles ───┴── certifications ──┘
```

| Table | Rôle |
| --- | --- |
| `workshops` | Les trois ateliers (adresse, coordonnées GPS, horaires) |
| `machines` | Le parc : famille, statut, coût horaire en crédits |
| `profiles` | Extension de `auth.users` : rôle, solde, atelier, onboarding |
| `certifications` | Habilitation par famille : `pending` / `approved` / `rejected` |
| `bookings` | Créneaux réservés, avec contrainte anti-chevauchement |
| `credit_transactions` | Historique des débits et remboursements |

Les coordonnées GPS des ateliers sont déjà en base : elles serviront à la
géolocalisation de la future application mobile.

---

## 6. Suite mobile (React Native)

Le concept a été choisi pour que les deux capacités natives imposées aient un
usage réel, pas décoratif :

- **NFC** — chaque machine porte une étiquette NFC. Le membre approche son
  téléphone pour ouvrir sa session : l'app vérifie qu'une réservation confirmée
  couvre l'heure courante sur *cette* machine et déclenche le check-in. C'est le
  chaînon manquant entre « avoir réservé » et « avoir réellement utilisé ».
- **Géolocalisation** — trouver l'atelier le plus proche, et filtrer les machines
  libres dans l'heure autour de soi. `workshops.latitude/longitude` et la route
  `/api/machines/[slug]/disponibilites` existent déjà pour ça.

---

## 7. Usage de l'IA

**Outils utilisés.** Claude Code (agent en terminal) pour la génération du
squelette, des composants répétitifs et du SQL ; documentation officielle
Next.js 16 et Supabase pour les API récentes.

**Tâches confiées.** Mise en place de l'arborescence des route groups, rédaction
des migrations SQL, génération des composants d'interface et des pages vitrine,
traduction des messages d'erreur.

**Une décision proposée par l'IA qui a été corrigée.** La première version lisait
les créneaux occupés d'une machine par un simple `select` sur `bookings`. C'était
faux à deux titres : les politiques RLS n'auraient renvoyé que *mes* réservations,
donc le planning aurait affiché des créneaux libres qui ne l'étaient pas ; et une
lecture préalable ne protège pas d'une réservation concurrente. Remplacé par une
fonction SQL `machine_busy_slots()` qui ne renvoie que des bornes horaires, doublée
d'une contrainte d'exclusion GiST qui rend le chevauchement impossible au niveau
de la base.

**Une partie que je peux expliquer intégralement.** Le parcours de réservation :
les trois états lisibles dans l'URL de `/reserver/[slug]`, le calcul des créneaux
dans `lib/booking.ts`, la Server Action `createBookingAction`, la fonction
`book_machine()` et les raisons pour lesquelles la vérification y est faite plutôt
que côté Next.js.

---

## 8. Limites connues

- Les **packs de crédits ne sont pas payants** : l'achat est simulé par un
  ajustement manuel depuis le back-office. Aucun prestataire de paiement n'est
  branché, ce n'était pas le sujet du module.
- Les **e-mails ne sont pas envoyés.** La préférence « alertes par e-mail » est
  persistée mais aucun envoi n'est déclenché ; il faudrait une fonction planifiée
  côté Supabase.
- Les **horaires d'ouverture sont uniformes** (9 h – 20 h, `lib/booking.ts`) alors
  que la base stocke un texte libre par atelier. Un vrai produit modéliserait des
  plages par atelier et par jour.
- Le passage automatique d'une réservation à `completed` **n'est pas automatisé** :
  il se fait à la main depuis le back-office, faute de tâche planifiée.
- **Aucun test automatisé.** La vérification s'est faite manuellement sur les
  parcours principaux.
- Le filtre par atelier du back-office s'applique **après** la pagination : sur un
  volume réel, il faudrait un filtre imbriqué PostgREST ou une vue dédiée.

# Gabarit — réseau d'ateliers partagés

Projet fil rouge M2 EEMI · **Next.js 16.3 (App Router) + Supabase**.

- En ligne : <https://fil-rouge-next.vercel.app>
- Application mobile : <https://github.com/Franck2b/projet-fil-rouge-react-native>
- Lancement Docker : `./docker.sh` (voir [section 2](#2-docker))

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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → *Publishable key* (`sb_publishable_…`) |
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

L'application est sur **http://localhost:3000**, qui redirige vers `/fr` ou `/en` selon la langue du navigateur. La vitrine doit afficher
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
| `npm run start` | Serveur de production (nécessite un `build` préalable). Fonctionne, avec un avertissement lié à `output: "standalone"` : c'est l'image Docker qui utilise le serveur autonome |
| `npm run lint` | ESLint (config `next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` |
| `./docker.sh` | Construit et lance l'image Docker de production (voir [section 2](#2-docker)) |

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

## 2. Docker

L'application Next.js est livrée sous forme d'image Docker de production. La base
de données reste chez Supabase : le conteneur ne contient que le serveur Next.js,
qui appelle Supabase par HTTPS.

```
Navigateur ──► localhost:3000 (hôte) ──► conteneur web:3000 (node server.js) ──► Supabase (HTTPS)
```

### Fichiers

| Fichier | Rôle |
| --- | --- |
| [`Dockerfile`](./Dockerfile) | Build multi-étapes : dépendances → build → image d'exécution minimale |
| [`.dockerignore`](./.dockerignore) | Exclut du contexte `node_modules`, `.next`, `.git` et **tous les `.env*`** |
| [`compose.yaml`](./compose.yaml) | Construit et lance le service `web` sur le port 3000 |
| [`docker.sh`](./docker.sh) | Script de lancement : vérifie les prérequis, lance, attend que l'app réponde |
| `next.config.ts` | `output: "standalone"` : Next.js produit un serveur autonome sans `node_modules` complet |

### Lancer en une commande

Prérequis : Docker Engine 23+ avec Compose v2 (BuildKit activé par défaut), et un
`.env.local` rempli comme à l'**étape 5** ci-dessus (étapes 2 à 5 nécessaires, pas
besoin de `npm install`).

```bash
./docker.sh
```

Le script vérifie que Docker répond et que `.env.local` existe et n'est plus
l'exemple, construit l'image, démarre le conteneur, puis attend que le
`HEALTHCHECK` passe à `healthy`. L'application est alors sur
**http://localhost:3000**.

| Commande | Effet |
| --- | --- |
| `./docker.sh` ou `./docker.sh up` | Construit l'image `gabarit-next` et démarre le conteneur |
| `./docker.sh logs` | Suit les journaux du serveur |
| `./docker.sh down` | Arrête et supprime le conteneur |
| `./docker.sh scan` | Lance le scan Docker Scout de l'image |

### Sans le script

Avec Compose :

```bash
docker compose up --build -d
docker compose ps
docker compose down
```

Ou avec `docker build` / `docker run` :

```bash
docker build --secret id=env,src=.env.local -t gabarit-next .
docker run --rm -p 3000:3000 --read-only --tmpfs /app/.next/cache:uid=1000,gid=1000 gabarit-next
```

Après une modification du code, relancer `./docker.sh` : seules les étapes dont
les fichiers ont changé sont reconstruites.

### Le Dockerfile, étape par étape

| Étape | Image | Contenu |
| --- | --- | --- |
| `deps` | `node:22-alpine` | `COPY package.json package-lock.json` puis `npm ci` |
| `builder` | `node:22-alpine` | `node_modules` de `deps` + sources, puis `npm run build` |
| `runner` | `node:22-alpine` | Uniquement `.next/standalone`, `.next/static` et `public` |

- **`FROM node:22-alpine`** — Node 22 est la LTS en cours, Next.js 16 exige
  Node 20.9 minimum. La variante Alpine pèse environ 170 Mo, contre plus d'1 Go
  pour l'image `node:22` basée sur Debian.
- **`WORKDIR /app`** — crée le dossier et en fait le répertoire courant de toutes
  les instructions suivantes et du processus lancé.
- **`COPY package*.json` avant `COPY . .`** — Docker met chaque instruction en
  cache. Tant que les manifestes ne changent pas, la couche `npm ci` (la plus
  longue) est réutilisée, même si le code source change.
- **`--mount=type=cache,target=/root/.npm`** — le cache npm survit entre deux
  builds sans finir dans l'image.
- **Multi-étapes** — l'image finale repart de zéro et ne récupère que le résultat
  du build : pas de sources TypeScript, pas de `devDependencies`, pas de
  compilateur. Image finale : **environ 245 Mo**.
- **Suppression de npm / npx / yarn** dans `runner` — inutiles pour exécuter
  `node server.js`, ils embarquent leurs propres dépendances et donc leurs
  propres vulnérabilités.
- **`USER node`** — le serveur tourne avec l'utilisateur non-root (uid 1000)
  fourni par l'image officielle. Une faille dans l'application ne donne pas les
  droits root dans le conteneur.
- **`HOSTNAME=0.0.0.0`** — sans cela, le serveur standalone n'écoute que sur
  l'interface locale du conteneur et n'est pas joignable depuis l'hôte.
- **`HEALTHCHECK`** — Docker interroge `/robots.txt` toutes les 30 s ; le
  conteneur passe `healthy` quand le serveur répond. `fetch` est natif dans
  Node 22 : pas besoin d'installer `curl` dans l'image.
- **`CMD ["node", "server.js"]`** — serveur de production. `npm run dev` n'est
  jamais utilisé dans l'image.

### `EXPOSE` et `ports`

`EXPOSE 3000` dans le Dockerfile est **documentaire** : il indique sur quel port
l'application écoute dans le conteneur, mais n'ouvre rien. C'est `ports:
"3000:3000"` dans `compose.yaml` (ou `-p 3000:3000`) qui publie le port :
`<port de l'hôte>:<port du conteneur>`. Pour servir sur le port 8080 de la
machine : `"8080:3000"`.

### Variables d'environnement et secrets

Les trois variables du projet sont `NEXT_PUBLIC_*`. Next.js les **remplace par
leur valeur dans le code au moment du build**, côté client comme côté serveur :
elles sont donc nécessaires pendant `npm run build`, et plus du tout à
l'exécution (le conteneur fonctionne sans aucune variable).

Elles sont transmises par un **secret BuildKit** :

```dockerfile
RUN --mount=type=secret,id=env,target=/app/.env.production.local,required=true \
    npm run build
```

`.env.local` est monté en lecture seule le temps de cette seule commande, sous le
nom que Next.js lit au build. Il n'est écrit dans **aucune couche** de l'image et
n'apparaît pas dans `docker history`. Ce choix évite deux erreurs classiques :

- **`COPY .env`** — le fichier resterait dans une couche de l'image, lisible par
  quiconque récupère l'image. `.dockerignore` exclut de toute façon `.env*` du
  contexte de build.
- **`ARG` / `--build-arg`** — la valeur serait visible dans `docker history`.

Ces valeurs sont publiques par nature (la clé *publishable* est faite pour vivre
dans le navigateur, la RLS protège les données) ; la méthode reste celle qu'on
appliquerait à un vrai secret. **Aucune clé `service_role` / `sb_secret_…` n'est
utilisée.**

Conséquence à connaître : changer de projet Supabase impose de **reconstruire**
l'image, pas seulement de la relancer.

### Durcissement à l'exécution

Dans `compose.yaml` :

- `read_only: true` — le système de fichiers du conteneur est en lecture seule ;
- `tmpfs: /app/.next/cache` — seul dossier inscriptible, en mémoire, pour le
  cache d'optimisation d'images de Next.js (propriétaire `node`) ;
- `no-new-privileges` — un processus ne peut pas gagner de privilèges (setuid) ;
- `restart: unless-stopped` — relance automatique en cas de crash.

### Vérifier que l'image fonctionne

```bash
docker compose ps                                   # STATUS : Up (healthy)
curl -I http://localhost:3000                       # 307 vers /fr
docker history gabarit-next | grep -i supabase      # aucune ligne : pas de secret dans l'historique
docker run --rm --entrypoint id gabarit-next        # uid=1000(node) : non-root
```

Puis ouvrir http://localhost:3000 : la vitrine doit afficher « 14 machines ».

### Scan Docker Scout

Docker Scout est inclus dans Docker Desktop. Sur Docker Engine (Linux), installer
le plugin puis se connecter à Docker Hub (compte gratuit) :

```bash
curl -fsSL https://raw.githubusercontent.com/docker/scout-cli/main/install.sh -o install-scout.sh
sh install-scout.sh
docker login
```

Puis :

```bash
./docker.sh scan
```

ce qui revient à :

```bash
docker scout quickview gabarit-next:latest
docker scout cves --only-severity critical,high gabarit-next:latest
```

`quickview` résume les vulnérabilités par sévérité pour l'image et pour l'image de
base ; `cves` les détaille paquet par paquet, avec la version corrigée quand elle
existe. `docker scout recommendations gabarit-next:latest` propose une image de
base plus récente ou moins vulnérable.

**Résultat du scan** : à compléter après exécution (date, nombre de
vulnérabilités par sévérité, paquets concernés, corrections appliquées ou raison
de ne pas corriger).

### Usage de l'IA pour Docker

**Proposé par l'IA (Claude Code)** : le Dockerfile multi-étapes en mode
`standalone`, le `.dockerignore`, le `compose.yaml` et le script `docker.sh`.

**Vérifié à la main** :

- l'image se construit et le conteneur passe `healthy` ;
- toutes les zones répondent depuis le conteneur : vitrine FR / EN, catalogue
  (données Supabase réelles), redirection des pages protégées vers la connexion,
  route API JSON, optimisation d'images ;
- `docker history` ne contient aucune valeur de `.env.local`, et l'image ne
  contient aucun fichier `.env` ;
- le processus tourne en `uid=1000`, sans npm dans l'image ;
- le conteneur fonctionne **sans aucune variable d'environnement** à
  l'exécution, ce qui confirme que les `NEXT_PUBLIC_*` sont inlinées au build.

**Corrigé** : la première version de `compose.yaml` passait aussi `.env.local` au
conteneur via `env_file`. Le test ci-dessus a montré que c'était inutile — et
trompeur, puisque modifier ces variables sans reconstruire n'aurait eu aucun
effet. La ligne a été retirée.

### Limites

- L'image est liée à **un** projet Supabase, choisi au build (voir plus haut).
- Le build a besoin d'Internet : `next/font` télécharge les polices Google et le
  pré-rendu de la vitrine lit le catalogue Supabase. Un `Turbopack build failed`
  isolé vient en général d'une coupure réseau : relancer `./docker.sh`.
- Le cache de Next.js est en mémoire (`tmpfs`) : il repart de zéro à chaque
  redémarrage du conteneur. En production réelle on monterait un volume.
- Supabase n'est pas conteneurisé : c'est un service managé, comme en production.
- Image de base référencée par tag (`node:22-alpine`) et non par digest : un
  rebuild peut récupérer une version plus récente de Node 22.

---

## 3. Comptes de démonstration

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

## 4. Fonctionnalités

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

### Bilingue FR / EN
- Toutes les pages en français et en anglais, bouton FR / EN dans chaque barre de navigation
- URL par langue (`/fr/…`, `/en/…`), pré-rendues toutes les deux, balises `hreflang` et sitemap bilingue
- Messages d'erreur, validations de formulaire et catalogue de machines traduits

---

## 5. Choix d'architecture

### Route groups

```
app/
├─ [lang]/            fr ou en — premier segment de toute URL
│  ├─ (marketing)/    public, indexable, pré-rendu
│  ├─ (auth)/         entrée dans le produit
│  ├─ (onboarding)/   compte créé mais pas encore membre
│  ├─ (app)/          espace authentifié
│  └─ (admin)/        rôle distinct, accès protégé
└─ api/               contrat JSON pour la future app mobile
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

### Internationalisation

La langue est un segment dynamique, `app/[lang]/`, dont le layout racine déclare les deux valeurs dans `generateStaticParams` : chaque page est pré-rendue dans les deux langues. `proxy.ts` redirige une URL sans langue vers la langue mémorisée, sinon celle du navigateur.

Les textes vivent dans deux dictionnaires TypeScript (`lib/i18n/dictionaries`). Le dictionnaire anglais est typé sur le français : une traduction manquante fait échouer le build.

| Contexte | Lecture de la langue | Raison |
| --- | --- | --- |
| Server Component | `getI18n()` via `next/root-params` | aucun passage de prop nécessaire |
| Client Component | tranche du dictionnaire reçue en prop | `root-params` indisponible côté client |
| Server Action, garde d'accès | `getRequestI18n()` via un cookie posé par `proxy.ts` | `root-params` indisponible dans les actions |

Les heures sont construites et affichées explicitement en `Europe/Paris` : un serveur en UTC, comme sur Vercel, décalerait sinon chaque créneau.

---

## 6. Schéma de données

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

Les coordonnées GPS des ateliers servent à la géolocalisation de l'application
mobile.

---

## 7. Application mobile (React Native)

L'application mobile est dans un dépôt séparé :
<https://github.com/Franck2b/projet-fil-rouge-react-native>. Elle partage ce
backend Supabase : mêmes comptes, mêmes machines, mêmes crédits, mêmes règles
métier. Le site sert les usages « au bureau », l'app l'usage sur place, en
atelier :

- **Scan de QR code** — chaque machine porte un QR code. Le scanner déclare
  l'arrivée du membre : le serveur vérifie qu'une réservation confirmée couvre
  l'heure courante sur *cette* machine et enregistre la trace. C'est le chaînon
  manquant entre « avoir réservé » et « avoir réellement utilisé ».
- **Géolocalisation** — les ateliers sont classés du plus proche au plus loin, et
  un scan n'est accepté qu'à moins de 300 m de l'atelier.

La table des arrivées et ses fonctions SQL sont fournies par le dépôt mobile
(`supabase/0003_check_ins.sql`), à exécuter après les migrations de ce dépôt.

---

## 8. Usage de l'IA

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

## 9. Limites connues

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
- La **traduction anglaise du catalogue** (machines, ateliers) est tenue côté front, dans `lib/i18n/content.ts`, indexée par slug. C'est viable parce que le catalogue est fixe ; un catalogue éditable depuis le back-office imposerait de stocker les traductions en base.

# Pense-bête 

Version courte de [`GUIDE.md`](./GUIDE.md), centrée sur les demandes du PDF.
Le back (Supabase, fonctions SQL, RLS) ne bouge pas : on travaille côté Next.

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # erreurs TypeScript (dont traduction EN manquante)
npm run lint
grep -rn "texte" app components lib   # retrouver un texte ou un nom
```

## 1. Où est quoi

| Je cherche… | Fichier |
| --- | --- |
| Une page | `app/[lang]/(groupe)/chemin/page.tsx` |
| Le cadre et la garde d'un espace | `app/[lang]/(app\|admin\|onboarding)/layout.tsx` |
| Un formulaire (Client Component) | `components/<domaine>/*-form*.tsx` |
| Une mutation (Server Action) | `lib/actions/*.ts` |
| Une lecture de données | `lib/data/catalog.ts` (public, en cache) · `account.ts` · `admin.ts` |
| Une règle de validation | `lib/validation.ts` (zod) |
| Un texte affiché | `lib/i18n/dictionaries/fr.ts` **et** `en.ts` |
| Qui a le droit | `lib/auth.ts` : `requireViewer`, `requireOnboardedViewer`, `requireAdmin` |
| Redirection des anonymes | `proxy.ts` : `PROTECTED_PREFIXES` |
| Briques d'interface | `components/ui/` : `Button`, `Field`, `Input`, `Select`, `Alert`, `Badge`, `EmptyState`, `SubmitButton`, `Link` |
| Navigation de l'espace membre | `components/app/app-nav.tsx` |

## 2. Les demandes du PDF, une par une

### Ajouter un filtre via `searchParams`
`app/[lang]/(marketing)/equipements/page.tsx` — cherche `atelier` : partout où il
apparaît, ajoute ton paramètre.
1. Type `SearchParams` : `statut?: string`
2. Lecture : `{ categorie = "", atelier = "", q = "", statut = "" }`
3. Dans le `.filter()` : `if (statut && machine.status !== statut) return false;`
4. `hasFilters` : `|| statut`
5. Dans le `<form method="get">` : un `<Field>` + `<Select name="statut">`
6. Textes dans `fr.ts` et `en.ts`, à côté de `allWorkshops`
> Les filtres vivent dans l'URL : partageables, sans JavaScript, la page reste serveur.

### Ajouter une validation
`lib/validation.ts` — les schémas sont des fonctions qui reçoivent les messages traduits.
```ts
motivation: z.string().trim().min(20, m.experience),   // déjà en place
phone: phoneField(m),          // pour le rendre obligatoire : retirer .or(z.literal(""))
```
Nouveau message → `validation: { … }` dans `fr.ts` et `en.ts`.
L'affichage est **automatique** : `fieldErrors()` → `state.fieldErrors.champ` → `<Field error=…>`.

### Modifier une Server Action
`lib/actions/*.ts` — toutes suivent le même ordre :
```ts
const [viewer, { locale, t }] = await Promise.all([requireViewer(), getRequestI18n()]); // 1. qui
const parsed = schema(t.validation).safeParse({ champ: formData.get("champ") });       // 2. valider
if (!parsed.success) return failure(t.actions.checkFields, fieldErrors(parsed.error));
const supabase = await createSupabaseServerClient();                                   // 3. écrire
const { error } = await supabase.from("table").update({ … }).eq("id", viewer.userId);
if (error) return failure(t.actions.saveFailed);
revalidateLocalized("/page");                                                          // 4. rafraîchir
return success(t.actions.xxx);           // ou redirectTo(locale, "/page")
```
- Le `name` du champ HTML = la clé lue dans `formData.get("…")`.
- `redirectTo(locale, …)` et pas `redirect()` : il garde `/fr` ou `/en`.

### Ajouter un état loading / error / empty
- **Loading d'une page** : créer `loading.tsx` dans le dossier de la route
  (modèle : `app/[lang]/(app)/tableau-de-bord/loading.tsx`).
- **Loading d'une zone** : `<Suspense fallback={<Squelette />}>` autour du composant
  async (modèle : `CatalogSkeleton` dans `equipements/page.tsx`).
- **Vide** : `<EmptyState title="…" description="…" />`.
- **Erreur de formulaire** : `<Alert tone="error">{state.message}</Alert>`
  (modèle : `Feedback` dans `components/settings/settings-forms.tsx`).
- **Erreur de page** : `error.tsx` — **obligatoirement `"use client"`**, reçoit `error` et `reset`.
- **Bouton pendant l'envoi** : `<SubmitButton pendingLabel="Envoi…">` (utilise `useFormStatus`).

### Protéger une route
- Une page placée dans `(app)` est **déjà protégée** par son layout
  (`requireOnboardedViewer`) ; dans `(admin)`, par `requireAdmin`.
- Page isolée : en haut du composant serveur, `await requireViewer("/ma-page");`
  ou `await requireAdmin();`
- Confort en plus : ajouter le préfixe dans `PROTECTED_PREFIXES` (`proxy.ts`).
> `proxy.ts` redirige tôt, mais ce n'est pas la sécurité : la vraie garde est côté serveur, puis la RLS.

### Corriger une autorisation
- Le rôle se vérifie **côté serveur** (`requireAdmin()` dans la page **et** dans la Server Action).
- Masquer un bouton ne protège rien : l'action doit refaire la vérification.
- Une action admin sans `requireAdmin()` = la faille à corriger (modèle : `lib/actions/admin.ts`).

### Transformer un fetch client en fetch serveur
Avant (client) :
```tsx
"use client";
const [machines, setMachines] = useState([]);
useEffect(() => { fetch("/api/…").then((r) => r.json()).then(setMachines); }, []);
```
Après (serveur) :
```tsx
export default async function Page() {
  const machines = await getMachines();      // lib/data/catalog.ts, appel direct
  return <Liste machines={machines} />;      // si besoin d'interactivité : enfant "use client"
}
```
> Moins de JavaScript envoyé, pas d'état de chargement côté client, données jamais exposées.

### Expliquer une invalidation de cache
1. `getMachines()` (`lib/data/catalog.ts`) : `"use cache"` + `cacheTag("machines")` + `cacheLife("hours")`.
2. Un admin change une machine → `updateMachineAction` (`lib/actions/admin.ts`)
   → `revalidateCatalog()` (`lib/data/tags.ts`) → `updateTag("machines")`.
3. Le cache expire tout de suite : la vitrine affiche « en maintenance » sans attendre.
4. Pages liées à la session (jamais en cache) → `revalidateLocalized("/chemin")` (les deux langues).

## 3. Autres demandes probables

| Demande | Où |
| --- | --- |
| Ajouter un champ à un formulaire | composant `*-form*.tsx` + schéma `lib/validation.ts` + action + `fr.ts`/`en.ts` |
| Ajouter une page | nouveau dossier dans le bon groupe + `page.tsx` (+ `generateMetadata`) + lien dans `app-nav.tsx` |
| Ajouter un lien dans le menu | tableau `links` de `components/app/app-nav.tsx` |
| Changer un texte | `grep -rn "le texte" lib/i18n` → `fr.ts` et `en.ts` |
| Lire un paramètre d'URL `[slug]` | `const { slug } = await params;` puis `notFound()` si introuvable |
| Ajouter un badge | `<Badge tone="neutral\|rust\|moss\|amber\|brick">` (`components/ui/badge.tsx`) |

## 4. Pièges qui font perdre du temps

- `params` et `searchParams` sont des **Promises** : toujours `await`.
- **Liens** : importer `Link` depuis `@/components/ui/link` (il ajoute `/fr` ou `/en`), pas `next/link`.
- **Traduction** : clé ajoutée dans `fr.ts` mais pas `en.ts` → erreur TypeScript. C'est voulu.
- **Textes dans un Client Component** : `useState`, `useActionState`, `onClick` → `"use client"` en
  haut du fichier, et les textes arrivent en props (pas de `getI18n()` côté client).
- **Server Component** : `const { t } = await getI18n();`
- **Lire `searchParams` ou les cookies hors `<Suspense>`** → erreur au build ou en dev, à cause
  de `cacheComponents` : entourer le composant d'un `<Suspense>` (comme `MachineCatalog`).
- Les heures sont en `Europe/Paris` (`lib/booking.ts`, `lib/format.ts`).

## 5. Vocabulaire à placer

Server Component · Client Component · Server Action · Route Handler · route group ·
segment dynamique · `searchParams` · `useActionState` · `useFormStatus` · Suspense ·
`"use cache"` · `cacheTag` / `updateTag` · RLS · zod · `notFound()`

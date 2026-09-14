-- GABARIT · Row Level Security
-- Règle générale : le client anonyme ne lit que le contenu vitrine, un membre ne
-- voit que ses propres lignes, l'admin voit tout. Les écritures sensibles
-- (réservations, crédits) passent exclusivement par les fonctions SQL.

alter table workshops           enable row level security;
alter table machines            enable row level security;
alter table profiles            enable row level security;
alter table certifications      enable row level security;
alter table bookings            enable row level security;
alter table credit_transactions enable row level security;

-- ---------------------------------------------------------------- workshops

create policy "workshops publics en lecture"
  on workshops for select
  using (published or is_admin());

create policy "workshops gérés par l'admin"
  on workshops for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- machines

create policy "machines visibles publiquement"
  on machines for select
  using (
    is_admin()
    or (status <> 'retired' and exists (
      select 1 from workshops w where w.id = workshop_id and w.published
    ))
  );

create policy "machines gérées par l'admin"
  on machines for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- profiles

create policy "profil lisible par son propriétaire"
  on profiles for select
  using (id = auth.uid() or is_admin());

-- Le membre édite son profil mais ne peut ni se promouvoir admin
-- ni s'attribuer des crédits : les colonnes sensibles doivent rester identiques.
create policy "profil modifiable par son propriétaire"
  on profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from profiles p where p.id = auth.uid())
    and credits_balance = (select p.credits_balance from profiles p where p.id = auth.uid())
  );

create policy "profils gérés par l'admin"
  on profiles for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- certifications

create policy "habilitations lisibles par leur titulaire"
  on certifications for select
  using (user_id = auth.uid() or is_admin());

-- Une demande est toujours créée à l'état 'pending' pour soi-même.
create policy "demande d'habilitation par le membre"
  on certifications for insert
  with check (user_id = auth.uid() and status = 'pending');

create policy "habilitations arbitrées par l'admin"
  on certifications for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- bookings

create policy "réservations lisibles par leur auteur"
  on bookings for select
  using (user_id = auth.uid() or is_admin());

-- Aucune politique insert/update pour les membres : book_machine() et
-- cancel_booking() sont security definer et portent les vérifications métier.
create policy "réservations gérées par l'admin"
  on bookings for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- credits

create policy "historique de crédits lisible par son titulaire"
  on credit_transactions for select
  using (user_id = auth.uid() or is_admin());

create policy "crédits gérés par l'admin"
  on credit_transactions for all
  using (is_admin()) with check (is_admin());

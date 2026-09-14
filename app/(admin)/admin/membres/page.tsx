import { Suspense } from "react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/field";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { CreditAdjustForm } from "@/components/admin/credit-adjust-form";
import { getAdminMembers } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Membres · Back-office", robots: { index: false } };

type SearchParams = Promise<{ q?: string }>;

export default function AdminMembersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-8">
      <AdminHeader
        title="Membres"
        description="Consultation des comptes et ajustement manuel des crédits (achat de pack, geste commercial)."
      />

      <Suspense fallback={<div className="h-64 animate-pulse border border-bone/15 bg-ink/40" />}>
        <MemberList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function MemberList({ searchParams }: { searchParams: SearchParams }) {
  const { q = "" } = await searchParams;
  const members = await getAdminMembers(q.trim());

  return (
    <>
      <AdminPanel>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Field label="Rechercher un membre" htmlFor="q">
              <Input id="q" name="q" type="search" defaultValue={q} placeholder="Nom du membre" />
            </Field>
          </div>
          <Button type="submit">Rechercher</Button>
        </form>
      </AdminPanel>

      {members.length === 0 ? (
        <AdminPanel>
          <EmptyState
            title="Aucun membre trouvé"
            description="Aucun compte ne correspond à cette recherche."
          />
        </AdminPanel>
      ) : (
        <ul className="space-y-6">
          {members.map((member) => (
            <li key={member.id}>
              <AdminPanel>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg">{member.full_name || "Sans nom"}</h2>
                      {member.role === "admin" ? <Badge tone="rust">Admin</Badge> : null}
                      {!member.onboarding_completed ? (
                        <Badge tone="amber">Onboarding incomplet</Badge>
                      ) : null}
                    </div>
                    <p className="label-tech mt-2 text-kraft">
                      {member.workshop ? `${member.workshop.name} — ${member.workshop.city}` : "Sans atelier"}{" "}
                      · inscrit le {formatDateTime(member.created_at)}
                    </p>
                    {member.phone ? (
                      <p className="mt-1 text-sm text-ink-soft">{member.phone}</p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="label-tech text-kraft">Solde</p>
                    <p className="font-display text-3xl">{member.credits_balance}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <CreditAdjustForm memberId={member.id} />
                </div>
              </AdminPanel>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

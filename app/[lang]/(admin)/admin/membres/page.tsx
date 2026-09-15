import { Suspense } from "react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/field";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { CreditAdjustForm } from "@/components/admin/credit-adjust-form";
import { getAdminMembers } from "@/lib/data/admin";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.members.metaTitle, robots: { index: false } };
}

type SearchParams = Promise<{ q?: string }>;

export default async function AdminMembersPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <AdminHeader title={t.admin.members.title} description={t.admin.members.description} />

      <Suspense fallback={<div className="h-64 animate-pulse border border-bone/15 bg-ink/40" />}>
        <MemberList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function MemberList({ searchParams }: { searchParams: SearchParams }) {
  const [{ q = "" }, { locale, t }] = await Promise.all([searchParams, getI18n()]);
  const members = await getAdminMembers(q.trim());
  const copy = t.admin.members;

  return (
    <>
      <AdminPanel>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Field label={copy.search} htmlFor="q">
              <Input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder={copy.searchPlaceholder}
              />
            </Field>
          </div>
          <Button type="submit">{copy.submit}</Button>
        </form>
      </AdminPanel>

      {members.length === 0 ? (
        <AdminPanel>
          <EmptyState title={copy.emptyTitle} description={copy.emptyText} />
        </AdminPanel>
      ) : (
        <ul className="space-y-6">
          {members.map((member) => (
            <li key={member.id}>
              <AdminPanel>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg">{member.full_name || copy.unnamed}</h2>
                      {member.role === "admin" ? <Badge tone="rust">{copy.adminBadge}</Badge> : null}
                      {!member.onboarding_completed ? (
                        <Badge tone="amber">{copy.incompleteOnboarding}</Badge>
                      ) : null}
                    </div>
                    <p className="label-tech mt-2 text-kraft">
                      {member.workshop
                        ? `${member.workshop.name} — ${member.workshop.city}`
                        : copy.noWorkshop}{" "}
                      · {fill(copy.joinedOn, { date: formatDateTime(locale, member.created_at) })}
                    </p>
                    {member.phone ? (
                      <p className="mt-1 text-sm text-ink-soft">{member.phone}</p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="label-tech text-kraft">{copy.balance}</p>
                    <p className="font-display text-3xl">{member.credits_balance}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <CreditAdjustForm memberId={member.id} t={copy} />
                </div>
              </AdminPanel>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

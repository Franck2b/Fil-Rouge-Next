// Types du domaine, alignés sur supabase/migrations/0001_init.sql.
// Écrits à la main plutôt que générés : le schéma est petit et rester maître
// de ces types évite de dépendre d'une étape de génération pour builder.
// Les libellés affichés vivent dans les dictionnaires (lib/i18n/dictionaries).

export type UserRole = "member" | "admin";

export const MACHINE_CATEGORY_VALUES = [
  "laser",
  "impression_3d",
  "bois",
  "metal",
  "textile",
  "electronique",
] as const;

export type MachineCategory = (typeof MACHINE_CATEGORY_VALUES)[number];

export const MACHINE_STATUS_VALUES = ["available", "maintenance", "retired"] as const;
export type MachineStatus = (typeof MACHINE_STATUS_VALUES)[number];

export const BOOKING_STATUS_VALUES = ["pending", "confirmed", "cancelled", "completed"] as const;
export type BookingStatus = (typeof BOOKING_STATUS_VALUES)[number];

export type CertificationStatus = "pending" | "approved" | "rejected";

export type Workshop = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  opening: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
};

export type Machine = {
  id: string;
  workshop_id: string;
  slug: string;
  name: string;
  category: MachineCategory;
  status: MachineStatus;
  summary: string;
  description: string;
  image_url: string | null;
  hourly_credits: number;
  created_at: string;
};

export type MachineWithWorkshop = Machine & {
  workshop: Pick<Workshop, "id" | "slug" | "name" | "city"> | null;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  home_workshop_id: string | null;
  credits_balance: number;
  onboarding_completed: boolean;
  email_notifications: boolean;
  created_at: string;
};

export type Certification = {
  id: string;
  user_id: string;
  category: MachineCategory;
  status: CertificationStatus;
  motivation: string;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  machine_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  credits: number;
  project: string;
  created_at: string;
};

export type BookingWithMachine = Booking & {
  machine: (Machine & { workshop: Pick<Workshop, "slug" | "name" | "city"> | null }) | null;
};

export type CreditTransaction = {
  id: string;
  user_id: string;
  delta: number;
  reason: string;
  booking_id: string | null;
  created_at: string;
};

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUS_VALUES as readonly string[]).includes(value);
}

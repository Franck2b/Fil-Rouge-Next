// Types du domaine, alignés sur supabase/migrations/0001_init.sql.
// Écrits à la main plutôt que générés : le schéma est petit et rester maître
// de ces types évite de dépendre d'une étape de génération pour builder.

export type UserRole = "member" | "admin";

export type MachineCategory =
  | "laser"
  | "impression_3d"
  | "bois"
  | "metal"
  | "textile"
  | "electronique";

export type MachineStatus = "available" | "maintenance" | "retired";
export type CertificationStatus = "pending" | "approved" | "rejected";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

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

export const MACHINE_CATEGORIES: { value: MachineCategory; label: string; blurb: string }[] = [
  { value: "laser", label: "Découpe laser", blurb: "Découpe et gravure CO₂" },
  { value: "impression_3d", label: "Impression 3D", blurb: "FDM, du prototype à la petite série" },
  { value: "bois", label: "Bois", blurb: "Scie, toupie, CNC grand format" },
  { value: "metal", label: "Métal", blurb: "Tournage, fraisage, soudure" },
  { value: "textile", label: "Textile", blurb: "Piquage, broderie, coupe" },
  { value: "electronique", label: "Électronique", blurb: "Brasage, mesure, debug" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  MACHINE_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<MachineCategory, string>;

export const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  available: "Disponible",
  maintenance: "En maintenance",
  retired: "Retirée du parc",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

export const CERTIFICATION_STATUS_LABELS: Record<CertificationStatus, string> = {
  pending: "En cours d'examen",
  approved: "Validée",
  rejected: "Refusée",
};

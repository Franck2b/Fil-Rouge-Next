import { z } from "zod";
import { MACHINE_CATEGORIES } from "@/lib/types";

const CATEGORY_VALUES = MACHINE_CATEGORIES.map((c) => c.value) as [string, ...string[]];

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez au moins deux caractères."),
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

export const signInSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez votre nom complet."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9 +().-]{6,20}$/, "Numéro de téléphone invalide.")
    .or(z.literal("")),
});

export const onboardingProfileSchema = profileSchema.extend({
  homeWorkshopId: z.uuid("Choisissez un atelier de rattachement."),
});

export const preferencesSchema = z.object({
  homeWorkshopId: z.uuid("Choisissez un atelier de rattachement."),
  emailNotifications: z.boolean(),
});

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

export const certificationSchema = z.object({
  category: z.enum(CATEGORY_VALUES, "Choisissez une famille de machines."),
  motivation: z.string().trim().min(20, "Décrivez votre expérience (20 caractères minimum)."),
});

export const bookingSchema = z.object({
  machineId: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  startHour: z.coerce.number().int().min(8).max(21),
  duration: z.coerce.number().int().min(1).max(4),
  project: z.string().trim().max(140, "140 caractères maximum.").optional().default(""),
});

/** Transforme une erreur zod en dictionnaire champ → premier message. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

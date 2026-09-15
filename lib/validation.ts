import { z } from "zod";
import { MACHINE_CATEGORY_VALUES } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Les schémas sont des fonctions : leurs messages d'erreur dépendent de la
 * langue de la requête, connue seulement dans la Server Action qui valide.
 */
type Messages = Dictionary["validation"];

function phoneField(m: Messages) {
  return z
    .string()
    .trim()
    .regex(/^[0-9 +().-]{6,20}$/, m.phone)
    .or(z.literal(""));
}

export function signUpSchema(m: Messages) {
  return z.object({
    fullName: z.string().trim().min(2, m.minTwoChars),
    email: z.email(m.invalidEmail),
    password: z.string().min(8, m.passwordMin),
  });
}

export function signInSchema(m: Messages) {
  return z.object({
    email: z.email(m.invalidEmail),
    password: z.string().min(1, m.passwordRequired),
  });
}

export function profileSchema(m: Messages) {
  return z.object({
    fullName: z.string().trim().min(2, m.fullName),
    phone: phoneField(m),
  });
}

export function onboardingProfileSchema(m: Messages) {
  return profileSchema(m).extend({
    homeWorkshopId: z.uuid(m.homeWorkshop),
  });
}

export function preferencesSchema(m: Messages) {
  return z.object({
    homeWorkshopId: z.uuid(m.homeWorkshop),
    emailNotifications: z.boolean(),
  });
}

export function passwordSchema(m: Messages) {
  return z
    .object({
      password: z.string().min(8, m.passwordMin),
      confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
      path: ["confirm"],
      message: m.passwordsMismatch,
    });
}

export function certificationSchema(m: Messages) {
  return z.object({
    category: z.enum(MACHINE_CATEGORY_VALUES, m.family),
    motivation: z.string().trim().min(20, m.experience),
  });
}

export function bookingSchema(m: Messages) {
  return z.object({
    machineId: z.uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, m.invalidDate),
    startHour: z.coerce.number().int().min(8).max(21),
    duration: z.coerce.number().int().min(1).max(4),
    project: z.string().trim().max(140, m.max140).optional().default(""),
  });
}

/** Transforme une erreur zod en dictionnaire champ → premier message. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

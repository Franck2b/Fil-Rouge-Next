import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Ouvrez un compte Gabarit : 10 crédits offerts, accès aux trois ateliers et à leurs machines.",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <div>
      <p className="label-tech text-kraft">Nouveau membre</p>
      <h1 className="mt-3 text-3xl uppercase">Créer un compte</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Gratuit, sans engagement, avec 10 crédits pour démarrer votre premier projet.
      </p>

      <div className="mt-10">
        <SignUpForm />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-xs text-kraft">
        En créant un compte, vous acceptez le règlement intérieur des ateliers et le port des
        équipements de protection sur les postes concernés.
      </p>
    </div>
  );
}

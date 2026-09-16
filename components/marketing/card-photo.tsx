import Image from "next/image";
import { CARD_SIZES, type Photo } from "@/lib/images";

/** Photo en tête de carte, au format 3:2, dimensionnée pour une grille de 1 à 3 colonnes. */
export function CardPhoto({
  photo,
  alt,
  className = "",
}: {
  photo: Pick<Photo, "src" | "width" | "height">;
  alt: string;
  className?: string;
}) {
  return (
    <Image
      src={photo.src}
      alt={alt}
      width={photo.width}
      height={photo.height}
      sizes={CARD_SIZES}
      className={`aspect-[3/2] w-full object-cover ${className}`}
    />
  );
}

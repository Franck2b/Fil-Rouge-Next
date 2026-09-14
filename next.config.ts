import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components : les pages vitrine sont pré-rendues et mises en cache via
  // `use cache`, tandis que les zones dépendant de la session sont isolées dans
  // des <Suspense>. L'invalidation se fait par tag depuis le back-office.
  cacheComponents: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

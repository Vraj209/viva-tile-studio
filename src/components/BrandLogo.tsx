import Image from "next/image";
import { brandLogo } from "@/lib/brand";

interface BrandLogoProps {
  className?: string;
  eager?: boolean;
}

export default function BrandLogo({ className, eager = false }: BrandLogoProps) {
  return (
    <Image
      src={brandLogo.src}
      alt={brandLogo.alt}
      width={brandLogo.width}
      height={brandLogo.height}
      className={["brand-logo", className].filter(Boolean).join(" ")}
      loading={eager ? "eager" : "lazy"}
      unoptimized
    />
  );
}

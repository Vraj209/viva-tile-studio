import Image from "next/image";
import { brandLogo } from "@/lib/brand";

interface BrandLogoProps {
  className?: string;
  eager?: boolean;
  sizes?: string;
}

export default function BrandLogo({ className, eager = false, sizes = "(max-width: 768px) 100px, 106px" }: BrandLogoProps) {
  return (
    <Image
      src={brandLogo.src}
      alt={brandLogo.alt}
      width={brandLogo.width}
      height={brandLogo.height}
      className={["brand-logo", className].filter(Boolean).join(" ")}
      loading={eager ? "eager" : "lazy"}
      sizes={sizes}
    />
  );
}

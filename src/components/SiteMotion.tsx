"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { mountPageScroll, prepareRouteScroll } from "@/lib/scroll";
import { createSiteMotion } from "@/lib/site-motion";

export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => mountPageScroll(), []);
  useEffect(() => {
    const cleanup = createSiteMotion(document.body);
    const frame = requestAnimationFrame(prepareRouteScroll);
    return () => {
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [pathname]);

  return null;
}

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brandLogo } from "@/lib/brand";

const logoData = await readFile(
  join(process.cwd(), "public", brandLogo.src),
  "base64",
);
const logoSrc = `data:image/png;base64,${logoData}`;

export const alt = "VAVI Tile Studio — Bring Your Imagination Into Reality.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#d0c6ba",
        color: "#1c1a1a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 70,
      }}
    >
      {/* ImageResponse renders native images from the same transparent source. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={brandLogo.alt}
        width={Math.round((145 * brandLogo.width) / brandLogo.height)}
        height={145}
        style={{ objectFit: "contain" }}
      />
      <div
        style={{
          display: "flex",
          fontSize: 82,
          maxWidth: 850,
          fontFamily: "serif",
        }}
      >
        Bring Your Imagination Into Reality.
      </div>
      <div style={{ display: "flex", fontSize: 24 }}>
        CUSTOM TILE DESIGN — CREATED AROUND YOU
      </div>
    </div>,
    size,
  );
}

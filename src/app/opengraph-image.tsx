import { ImageResponse } from "next/og";
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
      <div style={{ display: "flex", fontSize: 36, letterSpacing: 6 }}>
        VAVI / TILE STUDIO
      </div>
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

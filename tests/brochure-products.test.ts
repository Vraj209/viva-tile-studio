import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { brochures } from "../src/lib/brochures";
import { brochureProducts, getBrochureProduct, getBrochureProductHotspot, getProductEnquiryHref } from "../src/lib/brochure-products";
import { interiorRooms } from "../src/lib/brochure-interiors";

const publicFile = (src: string) => path.join(process.cwd(), "public", src);

test("every depicted design resolves to its own product, including repeated catalogue scenes", () => {
  assert.equal(brochureProducts.length, 49);
  assert.equal(new Set(brochureProducts.map((item) => item.id)).size, 49);
  let mappedPages = 0;
  for (const brochure of brochures) {
    brochure.pages.forEach((_, pageIndex) => {
      const matches = brochureProducts.filter((product) => product.brochureId === brochure.id && product.pageNumbers.includes(pageIndex + 1));
      assert.equal(matches.length, brochure.id === "evoke" && pageIndex === 0 ? 0 : 1);
      if (matches.length) mappedPages++;
    });
  }
  assert.equal(mappedPages, 51);
  assert.equal(getBrochureProduct("evoke", 2)?.id, "evoke-10465");
  assert.equal(getBrochureProduct("evoke", 3)?.id, "evoke-10465");
  assert.equal(getBrochureProduct("evoke", 1)?.id, "evoke-10475");
  assert.equal(getBrochureProduct("evoke", 13)?.id, "evoke-10475");
  assert.equal(getBrochureProduct("evoke", -1), undefined);
  assert.equal(getBrochureProduct("evoke", 27), undefined);
  assert.equal(getBrochureProduct("unknown", 0), undefined);
});

test("product regions stay within their own page and dimensions come only from the printed source", () => {
  for (const product of brochureProducts) {
    const brochure = brochures.find((item) => item.id === product.brochureId)!;
    assert.ok(brochure);
    assert.ok(product.pageNumbers.includes(product.sourcePage));
    assert.equal(product.sourcePdf, brochure.pdf);
    assert.equal(product.format, product.brochureId === "evoke" ? "1200 × 2400 mm" : null);
    for (const page of product.pageNumbers) {
      assert.ok(page > 0 && page <= brochure.pageCount);
      const region = getBrochureProductHotspot(product, page - 1);
      assert.ok(region.x >= 0 && region.y >= 0 && region.width > 0 && region.height > 0);
      assert.ok(region.x + region.width <= 1 && region.y + region.height <= 1);
    }
  }
});

test("the exact texture files match the extraction manifest and have their declared dimensions", async () => {
  const manifest = JSON.parse(readFileSync(publicFile("/brochures/products/manifest.json"), "utf8"));
  for (const product of brochureProducts) {
    const file = publicFile(product.texture);
    const entry = manifest.products.find((item: { id: string }) => item.id === product.id);
    assert.ok(entry);
    const bytes = readFileSync(file);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.textureSha256);
    assert.equal(bytes.length, entry.textureBytes);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, product.textureWidth);
    assert.equal(metadata.height, product.textureHeight);
    if (product.originalInterior) assert.ok(existsSync(publicFile(product.originalInterior.src)));
  }
  assert.deepEqual(brochureProducts.filter((item) => item.originalInterior).map((item) => item.id), ["evoke-10465"]);
});

test("each room provides a real background and an undistorted portrait installation surface", async () => {
  for (const room of Object.values(interiorRooms)) {
    assert.ok(room.mobile, `${room.label} needs a portrait composition`);
    for (const composition of [room, ...(room.mobile ? [room.mobile] : [])]) {
      const image = await sharp(publicFile(composition.src)).metadata();
      assert.equal(image.width, composition.width);
      assert.equal(image.height, composition.height);
      const { x, y, width, height } = composition.surface;
      assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= 1 && y + height <= 1);
      assert.ok(Math.abs(width * composition.width / (height * composition.height) - 0.5) < .002);
    }
  }
});

test("enquiries carry the selected product and environment through the existing form route", () => {
  for (const product of brochureProducts) {
    for (const environment of ["home", "hotel", "office"] as const) {
      const url = new URL(getProductEnquiryHref(product, environment), "https://example.test");
      assert.equal(url.pathname, "/");
      assert.equal(url.hash, "#enquiry");
      assert.equal(url.searchParams.get("product"), product.id);
      assert.equal(url.searchParams.get("application"), "Feature wall");
      assert.equal(url.searchParams.get("projectType"), { home: "Residential", hotel: "Hospitality", office: "Commercial" }[environment]);
    }
  }
});

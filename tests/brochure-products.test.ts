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
const surfaceStudiesProductsByPage = new Map([
  [3, 10465],
  [5, 10465], [6, 10469], [7, 10471], [8, 10474],
  [9, 10475], [10, 10478], [11, 10485], [12, 10488],
  [14, 10467], [15, 10472], [16, 10479], [17, 10481],
  [18, 10482], [19, 10483], [20, 10484], [21, 10486],
  [23, 10466], [24, 10468], [25, 10470], [26, 10473],
  [27, 10476], [28, 10477], [29, 10480], [30, 10487],
]);

test("every depicted design resolves to its own product, including repeated catalogue scenes", () => {
  assert.equal(brochureProducts.length, 49);
  assert.equal(new Set(brochureProducts.map((item) => item.id)).size, 49);
  let mappedPages = 0;
  for (const brochure of brochures) {
    brochure.pages.forEach((_, pageIndex) => {
      const matches = brochureProducts.filter((product) => product.brochureId === brochure.id && product.pageNumbers.includes(pageIndex + 1));
      const expected = brochure.id === "surface-studies" ? Number(surfaceStudiesProductsByPage.has(pageIndex + 1)) : 1;
      assert.equal(matches.length, expected, `${brochure.title}, page ${pageIndex + 1}`);
      if (matches.length) mappedPages++;
    });
  }
  assert.equal(mappedPages, 50);
  for (const [page, code] of surfaceStudiesProductsByPage) {
    assert.equal(getBrochureProduct("surface-studies", page - 1)?.id, `surface-studies-${code}`);
  }
  assert.equal(getBrochureProduct("surface-studies", -1), undefined);
  assert.equal(getBrochureProduct("surface-studies", 32), undefined);
  assert.equal(getBrochureProduct("unknown", 0), undefined);
});

test("product regions stay within their own page and unconfirmed dimensions remain unspecified", () => {
  for (const product of brochureProducts) {
    const brochure = brochures.find((item) => item.id === product.brochureId)!;
    assert.ok(brochure);
    assert.ok(product.pageNumbers.includes(product.sourcePage));
    assert.equal(product.sourcePdf, brochure.pdf);
    assert.equal(product.format, null);
    for (const page of product.pageNumbers) {
      assert.ok(page > 0 && page <= brochure.pageCount);
      const region = getBrochureProductHotspot(product, page - 1);
      assert.ok(region.x >= 0 && region.y >= 0 && region.width > 0 && region.height > 0);
      assert.ok(region.x + region.width <= 1 && region.y + region.height <= 1);
    }
  }
});

test("Surface Studies details open the new product page and preserve the separate room hotspot", () => {
  const products = brochureProducts.filter((product) => product.brochureId === "surface-studies");
  assert.equal(products.length, 24);
  for (const product of products) {
    assert.equal(product.sourcePdf, "/brochures/surface-studies/catalogue.pdf");
    assert.equal(`surface-studies-${surfaceStudiesProductsByPage.get(product.sourcePage)}`, product.id);
    assert.notEqual(product.sourcePage, 3, "Details must link to the product study, not the room photograph");
    assert.deepEqual(getBrochureProductHotspot(product, product.sourcePage - 1), product.hotspot);
    const link = new URL(`${product.sourcePdf}#page=${product.sourcePage}`, "https://example.test");
    assert.equal(link.hash, `#page=${product.sourcePage}`);
  }
  const repeatedProduct = getBrochureProduct("surface-studies", 2)!;
  assert.equal(repeatedProduct.id, "surface-studies-10465");
  assert.notDeepEqual(getBrochureProductHotspot(repeatedProduct, 2), repeatedProduct.hotspot);
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
  assert.deepEqual(brochureProducts.filter((item) => item.originalInterior).map((item) => item.id), ["surface-studies-10465"]);
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

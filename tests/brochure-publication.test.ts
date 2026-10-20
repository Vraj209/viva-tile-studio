import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { brochures } from "../src/lib/brochures";
import { brochureProducts } from "../src/lib/brochure-products";
import publication from "../public/brochures/surface-studies/publication.json";

const publicFile = (src: string) => path.join(process.cwd(), "public", src);
const removedBrand = /\bevoke\b|\beton\b/i;

function filesWithin(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesWithin(file) : [file];
  });
}

test("the first library edition uses the complete VAVI publication", () => {
  const brochure = brochures[0];
  assert.deepEqual(brochure, publication.brochure);
  assert.equal(brochure.id, "surface-studies");
  assert.equal(brochure.title, "Surface Studies");
  assert.equal(brochure.status, "ready");
  assert.equal(brochure.pageCount, 32);
  assert.equal(brochure.pages.length, 32);
  assert.equal(brochure.cover, brochure.pages[0].src);
  assert.equal(brochure.pdf, "/brochures/surface-studies/catalogue.pdf");
  assert.equal(readFileSync(publicFile(brochure.pdf)).subarray(0, 5).toString(), "%PDF-");
  assert.equal(new Set(brochure.pages.map((page) => page.src)).size, 32);
  assert.equal(new Set(brochure.pages.map((page) => page.thumbnail)).size, 32);
});

test("all new viewer pages and thumbnails exist at the declared proportions", async () => {
  const brochure = brochures[0];
  for (const [index, page] of brochure.pages.entries()) {
    assert.match(page.src, /^\/brochures\/surface-studies\//);
    assert.match(page.thumbnail, /^\/brochures\/surface-studies\//);
    assert.ok(page.alt.length > 20, `Page ${index + 1} needs descriptive alternative text`);
    const image = await sharp(publicFile(page.src)).metadata();
    assert.equal(image.width, page.width);
    assert.equal(image.height, page.height);
    assert.equal(page.width, brochure.width);
    assert.equal(page.height, brochure.height);
    const thumbnail = await sharp(publicFile(page.thumbnail)).metadata();
    assert.ok(thumbnail.width && thumbnail.height);
    assert.ok(Math.abs(thumbnail.width / thumbnail.height - page.width / page.height) < 0.01);
  }
});

test("website content and public brochure metadata contain no previous branding", () => {
  assert.doesNotMatch(JSON.stringify({ brochures, brochureProducts, publication }), removedBrand);
  for (const file of filesWithin(path.join(process.cwd(), "src"))) {
    if (/\.(tsx?|css|json)$/.test(file)) {
      assert.doesNotMatch(readFileSync(file, "utf8"), removedBrand, file);
    }
  }
  for (const file of filesWithin(publicFile("/brochures"))) {
    assert.doesNotMatch(path.relative(publicFile("/brochures"), file), removedBrand, file);
    if (file.endsWith(".json")) assert.doesNotMatch(readFileSync(file, "utf8"), removedBrand, file);
  }
});

test("product images and source links stay inside the new publication", () => {
  const products = brochureProducts.filter((product) => product.brochureId === "surface-studies");
  for (const product of products) {
    assert.match(product.texture, /^\/brochures\/(?:products\/surface-studies-|surface-studies\/)/);
    assert.ok(existsSync(publicFile(product.texture)));
    assert.equal(product.sourcePdf, brochures[0].pdf);
    if (product.originalInterior) {
      assert.match(product.originalInterior.src, /^\/brochures\/(?:products\/surface-studies-|surface-studies\/)/);
      assert.ok(existsSync(publicFile(product.originalInterior.src)));
    }
  }
});

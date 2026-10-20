/**
 * Original VAVI publication. The source PDF supplies image streams only.
 * Usage: node scripts/build-vavi-brochure.cjs
 * Optional: VAVI_PYTHON, VAVI_NODE_MODULES for alternate dependency runtimes.
 * Chromium prints the site's exact local WOFF2 fonts; no font substitutions.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS asset build tool. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const runtime = path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies");
const python = process.env.VAVI_PYTHON || path.join(runtime, "python/python.exe");
const packages = process.env.VAVI_NODE_MODULES || path.join(runtime, "node/node_modules");
const { chromium } = require(path.join(packages, "playwright"));
const sharp = require(path.join(root, "node_modules/sharp"));
const work = path.join(root, "work/vavi-brochure");
const out = path.join(root, "public/brochures/surface-studies");
const deliverable = path.join(root, "output/pdf/vavi-surface-studies.pdf");
const W = 595, H = 842;
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const asset = relative => pathToFileURL(path.join(root, relative)).href;
const panel = code => asset(`public/brochures/products/surface-studies-${code}.webp`);
const room = asset("public/brochures/products/surface-studies-10465-interior.jpg");
const logo = asset("public/images/logo-transparent.png");
const chapterData = [
  {
    title: "Botanical studies", lines: ["Botanical", "studies."],
    intro: "Leaves, branches and flowers. Natural forms arranged as complete, expressive compositions.",
    codes: [10465, 10469, 10471, 10474, 10475, 10478, 10485, 10488],
    start: 5, divider: 4, hero: 10475,
  },
  {
    title: "Rhythm & geometry", lines: ["Rhythm &", "geometry."],
    intro: "Circles, lines and repeating planes. A study in balance, movement and the spaces between.",
    codes: [10467, 10472, 10479, 10481, 10482, 10483, 10484, 10486],
    start: 14, divider: 13, hero: 10481,
  },
  {
    title: "Ornament & contrast", lines: ["Ornament &", "contrast."],
    intro: "Intricate pattern meets open space. Warm tones, dark grounds and finely drawn ornament.",
    codes: [10466, 10468, 10470, 10473, 10476, 10477, 10480, 10487],
    start: 23, divider: 22, hero: 10476,
  },
];
// Visual descriptions, not material, fabrication, finish or performance claims.
const descriptions = {
  10465: "Terracotta-toned leaves and clusters of small flowers.",
  10466: "Symmetrical scrollwork in warm brown and gold tones.",
  10467: "Rust-coloured circles set against a blue ground.",
  10468: "Golden floral medallions on a deep brown ground.",
  10469: "Golden foliage and butterflies on a pale ground.",
  10470: "Grey ornament layered with geometric pattern.",
  10471: "Fine golden botanical motifs across an ivory ground.",
  10472: "A patchwork of blue, rust and ornamental detail.",
  10473: "A circular gold-toned motif framed by dark borders.",
  10474: "Flowing golden leaves against soft grey tones.",
  10475: "Curling branches with small blue flowers.",
  10476: "Copper-toned ornament arranged over deep teal.",
  10477: "Sweeping floral shapes in warm brown tones.",
  10478: "Pale botanical forms on a mottled grey ground.",
  10479: "Golden medallions across blue and brown patches.",
  10480: "Ivory scrollwork within a terracotta-toned border.",
  10481: "Grey geometric forms defined by fine parallel lines.",
  10482: "A patchwork of botanical and geometric motifs.",
 10483: "Overlapping circular forms in pale timber tones.",
 10484: "Angular golden ornament on a dark ground.",
 10485: "Four slender golden leaves on a charcoal ground.",
 10486: "Layered geometric forms in cream and brown.",
 10487: "Fine pale ornament across a golden ground.",
 10488: "An intricate composition of ivory botanical scrolls.",
};
const pages = [], products = [], hotspots = {};
function box(x, y, w, h) {
  return `left:${x}pt;top:${y}pt;width:${w}pt;${h ? `height:${h}pt;` : ""}`;
}
function image(src, x, y, w, h, extra = "") {
  const code = src.match(/surface-studies-(\d+)\.webp/)?.[1];
  const alt = code ? `Design ${code}. ${descriptions[code]}` : src === logo
    ? "VAVI Tile Studio" : "Design 10465 shown beside a timber door and an ivory console in the supplied collection interior.";
  return `<img class="placed" src="${src}" style="${box(x,y,w,h)}${extra}" alt="${alt}">`;
}
function text(content, x, y, w, className = "", extra = "") {
  return `<div class="placed ${className}" style="${box(x,y,w)}${extra}">${content}</div>`;
}
function footer(number, label = "Surface Studies") {
  return text("VAVI TILE STUDIO", 42, 797, 160, "folio") +
    text(label, 235, 797, 230, "folio") +
    text(String(number).padStart(2,"0"), 510, 795, 43, "folio", "text-align:right");
}
function page(number, html, alt, cls = "") {
  pages.push({ number, html: `<section class="page ${cls}" data-page="${number}">${html}</section>`, alt });
}
function productBox(pageNo) {
  // Three deliberately paced layouts. Full panel always retains its 1:2 ratio.
  if (pageNo % 3 === 0) return {x: 159.5, y: 126, width: 276, height: 552, layout: "center"};
  if (pageNo % 3 === 1) return {x: 42, y: 128, width: 288, height: 576, layout: "left"};
  return {x: 265, y: 128, width: 288, height: 576, layout: "right"};
}
function region({x,y,width,height}) {
  return { x:x/W, y:y/H, width:width/W, height:height/H };
}
function compose() {
  page(1,
    image(logo, 42, 30, 56, 64) +
    text("VAVI TILE STUDIO", 365, 54, 188, "brand", "text-align:right") +
    text("Surface<br><em>Studies.</em>", 42, 113, 510, "cover-title") +
    image(room, 210, 324, 343, 430, "object-fit:cover;object-position:center 43%;") +
    text("A collection of<br>decorative surfaces.", 42, 545, 155, "intro-note") +
    text("FORM<br>TEXTURE<br>COMPOSITION", 42, 683, 150, "cover-index") +
    text("From imagination to your space.", 42, 793, 430, "folio"),
    "VAVI Tile Studio Surface Studies cover, with a terracotta-toned botanical panel in a supplied interior.");
  page(2,
    text("A surface.<br><em>A point of view.</em>", 42, 73, 510, "heading") +
    text("A wall can give a room its character. This VAVI selection brings together botanical forms, geometric rhythms and richly detailed ornament.", 44, 256, 350, "body") +
    text("Explore each composition as a whole. Notice its palette, the direction of its lines and the way light and shadow are represented.", 44, 339, 350, "body") +
    text("In this publication", 44, 493, 350, "small-heading") +
    chapterData.map((c,i) =>
      text(`${c.title}<span>${String(c.divider).padStart(2,"0")}</span>`,44,541+i*47,507,"contents")
    ).join("") +
    text("Selection notes",44,682,507,"contents") + text("31",515,682,36,"body","text-align:right") +
    footer(2),
    "Introduction and contents for Surface Studies, with three visual chapters and selection notes.");
  page(3,
    text("In a space.", 42, 48, 480, "section-heading") +
    image(room, 102, 123, 391, 553) +
    text("Design 10465", 102, 696, 391, "small-heading") +
    text("A botanical composition alongside timber and pale stone tones.<br>Supplied collection interior; shown for visual reference.", 102, 723, 391, "caption") +
    footer(3),
    "Design 10465 shown in the supplied interior beside a timber entrance door and an ivory console.");
  hotspots["surface-studies-10465"] = {
    "3": region({x:102 + 391*.336, y:123 + 553*.03, width:391*.518, height:553*.774}),
  };
  for (const chapter of chapterData) {
    page(chapter.divider,
      text(chapter.lines[0] + "<br><em>" + chapter.lines[1] + "</em>",42,90,511,"heading") +
      text(chapter.intro,44,290,278,"body") +
      image(panel(chapter.hero), 377, 405, 140, 280) +
      text("Eight compositions.<br>One visual language.",44,616,260,"intro-note") +
      footer(chapter.divider,chapter.title),
      `${chapter.title} chapter introduction with a complete image of Design ${chapter.hero}.`,
      "chapter");
    chapter.codes.forEach((code,index) => {
      const n = chapter.start + index;
      const b = productBox(n);
      let html = text(chapter.title,42,46,420,"chapter-label");
      html += image(panel(code), b.x,b.y,b.width,b.height);
      if (b.layout === "center") {
        html += text(`Design ${code}`,42,705,511,"product-title");
        html += text(descriptions[code],43,750,510,"caption");
      } else {
        const x = b.layout === "right" ? 42 : 365;
        html += text("DESIGN",x,160,188,"brand");
        html += text(`${code}`,x,186,188,"code");
        html += text(descriptions[code],x,275,180,"body");
        html += text("Complete composition",x,654,180,"caption");
      }
      html += footer(n);
      page(n,html,`Design ${code}. ${descriptions[code]} Complete panel shown in its original proportions.`);
      const id = `surface-studies-${code}`;
      const product = {
        id, brochureId:"surface-studies", name:`Design ${code}`, collection:"Surface Studies",
        description:descriptions[code],
        pageNumbers:code === 10465 ? [3,n] : [n],
        texture:`/brochures/products/${id}.webp`, textureWidth:383, textureHeight:766,
        format:null, sourcePdf:"/brochures/surface-studies/catalogue.pdf", sourcePage:n,
        hotspot:region(b),
      };
      if (code === 10465) product.originalInterior = {
        src:"/brochures/products/surface-studies-10465-interior.jpg",width:794,height:1123,
        alt:"Supplied collection interior showing Design 10465 beside a timber door and an ivory console.",
      };
      products.push(product);
    });
  }
  page(31,
    text("Begin with<br><em>the details.</em>",42,74,510,"heading") +
    text("Bring the design reference and a little context about your space. The studio can help you take the next step.",44,259,425,"body") +
    text("For your selection",44,384,460,"small-heading") +
    text("Share your preferred design, wall measurements and a photograph or drawing of the space.",44,423,420,"body") +
    text("To be confirmed with VAVI",44,523,460,"small-heading") +
    text("Dimensions, finish, thickness, availability and suitability for the intended installation require confirmation for each design.",44,563,420,"body") +
    text("Images are visual references. Confirm colour and surface character with a sample before specifying. Chapter names describe visual themes; design numbers identify the artwork.",44,680,452,"caption") +
    footer(31),
    "Selection notes: dimensions, finish, thickness, availability and installation suitability require confirmation with VAVI.");
  page(32,
    image(logo,250,95,95,108) +
    text("From imagination<br><em>to your space.</em>",42,286,511,"back-heading","text-align:center") +
    text("Start a conversation with VAVI Tile Studio.",65,468,465,"body","text-align:center") +
    text('<a href="mailto:info@vavitilestudio.com">info@vavitilestudio.com</a><br><a href="tel:+12268878592">226-887-8592</a>',65,548,465,"contact","text-align:center") +
    text("SURFACE STUDIES",42,776,511,"brand","text-align:center"),
    "VAVI Tile Studio back cover with studio email and phone contact.");
}

async function main() {
  fs.mkdirSync(work,{recursive:true});
  fs.mkdirSync(out,{recursive:true});
  fs.mkdirSync(path.dirname(deliverable),{recursive:true});
  const extracted = spawnSync(python,[path.join(__dirname,"extract-vavi-brochure-images.py")],{cwd:root,encoding:"utf8"});
  if (extracted.status !== 0) throw new Error(extracted.stderr || extracted.stdout);
  console.log(extracted.stdout.trim());
  compose();
  pages.sort((a,b)=>a.number-b.number);
  const fonts = [
    ["Cormorant","node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2","normal"],
    ["Cormorant","node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2","italic"],
    ["Manrope","node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2","normal"],
  ].map(([name,file,style])=>`@font-face{font-family:${name};src:url("${asset(file)}") format("woff2");font-style:${style};font-weight:${name==="Manrope"?"200 800":"400"};font-display:block}`).join("\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Surface Studies | VAVI Tile Studio</title><style>
${fonts}
@page{size:595pt 842pt;margin:0}
*{box-sizing:border-box}html,body{margin:0;padding:0;color:#1c1a1a;font-family:Manrope,Arial,sans-serif}
body{background:#d0c6ba;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:595pt;height:842pt;background:#eae4da;position:relative;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}.placed{position:absolute;margin:0}img{object-fit:contain}
.brand{font-size:8pt;letter-spacing:1.2pt;line-height:1.7;font-weight:500}
.cover-title{font:400 88pt/.89 Cormorant,serif;letter-spacing:-2.8pt;color:#303c32}
em{font-family:Cormorant,serif;font-weight:400}
.heading{font:400 62pt/1.02 Cormorant,serif;letter-spacing:-1.1pt;color:#303c32}
.section-heading{font:400 45pt/1.1 Cormorant,serif;color:#303c32}
.back-heading{font:400 55pt/1.08 Cormorant,serif;color:#303c32;letter-spacing:-.6pt}
.body{font-size:11pt;line-height:1.8;letter-spacing:-.1pt}
.intro-note{font:400 19pt/1.35 Cormorant,serif;color:#303c32}
.cover-index{font-size:7pt;line-height:1.9;letter-spacing:1.3pt;color:#57534d}
.folio{font-size:7pt;letter-spacing:.6pt;line-height:1.5;color:#57534d}
.small-heading{font-size:10pt;line-height:1.5;font-weight:600;color:#303c32}
.contents{font-size:12pt;line-height:1.5}.contents span{float:right}
.caption{font-size:8.5pt;line-height:1.7;color:#57534d}
.chapter-label{font-size:9pt;letter-spacing:.5pt;color:#57534d}
.code{font:400 43pt/1.1 Cormorant,serif;color:#303c32}
.product-title{font:400 31pt/1.15 Cormorant,serif;color:#303c32}
.chapter{background:#e1dbcf}.contact{font-size:13pt;line-height:2.4;color:#303c32}
a{color:inherit;text-decoration:none}
@media screen{.page{margin:24px auto;box-shadow:0 8px 25px #1c1a1a22}}
</style></head><body>${pages.map(p=>p.html).join("\n")}</body></html>`;
  const htmlFile = path.join(work,"surface-studies.html");
  fs.writeFileSync(htmlFile,html);
  const browser = await chromium.launch({headless:true,channel:"msedge"});
  try {
    const tab = await browser.newPage({viewport:{width:1100,height:1250},deviceScaleFactor:1});
    await tab.goto(pathToFileURL(htmlFile).href);
    await tab.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
    const errors = await tab.evaluate(()=>[...document.querySelectorAll(".page .placed")].flatMap(el=>{
      const b=el.getBoundingClientRect(),p=el.closest(".page").getBoundingClientRect();
      return b.left<p.left-.5||b.right>p.right+.5||b.bottom>p.bottom+.5||b.top<p.top-.5 ? [el.textContent||el.src] : [];
    }));
    if(errors.length) throw new Error(`Page overflow: ${JSON.stringify(errors)}`);
    await tab.pdf({path:deliverable,printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
  } finally {await browser.close();}
  fs.copyFileSync(deliverable,path.join(out,"catalogue.pdf"));
  // Render the actual PDF, so viewer pages and downloaded content are identical.
  const prefix=path.join(work,"render");
  const rendered=spawnSync("pdftoppm",["-scale-to","1800","-png",deliverable,prefix],{encoding:"utf8",windowsHide:true});
  if(rendered.status!==0)throw new Error(rendered.stderr);
  const renderedFiles=fs.readdirSync(work).filter(n=>/^render-\d+\.png$/.test(n)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
  if(renderedFiles.length!==pages.length)throw new Error("PDF page count mismatch");
  const metadata=[];
  for(let i=0;i<pages.length;i++){
    const p=pages[i],num=String(p.number).padStart(3,"0"),src=path.join(work,renderedFiles[i]);
    const info=await sharp(src).metadata();
    await sharp(src).webp({quality:92,effort:6}).toFile(path.join(out,`page-${num}.webp`));
    await sharp(src).resize({height:360}).webp({quality:86,effort:5}).toFile(path.join(out,`thumb-${num}.webp`));
    metadata.push({src:`/brochures/surface-studies/page-${num}.webp`,alt:`Surface Studies, page ${p.number}. ${p.alt}`,thumbnail:`/brochures/surface-studies/thumb-${num}.webp`,width:info.width,height:info.height});
  }
  const publication={
    brochure:{id:"surface-studies",title:"Surface Studies",subtitle:"Form, texture & composition",description:"An original VAVI Tile Studio publication exploring botanical forms, geometric rhythms and intricate ornament.",format:"Decorative surfaces",pageCount:32,width:metadata[0].width,height:metadata[0].height,cover:metadata[0].src,pdf:"/brochures/surface-studies/catalogue.pdf",status:"ready",sourceIssue:null,pages:metadata},
    products,hotspots,
  };
  fs.writeFileSync(path.join(out,"publication.json"),JSON.stringify(publication,null,2)+"\n");
  // Retain a source audit privately; public manifests contain neutral provenance.
  const manifestPath=path.join(root,"public/brochures/products/manifest.json");
  const previous=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
  const provenance=JSON.parse(fs.readFileSync(path.join(work,"image-provenance.json"),"utf8"));
  const other=previous.products.filter(p=>p.id.startsWith("artful-surfaces")||p.id.startsWith("new-poster")).map(p=>{
    const entry={...p}; delete entry.source; return entry;
  });
  fs.writeFileSync(manifestPath,JSON.stringify({generator:"scripts/build-vavi-brochure.cjs + scripts/prepare-brochure-products.py",products:[...provenance.products,...other]},null,2)+"\n");
  fs.writeFileSync(path.join(out,"manifest.json"),JSON.stringify({
    title:"Surface Studies",publisher:"VAVI Tile Studio",pageCount:32,
    pdfSha256:hash(fs.readFileSync(deliverable)),imageTreatment:"Lossless panel extraction; original interior JPEG stream; no generative edits.",
    productInformation:"Design reference identifiers only. Dimensions, finishes, thickness, availability and suitability require confirmation.",
    renderLongEdge:1800,
  },null,2)+"\n");
  const libraryManifestPath = path.join(root,"public/brochures/manifest.json");
  const libraryManifest = JSON.parse(fs.readFileSync(libraryManifestPath,"utf8"));
  const retainedSources = libraryManifest.sources
    .filter(source=>["artful-surfaces","new-poster"].includes(source.id))
    .map(source=>{
      const entry={...source}; delete entry.source; delete entry.sourceUrl; return entry;
    });
  fs.writeFileSync(libraryManifestPath,JSON.stringify({
    generator:"scripts/build-vavi-brochure.cjs + scripts/prepare-brochure-assets.py",
    renderLongEdge:1800,
    sources:[{id:"surface-studies",title:"Surface Studies",pageCount:32,
      publication:"VAVI Tile Studio",sha256:hash(fs.readFileSync(deliverable))},...retainedSources],
  },null,2)+"\n");
  console.log(`Created ${pages.length} pages, ${products.length} products. PDF: ${fs.statSync(deliverable).size} bytes.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});

import { Resvg } from "@resvg/resvg-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  markerBox,
  parseMatrix,
  shiftMarker,
  shiftY,
  spaceContent,
} from "./mushaf-lines.mjs";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const SOURCE_DIR =
  process.env.MUSHAF_SOURCE ??
  path.join(os.homedir(), "Desktop/maab-unused-assets/mushaf-source");
const SOURCE = path.join(SOURCE_DIR, "pages");
const IMAGES = path.join(ROOT, "assets/images/mushaf");
const META = path.join(ROOT, "src/features/quran/_data/chunks/pageMeta");
const TITLES = JSON.parse(
  fs.readFileSync(path.join(SOURCE_DIR, "titles.json"), "utf8"),
);
const WIDTH = 1600;
const only = process.argv.slice(2).map(Number).filter(Boolean);

const pad = (n) => String(n).padStart(3, "0");
const round = (n) => Math.round(n * 100) / 100;

function boxesOf(d) {
  return d
    .split("M")
    .map((part) => (part.match(/-?\d+(\.\d+)?/g) ?? []).map(Number))
    .filter((nums) => nums.length >= 4)
    .map((nums) => {
      const xs = nums.filter((_, i) => i % 2 === 0);
      const ys = nums.filter((_, i) => i % 2 === 1);
      return [
        Math.min(...xs),
        Math.min(...ys),
        Math.max(...xs),
        Math.max(...ys),
      ];
    });
}

function titlesOf(page, polygons) {
  const printed = page > 2 ? TITLES[page] : null;
  const all = polygons.flatMap(boxesOf);
  if (!printed || !all.length) return [];
  const heights = all
    .map((b) => b[3] - b[1])
    .filter((h) => h > 20 && h < 50)
    .sort((a, b) => a - b);
  const line = heights[Math.floor(heights.length / 2)] ?? 36;
  const x0 = Math.min(...all.map((b) => b[0]));
  const x1 = Math.max(...all.map((b) => b[2]));
  return printed.map(([surah, , ny0, , ny1]) => {
    const height = Math.min(line * 0.95, (ny1 - ny0) * 1.5);
    const center = (ny0 + ny1) / 2;
    return [
      surah,
      round(x0),
      round(shiftY(center) - height / 2),
      round(x1 - x0),
      round(height),
    ];
  });
}

function split(svg, page) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const spaced = page > 2;
  const matrix = parseMatrix(svg);
  const transform = svg.match(/<g transform="([^"]+)">/)[1];
  const markersStart = svg.indexOf('<g id="ayah_markers"');
  const contentStart = svg.indexOf('<g id="content"');
  const markersXml = svg.slice(markersStart, contentStart);
  const polygons = [
    ...svg.matchAll(/<path[^>]*class="ayahPolygon"[^>]*>/g),
  ].map((m) => m[0].match(/\sd="([^"]+)"/)[1]);
  const ds = [];
  const markers = [
    ...markersXml.matchAll(
      /<g transform="([^"]+)"[^>]*>\s*<path d="([^"]+)"([^>]*)\/>/g,
    ),
  ].map(([, t, d, rest]) => {
    let index = ds.indexOf(d);
    if (index < 0) index = ds.push(d) - 1;
    const transform = spaced ? shiftMarker(matrix, t, d) : t;
    const [x0, y0, x1, y1] = markerBox(matrix, transform, d);
    return [
      transform,
      index,
      /evenodd/.test(rest) ? 1 : 0,
      round(x0),
      round(y0),
      round(x1 - x0),
      round(y1 - y0),
    ];
  });
  if (spaced) {
    const height = Number(viewBox.split(/\s+/)[3]);
    const text = spaceContent(svg, height);
    return {
      viewBox: text.viewBox,
      transform,
      ds,
      markers,
      polygons,
      textSvg: text.textSvg,
      ambiguous: text.ambiguous,
    };
  }
  const textSvg = (svg.slice(0, markersStart) + svg.slice(contentStart))
    .replace(/<path[^>]*class="ayahPolygon"[^>]*\/>/g, "")
    .replace(/#231f20/gi, "#000000");
  return { viewBox, transform, ds, markers, polygons, textSvg, ambiguous: 0 };
}

fs.mkdirSync(IMAGES, { recursive: true });
fs.mkdirSync(META, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mushaf-"));
const files = fs
  .readdirSync(SOURCE)
  .filter((f) => f.endsWith(".svg"))
  .sort();
let imageBytes = 0;
let ambiguousTotal = 0;

for (const file of files) {
  const page = Number(file.slice(0, 3));
  if (only.length && !only.includes(page)) continue;
  const svg = fs.readFileSync(path.join(SOURCE, file), "utf8");
  const { viewBox, transform, ds, markers, polygons, textSvg, ambiguous } =
    split(svg, page);
  ambiguousTotal += ambiguous;
  const png = new Resvg(textSvg, {
    fitTo: { mode: "width", value: WIDTH },
    background: "rgba(0,0,0,0)",
  })
    .render()
    .asPng();
  const pngPath = path.join(tmp, `${pad(page)}.png`);
  const webpPath = path.join(IMAGES, `${pad(page)}.webp`);
  fs.writeFileSync(pngPath, png);
  execFileSync("cwebp", [
    "-quiet",
    "-lossless",
    "-z",
    "6",
    "-mt",
    pngPath,
    "-o",
    webpPath,
  ]);
  imageBytes += fs.statSync(webpPath).size;
  fs.writeFileSync(
    path.join(META, `${pad(page)}.json`),
    JSON.stringify({
      viewBox,
      transform,
      ds,
      markers,
      titles: titlesOf(page, polygons),
    }),
  );
}

if (!only.length) {
  const pages = files.map((f) => f.slice(0, 3));
  fs.writeFileSync(
    path.join(META, "index.ts"),
    [
      'import type { PageMeta } from "../../pageMeta";',
      "",
      "const chunks: (() => PageMeta)[] = [",
      ...pages.map((p) => `  () => require("./${p}.json") as PageMeta,`),
      "];",
      "",
      "export default chunks;",
      "",
    ].join("\n"),
  );
  fs.writeFileSync(
    path.join(ROOT, "src/features/quran/_data/pageImages.ts"),
    [
      "export const PAGE_IMAGES = [",
      ...pages.map((p) => `  require("@/assets/images/mushaf/${p}.webp"),`),
      "];",
      "",
    ].join("\n"),
  );
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(
  `rendered ${only.length || files.length} pages, ${(imageBytes / 1048576).toFixed(1)} MB of images, ${ambiguousTotal} line assignments decided by distance`,
);

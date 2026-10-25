import { Resvg } from "@resvg/resvg-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const SOURCE_DIR =
  process.env.MUSHAF_SOURCE ??
  path.join(os.homedir(), "Desktop/maab-unused-assets/mushaf-source");
const SOURCE = path.join(SOURCE_DIR, "frames");
const OUT = path.join(ROOT, "assets/images/surah-frames");
const DATA = path.join(ROOT, "src/features/quran/_data/frameImages.ts");
const WIDTH = 1400;

fs.mkdirSync(OUT, { recursive: true });
const files = fs
  .readdirSync(SOURCE)
  .filter((f) => /^frame-\d+\.svg$/.test(f))
  .sort();

for (const file of files) {
  const name = file.replace(".svg", "");
  const svg = fs.readFileSync(path.join(SOURCE, file), "utf8");
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
    background: "rgba(0,0,0,0)",
  })
    .render()
    .asPng();
  const tmp = path.join(os.tmpdir(), `${name}.png`);
  fs.writeFileSync(tmp, png);
  execFileSync("cwebp", [
    "-quiet",
    "-q",
    "88",
    "-alpha_q",
    "100",
    tmp,
    "-o",
    path.join(OUT, `${name}.webp`),
  ]);
  fs.rmSync(tmp);
}

const lines = files.map(
  (f) =>
    `  require("@/assets/images/surah-frames/${f.replace(".svg", ".webp")}"),`,
);
fs.writeFileSync(
  DATA,
  `export const FRAME_IMAGES: number[] = [\n${lines.join("\n")}\n];\n`,
);
console.log(`rendered ${files.length} frames`);

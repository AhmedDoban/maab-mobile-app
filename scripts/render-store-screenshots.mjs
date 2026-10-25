import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const Jimp = createRequire(import.meta.url)("jimp-compact");

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const RAW = process.env.STORE_SCREENS ?? path.join(ROOT, "store-screens");
const OUT = process.env.STORE_OUT ?? ROOT;
const FONTS = path.join(ROOT, "assets/fonts");

const SCREENS = [
  "home-dark-en",
  "home-light-ar",
  "mushaf-page",
  "hadith-dark-en",
  "quran-light-ar",
  "quran-dark-en",
  "fatiha-light",
  "qibla-dark-en",
];

const SLIDES = [
  {
    ar: "مواقيت الصلاة والأذكار",
    en: "Prayer times & daily adhkar",
    badge: "Light · Dark",
  },
  { ar: "المصحف الشريف", en: "The Madinah Mushaf, page by page" },
  { ar: "حديث كل يوم", en: "A hadith every day, offline" },
  {
    ar: "بالعربية والإنجليزية",
    en: "Fully in Arabic & English",
    badge: "AR · EN",
  },
  { ar: "القرآن والقبلة دون إنترنت", en: "Quran & qibla, no internet needed" },
];

const PHONES = [
  { screen: "home-dark-en", x: 20, y: 470, w: 600 },
  { screen: "home-light-ar", x: 430, y: 580, w: 690 },
  { screen: "mushaf-page", x: 1650, y: 340, w: 1000 },
  { screen: "hadith-dark-en", x: 2590, y: 580, w: 650 },
  { screen: "quran-light-ar", x: 3210, y: 540, w: 600 },
  { screen: "quran-dark-en", x: 3685, y: 620, w: 650 },
  { screen: "fatiha-light", x: 4320, y: 567, w: 520 },
  { screen: "qibla-dark-en", x: 4765, y: 620, w: 620 },
];

const STORES = [
  { dir: "google-play-screenshots", slideW: 1080, slideH: 1920 },
  { dir: "app-store-screenshots", slideW: 1320, slideH: 2868 },
];

const INK = "#0e3a33";
const GRAY = "#4b5a57";
const GOLD = "#b8924f";
const PILL = "#0e3a33";
const TILT = 5;

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const rawFile = (name) => {
  for (const ext of [".png", ".jpg", ".jpeg"]) {
    const file = path.join(RAW, name + ext);
    if (fs.existsSync(file)) return file;
  }
  return null;
};

const dataUri = (file) => {
  const type = file.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;
};

const imageSize = (file) => {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  let i = 2;
  while (i < buf.length) {
    const marker = buf.readUInt16BE(i);
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xffc0 && marker <= 0xffc3) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error(`Unknown image size: ${file}`);
};

const arabicText = (str, x, y, size, color) =>
  `<text x="${x}" y="${y}" font-family="Lama Sans" font-size="${size}" fill="${color}" stroke="${color}" stroke-width="${size * 0.05}" text-anchor="middle" direction="rtl">${esc(str)}</text>`;

const latinText = (str, x, y, size, color, weight = 400) =>
  `<text x="${x}" y="${y}" font-family="Space Grotesk" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="middle" letter-spacing="${size * 0.02}">${esc(str)}</text>`;

function phone(file, x, y, w, s, id) {
  const size = imageSize(file);
  const pw = w * s;
  const ph = pw * (size.h / size.w);
  const bezel = pw * 0.032;
  const r = pw * 0.12;
  const px = x;
  const py = y;
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  return `<g transform="rotate(${TILT} ${cx} ${cy})">
<rect x="${px - bezel}" y="${py - bezel}" width="${pw + bezel * 2}" height="${ph + bezel * 2}" rx="${r + bezel}" fill="#0b100f"/>
<rect x="${px - bezel * 0.6}" y="${py - bezel * 0.6}" width="${pw + bezel * 1.2}" height="${ph + bezel * 1.2}" rx="${r + bezel * 0.6}" fill="none" stroke="#2f3a37" stroke-width="${bezel * 0.25}"/>
<clipPath id="${id}"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${r}"/></clipPath>
<image href="${dataUri(file)}" x="${px}" y="${py}" width="${pw}" height="${ph}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
</g>`;
}

function panorama(store, files) {
  const kx = store.slideW / 1080;
  const ky = store.slideH / 1920;
  const s = (kx + ky) / 2;
  const W = store.slideW * SLIDES.length;
  const H = store.slideH;
  const parts = [
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f3e8"/><stop offset="1" stop-color="#eef1ea"/></linearGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>`,
  ];
  SLIDES.forEach((slide, i) => {
    const cx = store.slideW * (i + 0.5);
    parts.push(
      `<circle cx="${cx}" cy="${-420 * s}" r="${900 * s}" fill="#f0e2bf" opacity="0.35"/>`,
      `<circle cx="${cx}" cy="${-420 * s}" r="${900 * s}" fill="none" stroke="${GOLD}" stroke-opacity="0.18" stroke-width="${2 * s}"/>`,
      arabicText(slide.ar, cx, 170 * s, 84 * s, INK),
      latinText(slide.en, cx, 245 * s, 36 * s, GRAY),
      `<rect x="${cx - 32 * s}" y="${282 * s}" width="${64 * s}" height="${5 * s}" rx="${2.5 * s}" fill="${GOLD}"/>`,
    );
    if (slide.badge) {
      const bw = (slide.badge.length * 19 + 56) * s;
      parts.push(
        `<rect x="${cx - bw / 2}" y="${330 * s}" width="${bw}" height="${62 * s}" rx="${31 * s}" fill="${PILL}"/>`,
        latinText(slide.badge, cx, 372 * s, 30 * s, "#ffffff", 700),
      );
    }
  });
  PHONES.forEach((p, i) => {
    parts.push(phone(files[p.screen], p.x * kx, p.y * ky, p.w, s, `p${i}`));
  });
  return {
    W,
    H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("\n")}</svg>`,
  };
}

function featureGraphic(files) {
  const w = 1024;
  const h = 500;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f3e8"/><stop offset="1" stop-color="#eef1ea"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<circle cx="760" cy="-120" r="420" fill="none" stroke="${GOLD}" stroke-opacity="0.2" stroke-width="2"/>
${arabicText("راحة للقلب", 250, 205, 64, INK)}
${arabicText("وطمأنينة للروح", 250, 290, 64, INK)}
<rect x="60" y="322" width="90" height="5" rx="2.5" fill="${GOLD}"/>
${latinText("Adhkar · Quran · Hadith · Prayer · Qibla", 260, 380, 26, GRAY)}
${phone(files["home-dark-en"], 560, 150, 190, 1, "f0")}
${phone(files["mushaf-page"], 760, 80, 230, 1, "f1")}
</svg>`;
}

const fontOptions = {
  loadSystemFonts: false,
  fontFiles: [
    "LamaSans-Regular.ttf",
    "LamaSans-ExtraBold.ttf",
    "SpaceGrotesk-Regular.ttf",
    "SpaceGrotesk-Bold.ttf",
  ].map((f) => path.join(FONTS, f)),
  defaultFontFamily: "Space Grotesk",
};

const renderPng = (svg) =>
  new Resvg(svg, { font: fontOptions }).render().asPng();

const files = Object.fromEntries(SCREENS.map((name) => [name, rawFile(name)]));
const missing = SCREENS.filter((name) => !files[name]);
if (missing.length) {
  console.error(
    `Missing screenshots in store-screens/ (.png or .jpg): ${missing.join(", ")}`,
  );
  process.exit(1);
}

for (const store of STORES) {
  const out = path.join(OUT, store.dir);
  fs.mkdirSync(out, { recursive: true });
  const { W, H, svg } = panorama(store, files);
  const full = path.join(out, "panorama-full.png");
  fs.writeFileSync(full, renderPng(svg));
  const panoramaImage = await Jimp.read(full);
  for (let i = 0; i < SLIDES.length; i++) {
    await panoramaImage
      .clone()
      .crop(store.slideW * i, 0, store.slideW, H)
      .writeAsync(path.join(out, `${String(i + 1).padStart(2, "0")}.png`));
  }
  await panoramaImage
    .clone()
    .resize(2400, Jimp.AUTO)
    .quality(88)
    .writeAsync(path.join(out, "panorama-preview.jpg"));
  console.log(`${store.dir}: ${SLIDES.length} slides, panorama ${W}x${H}`);
}

fs.writeFileSync(
  path.join(OUT, "google-play-screenshots/feature-graphic.png"),
  renderPng(featureGraphic(files)),
);
console.log("feature graphic 1024x500");

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const RAW = process.env.STORE_SCREENS ?? path.join(ROOT, "store-screens");
const OUT = process.env.STORE_OUT ?? ROOT;
const FONTS = path.join(ROOT, "assets/fonts");

const SLIDES = [
  {
    ar: "مواقيت الصلاة وأذكار يومك",
    en: "Prayer times & your daily adhkar",
    phones: ["home-ar"],
  },
  {
    ar: "المصحف الشريف",
    en: "The Madinah Mushaf, page by page",
    phones: ["mushaf-ar"],
  },
  { ar: "حديث كل يوم", en: "A hadith every day", phones: ["hadith-ar"] },
  { ar: "اتجاه القبلة", en: "Find the qibla anywhere", phones: ["qibla-ar"] },
  {
    ar: "أذان لكل صلاة",
    en: "Choose an adhan for each prayer",
    phones: ["adhan-ar", "prayer-ar"],
  },
  {
    ar: "ألوان وإطارات تناسبك",
    en: "Themes, colors and surah frames",
    phones: ["appearance-ar", "frames-ar"],
  },
  {
    ar: "بتسع لغات",
    en: "Available in 9 languages",
    badge: "9 LANGUAGES",
    phones: ["language-ar"],
  },
  {
    ar: "يعمل دون إنترنت",
    en: "Works offline, privacy first",
    phones: ["settings-ar", "sources-ar"],
  },
];

const SCREENS = [...new Set(SLIDES.flatMap((slide) => slide.phones))];

const STORES = [{ dir: "google-play-screenshots", slideW: 1080, slideH: 1920 }];

const INK = "#0e3a33";
const GRAY = "#4b5a57";
const GOLD = "#b8924f";
const PILL = "#0e3a33";

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

function phone(file, x, y, w, tilt, id) {
  const size = imageSize(file);
  const ph = w * (size.h / size.w);
  const bezel = w * 0.032;
  const r = w * 0.12;
  const cx = x + w / 2;
  const cy = y + ph / 2;
  return `<g transform="rotate(${tilt} ${cx} ${cy})">
<rect x="${x - bezel}" y="${y - bezel}" width="${w + bezel * 2}" height="${ph + bezel * 2}" rx="${r + bezel}" fill="#0b100f"/>
<rect x="${x - bezel * 0.6}" y="${y - bezel * 0.6}" width="${w + bezel * 1.2}" height="${ph + bezel * 1.2}" rx="${r + bezel * 0.6}" fill="none" stroke="#2f3a37" stroke-width="${bezel * 0.25}"/>
<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${ph}" rx="${r}"/></clipPath>
<image href="${dataUri(file)}" x="${x}" y="${y}" width="${w}" height="${ph}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
</g>`;
}

function slideSvg(store, slide, files) {
  const W = store.slideW;
  const H = store.slideH;
  const s = W / 1080;
  const cx = W / 2;
  const top = (slide.badge ? 430 : 360) * s;
  const parts = [
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f3e8"/><stop offset="1" stop-color="#eef1ea"/></linearGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>`,
    `<circle cx="${cx}" cy="${-420 * s}" r="${900 * s}" fill="#f0e2bf" opacity="0.35"/>`,
    `<circle cx="${cx}" cy="${-420 * s}" r="${900 * s}" fill="none" stroke="${GOLD}" stroke-opacity="0.18" stroke-width="${2 * s}"/>`,
    arabicText(slide.ar, cx, 170 * s, 84 * s, INK),
    latinText(slide.en, cx, 245 * s, 36 * s, GRAY),
    `<rect x="${cx - 32 * s}" y="${282 * s}" width="${64 * s}" height="${5 * s}" rx="${2.5 * s}" fill="${GOLD}"/>`,
  ];
  if (slide.badge) {
    const bw = (slide.badge.length * 19 + 56) * s;
    parts.push(
      `<rect x="${cx - bw / 2}" y="${330 * s}" width="${bw}" height="${62 * s}" rx="${31 * s}" fill="${PILL}"/>`,
      latinText(slide.badge, cx, 372 * s, 30 * s, "#ffffff", 700),
    );
  }
  const room = H - top - 60 * s;
  if (slide.phones.length === 1) {
    const w = Math.min(640 * s, room / (2340 / 1080));
    parts.push(phone(files[slide.phones[0]], cx - w / 2, top, w, 0, "p0"));
  } else {
    const w = Math.min(470 * s, room / (2340 / 1080));
    const y = top + Math.max(0, (room - w * (2340 / 1080) - 80 * s) / 2);
    parts.push(
      phone(files[slide.phones[1]], cx - w * 0.02, y + 80 * s, w, 6, "p1"),
      phone(files[slide.phones[0]], cx - w * 0.92, y, w, -4, "p0"),
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("\n")}</svg>`;
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
${phone(files["home-ar"], 590, 115, 168, 5, "f0")}
${phone(files["mushaf-ar"], 790, 45, 196, 5, "f1")}
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
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  SLIDES.forEach((slide, i) => {
    fs.writeFileSync(
      path.join(out, `${String(i + 1).padStart(2, "0")}.png`),
      renderPng(slideSvg(store, slide, files)),
    );
  });
  console.log(
    `${store.dir}: ${SLIDES.length} slides at ${store.slideW}x${store.slideH}`,
  );
}

fs.writeFileSync(
  path.join(OUT, "google-play-screenshots/feature-graphic.png"),
  renderPng(featureGraphic(files)),
);
console.log("feature graphic 1024x500");

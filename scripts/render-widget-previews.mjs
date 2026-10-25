import { Resvg } from "@resvg/resvg-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const RES = path.join(ROOT, "modules/prayer-widgets/android/src/main/res");
const FONTS = path.join(ROOT, "assets/fonts");
const S = 3;
const MID = "#18766F";
const DEEP = "#0B3A36";
const INK = "#0E3A33";
const MINT = "#DFF3EA";
const ARC = "#4FD1A1";

const COPY = {
  en: {
    rtl: false,
    font: "Space Grotesk",
    sep: " · ",
    next: "Next prayer",
    today: "Prayer times",
    dhikr: "Dhikr of the day",
    left: "Left",
    hour: "hr",
    minute: "min",
    city: "Cairo",
    date: "Wednesday, 3 Jumada al-Ula 1448",
    dhikrText: ["I seek forgiveness from Allah", "and turn to Him in repentance"],
    names: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
  },
  ar: {
    rtl: true,
    font: "Lama Sans",
    sep: "، ",
    next: "الصلاة القادمة",
    today: "مواقيت الصلاة",
    dhikr: "ذكر اليوم",
    left: "متبقي",
    hour: "ساعة",
    minute: "دقيقة",
    city: "القاهرة",
    date: "الأربعاء، 3 جمادى الأولى 1448",
    dhikrText: ["أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ"],
    names: ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"],
  },
};
const TIMES = ["4:52", "11:52", "3:12", "5:38", "6:55"];
const ICONS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const NEXT = 2;

const iconPaths = Object.fromEntries(
  ["fajr", "dhuhr", "asr", "maghrib", "isha", "calendar", "location"].map(
    (name) => {
      const xml = fs.readFileSync(
        path.join(RES, `drawable/widget_ic_${name}.xml`),
        "utf8",
      );
      const paths = [...xml.matchAll(/android:pathData="([^"]+)"/g)].map(
        (m) => m[1],
      );
      return [name, paths];
    },
  ),
);

const dataUri = (file, type) =>
  `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;

const decorPng = path.join(os.tmpdir(), "widget_decor.png");
execFileSync("dwebp", [
  "-quiet",
  path.join(RES, "drawable-nodpi/widget_decor.webp"),
  "-o",
  decorPng,
]);
const DECOR = dataUri(decorPng, "image/png");
const MOSQUE = dataUri(
  path.join(RES, "drawable-nodpi/widget_mosque.jpg"),
  "image/jpeg",
);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function canvas(w, h) {
  const parts = [];
  const c = {
    w,
    h,
    add: (s) => parts.push(s),
    svg: () =>
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w * S}" height="${h * S}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MID}"/><stop offset="1" stop-color="${DEEP}"/></linearGradient>
<clipPath id="card"><rect width="${w}" height="${h}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#card)">${parts.join("\n")}</g></svg>`,
  };
  return c;
}

function background(c, solid) {
  c.add(
    `<rect width="${c.w}" height="${c.h}" fill="${solid ? DEEP : "url(#bg)"}"/>`,
  );
  if (!solid) {
    c.add(
      `<image href="${DECOR}" x="0" y="0" width="${c.w}" height="${c.h}" preserveAspectRatio="xMidYMid slice"/>`,
    );
  }
}

function text(c, copy, str, x, y, o = {}) {
  const size = o.size ?? 12;
  const weight = o.bold && !copy.rtl ? 700 : 400;
  const color = o.color ?? "#fff";
  const faux =
    o.bold && copy.rtl
      ? ` stroke="${color}" stroke-opacity="${o.opacity ?? 1}" stroke-width="${size * 0.045}"`
      : "";
  const anchor = o.anchor ?? "start";
  const dir = copy.rtl ? ` direction="rtl"` : "";
  c.add(
    `<text x="${x}" y="${y}" font-family="${copy.font}" font-size="${size}" font-weight="${weight}" fill="${color}" fill-opacity="${o.opacity ?? 1}" text-anchor="${anchor}"${dir}${faux}>${esc(str)}</text>`,
  );
}

function icon(c, name, x, y, size, color, opacity = 1) {
  const k = size / 24;
  const paths = iconPaths[name]
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
  c.add(
    `<g transform="translate(${x} ${y}) scale(${k})" opacity="${opacity}">${paths}</g>`,
  );
}

const startX = (c, copy, x) => (copy.rtl ? c.w - x : x);
const endAnchor = (copy) => (copy.rtl ? "start" : "end");

function chip(c, copy, label, cx, y, width) {
  c.add(
    `<rect x="${cx - width / 2}" y="${y}" width="${width}" height="22" rx="11" fill="${MINT}"/>`,
  );
  text(c, copy, label, cx, y + 15, {
    size: 12,
    bold: true,
    color: INK,
    anchor: "middle",
  });
}

function arch(c, x, y, w, h) {
  const spring = Math.min(w * 0.75, h * 0.45);
  const d = `M${x} ${y + h}L${x} ${y + spring}C${x} ${y + spring * 0.6} ${x + w * 0.24} ${y + spring * 0.32} ${x + w / 2} ${y}C${x + w * 0.76} ${y + spring * 0.32} ${x + w} ${y + spring * 0.6} ${x + w} ${y + spring}L${x + w} ${y + h}Z`;
  c.add(`<clipPath id="arch"><path d="${d}"/></clipPath>`);
  c.add(
    `<g clip-path="url(#arch)"><image href="${MOSQUE}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/><rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h * 0.45}" fill="#0D3630" fill-opacity="0.45"/></g>`,
  );
  c.add(
    `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1.5"/>`,
  );
}

function cell(c, copy, i, x, y, w, h, o) {
  const isNext = i === NEXT;
  const passed = i < NEXT;
  const color = isNext ? INK : "#fff";
  const opacity = passed ? 0.55 : 1;
  if (isNext) {
    c.add(
      `<rect x="${x + 2}" y="${y}" width="${w - 4}" height="${h}" rx="16" fill="${MINT}"/>`,
    );
  } else if (o.tile) {
    c.add(
      `<rect x="${x + 3}" y="${y}" width="${w - 6}" height="${h}" rx="16" fill="#fff" fill-opacity="0.12"/>`,
    );
  }
  const cx = x + w / 2;
  if (o.iconFirst) {
    icon(c, ICONS[i], cx - 9, y + 10, 18, color, opacity);
    text(c, copy, copy.names[i], cx, y + 45, {
      size: 11,
      color,
      opacity: opacity * (isNext ? 1 : 0.85),
      anchor: "middle",
    });
    text(c, copy, TIMES[i], cx, y + 62, {
      size: 14,
      bold: true,
      color,
      opacity,
      anchor: "middle",
    });
  } else {
    text(c, copy, copy.names[i], cx, y + 17, {
      size: 11,
      color,
      opacity,
      anchor: "middle",
    });
    text(c, copy, TIMES[i], cx, y + 34, {
      size: 13,
      bold: true,
      color,
      opacity,
      anchor: "middle",
    });
    icon(c, ICONS[i], cx - 7.5, y + 40, 15, color, opacity);
  }
}

function order(copy) {
  const idx = [0, 1, 2, 3, 4];
  return copy.rtl ? idx.reverse() : idx;
}

function nextPrayer(copy) {
  const c = canvas(320, 170);
  background(c);
  const archW = (320 - 12) * 0.26;
  const archX = copy.rtl ? 12 : 320 - 12 - archW;
  arch(c, archX, 12, archW, 170 - 12);
  const left = copy.rtl ? archW + 24 : 12;
  const right = copy.rtl ? 320 - 12 : 320 - archW - 24;
  const sx = (x) => (copy.rtl ? right - x : left + x);
  const anchor = copy.rtl ? "end" : "start";

  icon(c, "calendar", copy.rtl ? sx(0) - 13 : sx(0), 10, 13, "#fff", 0.85);
  text(c, copy, `${copy.date}`, copy.rtl ? sx(18) : sx(18), 21, {
    size: 10.5,
    opacity: 0.85,
    anchor,
  });

  text(c, copy, copy.next, sx(0), 46, { size: 11, opacity: 0.75, anchor });
  text(c, copy, copy.names[NEXT], sx(0), 72, {
    size: 22,
    bold: true,
    anchor,
  });
  const cdX = copy.rtl ? left + 8 : right - 8;
  const cdAnchor = copy.rtl ? "start" : "end";
  text(c, copy, copy.left, cdX, 46, {
    size: 11,
    opacity: 0.75,
    anchor: cdAnchor,
  });
  text(c, copy, "1:24", cdX, 72, { size: 22, bold: true, anchor: cdAnchor });

  const stripX = left - 4;
  const stripW = right - left + 8;
  c.add(
    `<rect x="${stripX}" y="92" width="${stripW}" height="66" rx="24" fill="#fff" fill-opacity="0.1" stroke="#fff" stroke-opacity="0.16"/>`,
  );
  const w = (stripW - 8) / 5;
  order(copy).forEach((i, k) =>
    cell(c, copy, i, stripX + 4 + k * w, 96, w, 58, {}),
  );
  return c;
}

function prayerTimes(copy) {
  const c = canvas(320, 170);
  background(c);
  const anchor = copy.rtl ? "end" : "start";
  text(c, copy, copy.today, startX(c, copy, 16), 30, {
    size: 15,
    bold: true,
    anchor,
  });
  icon(
    c,
    "location",
    copy.rtl ? c.w - 16 - 12 : 16,
    38,
    12,
    "#fff",
    0.8,
  );
  text(c, copy, copy.city, startX(c, copy, 32), 48, {
    size: 11,
    opacity: 0.8,
    anchor,
  });
  const chipW = 118;
  const chipCx = copy.rtl ? 16 + chipW / 2 : c.w - 16 - chipW / 2;
  chip(
    c,
    copy,
    `${copy.names[NEXT]}${copy.sep}${copy.left} 1:24`,
    chipCx,
    22,
    chipW,
  );
  const w = (320 - 20) / 5;
  order(copy).forEach((i, k) =>
    cell(c, copy, i, 10 + k * w, 70, w, 88, { tile: true, iconFirst: true }),
  );
  return c;
}

function dhikr(copy) {
  const c = canvas(320, 170);
  background(c, true);
  text(c, copy, copy.dhikr, 160, 56, {
    size: 12,
    opacity: 0.8,
    anchor: "middle",
  });
  copy.dhikrText.forEach((line, i) =>
    text(c, copy, line, 160, 92 + i * 26, {
      size: 18,
      bold: true,
      anchor: "middle",
    }),
  );
  return c;
}

function nextSmall(copy) {
  const c = canvas(170, 170);
  background(c);
  text(c, copy, copy.next, 85, 34, {
    size: 11,
    opacity: 0.8,
    anchor: "middle",
  });
  icon(c, ICONS[NEXT], 72, 44, 26, "#fff");
  text(c, copy, copy.names[NEXT], 85, 98, {
    size: 20,
    bold: true,
    anchor: "middle",
  });
  text(c, copy, TIMES[NEXT], 85, 118, {
    size: 15,
    bold: true,
    opacity: 0.9,
    anchor: "middle",
  });
  chip(c, copy, `${copy.left} 1:24`, 85, 128, 92);
  return c;
}

function today(copy) {
  const c = canvas(320, 320);
  background(c);
  text(c, copy, copy.next, 160, 34, {
    size: 12,
    opacity: 0.8,
    anchor: "middle",
  });
  text(c, copy, `${copy.names[NEXT]}${copy.sep}${TIMES[NEXT]}`, 160, 64, {
    size: 24,
    bold: true,
    anchor: "middle",
  });
  chip(c, copy, `${copy.left} 1:24`, 160, 74, 96);
  text(c, copy, `${copy.date}${copy.sep}${copy.city}`, 160, 116, {
    size: 12,
    opacity: 0.8,
    anchor: "middle",
  });
  const top = 128;
  const rowH = (320 - 14 - top) / 5;
  [0, 1, 2, 3, 4].forEach((i) => {
    const y = top + i * rowH;
    const isNext = i === NEXT;
    const passed = i < NEXT;
    const color = isNext ? INK : "#fff";
    const opacity = passed ? 0.55 : 1;
    if (isNext) {
      c.add(
        `<rect x="14" y="${y + 2}" width="292" height="${rowH - 4}" rx="16" fill="${MINT}"/>`,
      );
    }
    const mid = y + rowH / 2;
    const iconX = copy.rtl ? 320 - 26 - 18 : 26;
    icon(c, ICONS[i], iconX, mid - 9, 18, color, opacity);
    text(c, copy, copy.names[i], copy.rtl ? 320 - 54 : 54, mid + 5, {
      size: 14,
      color,
      opacity,
      anchor: copy.rtl ? "end" : "start",
    });
    text(c, copy, TIMES[i], copy.rtl ? 26 : 320 - 26, mid + 5, {
      size: 15,
      bold: true,
      color,
      opacity,
      anchor: endAnchor(copy) === "end" ? "end" : "start",
    });
  });
  return c;
}

function modern(copy) {
  const c = canvas(320, 170);
  const CARD_INK = "#092B38";
  const GRAY = "#667176";
  c.add(`<rect width="320" height="170" fill="#ffffff"/>`);
  const sx = (x) => (copy.rtl ? 320 - x : x);
  const anchor = copy.rtl ? "end" : "start";
  const cx = sx(34);
  c.add(`<circle cx="${cx}" cy="34" r="20" fill="${MID}"/>`);
  icon(c, ICONS[NEXT], cx - 10, 24, 20, "#fff");
  text(c, copy, copy.names[NEXT], sx(64), 28, {
    size: 13,
    bold: true,
    color: CARD_INK,
    anchor,
  });
  text(c, copy, TIMES[NEXT], sx(64), 54, {
    size: 24,
    bold: true,
    color: MID,
    anchor,
  });
  const divider = sx(136);
  c.add(
    `<rect x="${divider}" y="16" width="1" height="36" fill="#E5E7EB"/>`,
  );
  const mid = sx(178);
  text(c, copy, copy.left, mid, 28, {
    size: 11,
    color: GRAY,
    anchor: "middle",
  });
  text(c, copy, "1:24", mid, 50, {
    size: 17,
    bold: true,
    color: CARD_INK,
    anchor: "middle",
  });
  const end = copy.rtl ? 14 : 306;
  const endAnchor = copy.rtl ? "start" : "end";
  const [weekday, rest] = copy.date.split(copy.rtl ? "، " : ", ");
  [copy.city, weekday, rest].forEach((line, i) =>
    text(c, copy, line, end, 24 + i * 15, {
      size: 10.5,
      color: GRAY,
      anchor: endAnchor,
    }),
  );
  const w = (320 - 28) / 5;
  order(copy).forEach((i, k) => {
    const x = 14 + k * w;
    const isNext = i === NEXT;
    const passed = i < NEXT;
    const color = isNext ? "#fff" : CARD_INK;
    const opacity = passed ? 0.55 : 1;
    if (isNext) {
      c.add(
        `<rect x="${x + 2}" y="78" width="${w - 4}" height="78" rx="16" fill="${MID}"/>`,
      );
    }
    const ccx = x + w / 2;
    icon(c, ICONS[i], ccx - 10, 90, 20, isNext ? "#fff" : MID, opacity);
    text(c, copy, copy.names[i], ccx, 128, {
      size: 12,
      bold: true,
      color,
      opacity,
      anchor: "middle",
    });
    text(c, copy, TIMES[i], ccx, 145, {
      size: 12,
      color,
      opacity,
      anchor: "middle",
    });
  });
  return c;
}

const WIDGETS = {
  next_prayer: nextPrayer,
  prayer_times: prayerTimes,
  dhikr,
  next_small: nextSmall,
  today,
  modern,
};

for (const [lang, dir] of [
  ["en", "drawable-nodpi"],
  ["ar", "drawable-ar-nodpi"],
]) {
  const out = path.join(RES, dir);
  fs.mkdirSync(out, { recursive: true });
  for (const [name, build] of Object.entries(WIDGETS)) {
    const svg = build(COPY[lang]).svg();
    const png = new Resvg(svg, {
      background: "rgba(0,0,0,0)",
      font: {
        loadSystemFonts: false,
        fontFiles: [
          "LamaSans-Regular.ttf",
          "LamaSans-ExtraBold.ttf",
          "SpaceGrotesk-Regular.ttf",
          "SpaceGrotesk-Bold.ttf",
        ].map((f) => path.join(FONTS, f)),
        defaultFontFamily: COPY[lang].font,
      },
    })
      .render()
      .asPng();
    const tmp = path.join(os.tmpdir(), `widget_preview_${name}.png`);
    fs.writeFileSync(tmp, png);
    execFileSync("cwebp", [
      "-quiet",
      "-q",
      "90",
      "-alpha_q",
      "100",
      tmp,
      "-o",
      path.join(out, `widget_preview_${name}.webp`),
    ]);
    if (process.env.KEEP_PNG) {
      fs.copyFileSync(tmp, path.join(process.env.KEEP_PNG, `${lang}_${name}.png`));
    }
    fs.rmSync(tmp);
  }
}
fs.rmSync(decorPng);
console.log("rendered widget previews");
